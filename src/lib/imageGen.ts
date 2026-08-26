const GEMINI_IMAGE_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// Verified live 2026-08-26 against the existing GEMINI_API_KEY (no new secret needed) — returns
// a real inline image part. gemini-3-pro-image exists but was consistently 503 (overloaded) in
// testing; flash is the pragmatic choice for a per-lead pipeline step.
const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";

interface GeminiImagePart {
  inlineData?: { mimeType: string; data: string };
}

interface GeminiImageResponse {
  candidates?: { content?: { parts?: GeminiImagePart[] } }[];
  promptFeedback?: { blockReason?: string };
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Generates a single on-brand cover/hero image via Gemini's image-capable model. Callers MUST
 * build `opts.prompt` from an abstract/brand-driven template (see design/VISUAL_PROMPT_LIBRARY.md)
 * — never a prompt asking for a photorealistic depiction of the real business's people, premises,
 * or product (see AGENTS.md's "Never" section).
 */
export async function generateCoverImageGemini(
  apiKey: string,
  opts: { prompt: string },
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const res = await fetch(`${GEMINI_IMAGE_API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: opts.prompt }] }] }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini image API error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as GeminiImageResponse;
  const blockReason = data.promptFeedback?.blockReason;
  if (blockReason) throw new Error(`Gemini blocked the image prompt: ${blockReason}`);

  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData) throw new Error("Gemini image response contained no inline image data");

  return { bytes: base64ToBytes(part.inlineData.data), mimeType: part.inlineData.mimeType };
}
