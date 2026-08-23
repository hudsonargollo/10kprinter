import { NonRetryableError } from "cloudflare:workflows";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-5";

interface AnthropicTextBlock {
  type: "text";
  text: string;
}

interface AnthropicToolUseBlock {
  type: "tool_use";
  name: string;
  input: unknown;
}

type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUseBlock;

interface AnthropicResponse {
  content: AnthropicContentBlock[];
}

async function callAnthropic(apiKey: string, body: Record<string, unknown>): Promise<AnthropicResponse> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, ...body }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const message = `Anthropic API error ${res.status}: ${errText}`;
    // 400/401 (bad request, auth, insufficient credits) will never self-resolve on retry —
    // fail the step immediately instead of burning through Workflows' default 5 retries with
    // exponential backoff. 429/5xx (rate limit, overload) are transient and should retry.
    if (res.status === 400 || res.status === 401) {
      throw new NonRetryableError(message);
    }
    throw new Error(message);
  }

  return (await res.json()) as AnthropicResponse;
}

/** Plain text/markdown generation (used for PRD authoring). */
export async function generateText(
  apiKey: string,
  opts: { system: string; user: string; maxTokens?: number },
): Promise<string> {
  const response = await callAnthropic(apiKey, {
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  const textBlock = response.content.find((b): b is AnthropicTextBlock => b.type === "text");
  if (!textBlock) throw new Error("Anthropic response contained no text block");
  return textBlock.text;
}

/** Tool-forced structured JSON output, validated against the given JSON Schema. */
export async function generateStructured<T>(
  apiKey: string,
  opts: { system: string; user: string; toolName: string; schema: Record<string, unknown>; maxTokens?: number },
): Promise<T> {
  const response = await callAnthropic(apiKey, {
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
    tools: [{ name: opts.toolName, description: `Return ${opts.toolName}`, input_schema: opts.schema }],
    tool_choice: { type: "tool", name: opts.toolName },
  });

  const toolBlock = response.content.find((b): b is AnthropicToolUseBlock => b.type === "tool_use");
  if (!toolBlock) throw new Error("Anthropic response contained no tool_use block");
  return toolBlock.input as T;
}

/** Tool-forced structured JSON output from a vision input (base64 image + prompt). */
export async function generateStructuredFromImage<T>(
  apiKey: string,
  opts: {
    system: string;
    user: string;
    imageBase64: string;
    mediaType: "image/png" | "image/jpeg" | "image/webp";
    toolName: string;
    schema: Record<string, unknown>;
    maxTokens?: number;
  },
): Promise<T> {
  const response = await callAnthropic(apiKey, {
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: opts.mediaType, data: opts.imageBase64 } },
          { type: "text", text: opts.user },
        ],
      },
    ],
    tools: [{ name: opts.toolName, description: `Return ${opts.toolName}`, input_schema: opts.schema }],
    tool_choice: { type: "tool", name: opts.toolName },
  });

  const toolBlock = response.content.find((b): b is AnthropicToolUseBlock => b.type === "tool_use");
  if (!toolBlock) throw new Error("Anthropic response contained no tool_use block");
  return toolBlock.input as T;
}
