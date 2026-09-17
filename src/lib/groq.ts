// Routes through the self-hosted AI proxy at ai.tektone.com.br (or custom TEKTONE_AI_ENDPOINT),
// which forwards to OpenAI-compatible /v1/chat/completions.
const DEFAULT_TEKTONE_AI_BASE = "https://ai.tektone.com.br/v1";

// Verified models on ai.tektone.com.br:
const TEKTONE_TEXT_MODEL = "openai/gpt-oss-120b";
const TEKTONE_VISION_MODEL = "qwen/qwen3.6-27b";

interface TektoneToolCall {
  function: { name: string; arguments: string };
}

interface TektoneMessage {
  content?: string | null;
  tool_calls?: TektoneToolCall[];
}

interface TektoneResponse {
  choices?: { message: TektoneMessage }[];
}

async function callTektoneAi(
  token: string,
  body: Record<string, unknown>,
  baseUrl = DEFAULT_TEKTONE_AI_BASE
): Promise<TektoneResponse> {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const url = cleanBase.endsWith("/v1") ? `${cleanBase}/chat/completions` : `${cleanBase}/v1/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Tektone AI (${cleanBase}) API error ${res.status}: ${errText}`);
  }

  return (await res.json()) as TektoneResponse;
}

function extractText(response: TektoneResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Tektone AI response contained no text content");
  return content;
}

function extractToolArgs<T>(response: TektoneResponse): T {
  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("Tektone AI response contained no tool call");
  try {
    return JSON.parse(toolCall.function.arguments) as T;
  } catch {
    throw new Error(`Tektone AI tool call arguments were not valid JSON: ${toolCall.function.arguments.slice(0, 500)}`);
  }
}

/** Plain text/markdown generation using Tektone AI endpoint. */
export async function generateTextGroq(
  proxyToken: string,
  opts: { system: string; user: string; maxTokens?: number; baseUrl?: string },
): Promise<string> {
  const response = await callTektoneAi(
    proxyToken,
    {
      model: TEKTONE_TEXT_MODEL,
      max_tokens: opts.maxTokens ?? 4096,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    },
    opts.baseUrl
  );

  return extractText(response);
}

/** Tool-forced structured JSON output, validated against the given JSON Schema. */
export async function generateStructuredGroq<T>(
  proxyToken: string,
  opts: {
    system: string;
    user: string;
    toolName: string;
    schema: Record<string, unknown>;
    maxTokens?: number;
    baseUrl?: string;
  },
): Promise<T> {
  const response = await callTektoneAi(
    proxyToken,
    {
      model: TEKTONE_TEXT_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content: `${opts.system}\n\nRespond ONLY by calling the ${opts.toolName} tool with the requested fields. Do not write a prose report.`,
        },
        { role: "user", content: opts.user },
      ],
      tools: [
        {
          type: "function",
          function: { name: opts.toolName, description: `Return ${opts.toolName}`, parameters: opts.schema },
        },
      ],
      tool_choice: { type: "function", function: { name: opts.toolName } },
    },
    opts.baseUrl
  );

  return extractToolArgs<T>(response);
}

/** Tool-forced structured JSON output from a vision input (base64 image + prompt). */
export async function generateStructuredFromImageGroq<T>(
  proxyToken: string,
  opts: {
    system: string;
    user: string;
    imageBase64: string;
    mediaType: "image/png" | "image/jpeg" | "image/webp";
    toolName: string;
    schema: Record<string, unknown>;
    maxTokens?: number;
    baseUrl?: string;
  },
): Promise<T> {
  const dataUrl = `data:${opts.mediaType};base64,${opts.imageBase64}`;
  const response = await callTektoneAi(
    proxyToken,
    {
      model: TEKTONE_VISION_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content: `${opts.system}\n\nRespond ONLY by calling the ${opts.toolName} tool with the requested fields. Do not write a prose report.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: opts.user },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: { name: opts.toolName, description: `Return ${opts.toolName}`, parameters: opts.schema },
        },
      ],
      tool_choice: { type: "function", function: { name: opts.toolName } },
    },
    opts.baseUrl
  );

  return extractToolArgs<T>(response);
}

export const generateTextTektone = generateTextGroq;
export const generateStructuredTektone = generateStructuredGroq;
export const generateStructuredFromImageTektone = generateStructuredFromImageGroq;
