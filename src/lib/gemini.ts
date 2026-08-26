const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Try the fastest current model first; fall back to an older one if this key/project
// doesn't have access to it yet (surfaces as a 404 on the model resource). Google retires
// model IDs outright (not just deprecates) — verified live 2026-08-26 that both
// gemini-2.5-flash and gemini-2.0-flash now 404 with "no longer available to new users"
// for this project's key, silently breaking this entire fallback tier. Re-verify against
// https://generativelanguage.googleapis.com/v1beta/models if this list 404s again.
const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-flash-latest"];

interface GeminiPart {
  text?: string;
  inline_data?: { mime_type: string; data: string };
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

async function callGemini(apiKey: string, body: Record<string, unknown>): Promise<GeminiResponse> {
  let lastErr: Error | null = null;

  for (const model of GEMINI_MODELS) {
    const res = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return (await res.json()) as GeminiResponse;
    }

    const errText = await res.text();
    const message = `Gemini API error ${res.status} (model=${model}): ${errText}`;
    // 404 usually means this model id isn't available for this key/project yet — try the next one.
    if (res.status === 404) {
      lastErr = new Error(message);
      continue;
    }
    throw new Error(message);
  }

  throw lastErr ?? new Error("Gemini API error: no models available");
}

function extractText(response: GeminiResponse): string {
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) throw new Error(`Gemini blocked the prompt: ${blockReason}`);

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const textPart = parts.find((p): p is GeminiPart & { text: string } => typeof p.text === "string");
  if (!textPart) throw new Error("Gemini response contained no text part");
  return textPart.text;
}

/** Plain text/markdown generation (Gemini equivalent of generateText). */
export async function generateTextGemini(
  apiKey: string,
  opts: { system: string; user: string; maxTokens?: number },
): Promise<string> {
  const response = await callGemini(apiKey, {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: "user", parts: [{ text: opts.user }] }],
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 4096,
    },
  });

  return extractText(response);
}

/** Structured JSON output via Gemini's native responseSchema, validated against the given JSON Schema. */
export async function generateStructuredGemini<T>(
  apiKey: string,
  opts: { system: string; user: string; toolName: string; schema: Record<string, unknown>; maxTokens?: number },
): Promise<T> {
  const response = await callGemini(apiKey, {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: "user", parts: [{ text: opts.user }] }],
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 2048,
      responseMimeType: "application/json",
      responseSchema: opts.schema,
    },
  });

  const text = extractText(response);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini structured response was not valid JSON: ${text.slice(0, 500)}`);
  }
}

/** Structured JSON output from a vision input (base64 image + prompt) via Gemini. */
export async function generateStructuredFromImageGemini<T>(
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
  const response = await callGemini(apiKey, {
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [
      {
        role: "user",
        parts: [
          { inline_data: { mime_type: opts.mediaType, data: opts.imageBase64 } },
          { text: opts.user },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 1024,
      responseMimeType: "application/json",
      responseSchema: opts.schema,
    },
  });

  const text = extractText(response);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Gemini structured response was not valid JSON: ${text.slice(0, 500)}`);
  }
}
