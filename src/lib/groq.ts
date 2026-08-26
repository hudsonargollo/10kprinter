// Routes through the self-hosted FalaAí proxy at ai.tektone.com.br, which swaps in the real
// Groq key server-side and forwards to Groq's OpenAI-compatible /v1/chat/completions.
const GROQ_PROXY_BASE = "https://ai.tektone.com.br/v1";
// Verified against the live /v1/models catalog on ai.tektone.com.br (Groq-backed):
// text-only, 131072 ctx, supports tools/json_mode/structured_outputs/reasoning.
const GROQ_TEXT_MODEL = "openai/gpt-oss-120b";
// Vision-capable (text+image input), 131072 ctx, supports tools/json_mode/reasoning —
// needed for the brand-tokens step, which sends a screenshot.
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b";

interface GroqToolCall {
  function: { name: string; arguments: string };
}

interface GroqMessage {
  content?: string | null;
  tool_calls?: GroqToolCall[];
}

interface GroqResponse {
  choices?: { message: GroqMessage }[];
}

async function callGroq(proxyToken: string, body: Record<string, unknown>): Promise<GroqResponse> {
  const res = await fetch(`${GROQ_PROXY_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${proxyToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq (via ai.tektone.com.br) API error ${res.status}: ${errText}`);
  }

  return (await res.json()) as GroqResponse;
}

function extractText(response: GroqResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq response contained no text content");
  return content;
}

function extractToolArgs<T>(response: GroqResponse): T {
  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("Groq response contained no tool call");
  try {
    return JSON.parse(toolCall.function.arguments) as T;
  } catch {
    throw new Error(`Groq tool call arguments were not valid JSON: ${toolCall.function.arguments.slice(0, 500)}`);
  }
}

/** Plain text/markdown generation (Groq equivalent of generateText). */
export async function generateTextGroq(
  proxyToken: string,
  opts: { system: string; user: string; maxTokens?: number },
): Promise<string> {
  const response = await callGroq(proxyToken, {
    model: GROQ_TEXT_MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    // gpt-oss-120b defaults to verbose reasoning that eats into the completion budget for no
    // benefit on this kind of task; "low" keeps latency/token spend down without hurting output.
    reasoning_effort: "low",
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  });

  return extractText(response);
}

/** Tool-forced structured JSON output, validated against the given JSON Schema. */
export async function generateStructuredGroq<T>(
  proxyToken: string,
  opts: { system: string; user: string; toolName: string; schema: Record<string, unknown>; maxTokens?: number },
): Promise<T> {
  const response = await callGroq(proxyToken, {
    model: GROQ_TEXT_MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    reasoning_effort: "low",
    messages: [
      // Observed occasionally ignoring a forced tool_choice and writing a prose report instead
      // (esp. with strongly "write a report"-flavored system prompts like the audit rubric) —
      // this explicit nudge measurably reduces that; a retry (transient by design, see
      // isTransientGroqError in anthropic.ts) covers the rest.
      { role: "system", content: `${opts.system}\n\nRespond ONLY by calling the ${opts.toolName} tool with the requested fields. Do not write a prose report.` },
      { role: "user", content: opts.user },
    ],
    tools: [
      {
        type: "function",
        function: { name: opts.toolName, description: `Return ${opts.toolName}`, parameters: opts.schema },
      },
    ],
    tool_choice: { type: "function", function: { name: opts.toolName } },
  });

  return extractToolArgs<T>(response);
}

/** Tool-forced structured JSON output from a vision input (base64 image + prompt) via Groq. */
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
  },
): Promise<T> {
  const response = await callGroq(proxyToken, {
    model: GROQ_VISION_MODEL,
    max_tokens: opts.maxTokens ?? 1024,
    // qwen3.6-27b's default reasoning burns 500+ tokens deliberating over image colors before
    // ever emitting the forced tool call — with a modest max_tokens budget that reliably eats
    // the whole response and leaves the API unable to produce the tool call at all ("Tool choice
    // is required, but model did not call a tool", failed_generation: ""). Verified against the
    // live endpoint: reasoning_effort "none" is the only value this model accepts besides
    // "default", and it produces a direct, correct tool call in ~150 tokens instead.
    reasoning_effort: "none",
    messages: [
      { role: "system", content: opts.system },
      {
        role: "user",
        content: [
          { type: "text", text: opts.user },
          { type: "image_url", image_url: { url: `data:${opts.mediaType};base64,${opts.imageBase64}` } },
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
  });

  return extractToolArgs<T>(response);
}
