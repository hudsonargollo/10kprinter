import { NonRetryableError } from "cloudflare:workflows";
import { generateTextGemini, generateStructuredGemini, generateStructuredFromImageGemini } from "./gemini";
import { generateTextGroq, generateStructuredGroq, generateStructuredFromImageGroq } from "./groq";

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Combines every provider's error into one message instead of silently swallowing fallback
 * failures — otherwise a fallback that's ALSO failing looks identical to Anthropic failing
 * alone, which made this exact bug invisible once before. Preserves NonRetryableError-ness
 * from the primary error so an unrecoverable Anthropic failure (bad key, no credits) still
 * fails the Workflow step fast when every fallback is also unrecoverably broken — UNLESS the
 * last fallback we tried (Groq) failed with what looks like a transient condition (429 rate
 * limit, or a 5xx), in which case Workflow's built-in step retry/backoff genuinely might
 * succeed on the next attempt, so the combined error must stay retryable.
 */
function isTransientGroqError(groqErr: unknown): boolean {
  if (!(groqErr instanceof Error)) return false;
  // 429 (rate limit) / 5xx (server-side) are textbook transient. "tool_use_failed" — the model
  // ignored the forced tool_choice and wrote prose instead — is observed to be non-deterministic
  // sampling noise (same prompt succeeds on a plain retry), not a malformed request, so it's
  // worth treating as retryable too rather than permanently failing the lead.
  return /API error (429|5\d\d)\b/.test(groqErr.message) || /tool_use_failed/.test(groqErr.message);
}

function combinedError(primary: unknown, geminiErr: unknown, groqErr: unknown): Error {
  const message =
    `Anthropic failed (${errMessage(primary)}); ` +
    `Gemini fallback also failed (${errMessage(geminiErr)}); ` +
    `Groq fallback also failed (${errMessage(groqErr)})`;
  if (isTransientGroqError(groqErr)) return new Error(message);
  return primary instanceof NonRetryableError ? new NonRetryableError(message) : new Error(message);
}

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
  opts: { system: string; user: string; maxTokens?: number; geminiApiKey?: string; groqProxyToken?: string },
): Promise<string> {
  try {
    const response = await callAnthropic(apiKey, {
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages: [{ role: "user", content: opts.user }],
    });

    const textBlock = response.content.find((b): b is AnthropicTextBlock => b.type === "text");
    if (!textBlock) throw new Error("Anthropic response contained no text block");
    return textBlock.text;
  } catch (err) {
    if (!opts.geminiApiKey && !opts.groqProxyToken) throw err;
    let geminiErr: unknown;
    if (opts.geminiApiKey) {
      try {
        return await generateTextGemini(opts.geminiApiKey, {
          system: opts.system,
          user: opts.user,
          maxTokens: opts.maxTokens,
        });
      } catch (e) {
        geminiErr = e;
      }
    }
    if (!opts.groqProxyToken) throw combinedError(err, geminiErr, "no Groq proxy token configured");
    try {
      return await generateTextGroq(opts.groqProxyToken, {
        system: opts.system,
        user: opts.user,
        maxTokens: opts.maxTokens,
      });
    } catch (groqErr) {
      throw combinedError(err, geminiErr, groqErr);
    }
  }
}

/** Tool-forced structured JSON output, validated against the given JSON Schema. */
export async function generateStructured<T>(
  apiKey: string,
  opts: {
    system: string;
    user: string;
    toolName: string;
    schema: Record<string, unknown>;
    maxTokens?: number;
    geminiApiKey?: string;
    groqProxyToken?: string;
  },
): Promise<T> {
  try {
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
  } catch (err) {
    if (!opts.geminiApiKey && !opts.groqProxyToken) throw err;
    let geminiErr: unknown;
    if (opts.geminiApiKey) {
      try {
        return await generateStructuredGemini<T>(opts.geminiApiKey, {
          system: opts.system,
          user: opts.user,
          toolName: opts.toolName,
          schema: opts.schema,
          maxTokens: opts.maxTokens,
        });
      } catch (e) {
        geminiErr = e;
      }
    }
    if (!opts.groqProxyToken) throw combinedError(err, geminiErr, "no Groq proxy token configured");
    try {
      return await generateStructuredGroq<T>(opts.groqProxyToken, {
        system: opts.system,
        user: opts.user,
        toolName: opts.toolName,
        schema: opts.schema,
        maxTokens: opts.maxTokens,
      });
    } catch (groqErr) {
      throw combinedError(err, geminiErr, groqErr);
    }
  }
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
    geminiApiKey?: string;
    groqProxyToken?: string;
  },
): Promise<T> {
  try {
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
  } catch (err) {
    if (!opts.geminiApiKey && !opts.groqProxyToken) throw err;
    let geminiErr: unknown;
    if (opts.geminiApiKey) {
      try {
        return await generateStructuredFromImageGemini<T>(opts.geminiApiKey, {
          system: opts.system,
          user: opts.user,
          imageBase64: opts.imageBase64,
          mediaType: opts.mediaType,
          toolName: opts.toolName,
          schema: opts.schema,
          maxTokens: opts.maxTokens,
        });
      } catch (e) {
        geminiErr = e;
      }
    }
    if (!opts.groqProxyToken) throw combinedError(err, geminiErr, "no Groq proxy token configured");
    try {
      return await generateStructuredFromImageGroq<T>(opts.groqProxyToken, {
        system: opts.system,
        user: opts.user,
        imageBase64: opts.imageBase64,
        mediaType: opts.mediaType,
        toolName: opts.toolName,
        schema: opts.schema,
        maxTokens: opts.maxTokens,
      });
    } catch (groqErr) {
      throw combinedError(err, geminiErr, groqErr);
    }
  }
}
