const DEFAULT_TEKTONE_IMAGE_URL = "https://ai.tektone.com.br/v1/images/generations";
const GEMINI_IMAGE_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";

interface GeminiImagePart {
  inlineData?: { mimeType: string; data: string };
}

interface GeminiImageResponse {
  candidates?: { content?: { parts?: GeminiImagePart[] } }[];
  promptFeedback?: { blockReason?: string };
}

function base64ToBytes(base64: string): Uint8Array {
  // Strip data:image/...;base64, prefix if present
  const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Generates an image using the self-hosted Tektone AI proxy at ai.tektone.com.br
 * (OpenAI-compatible /v1/images/generations or Fal.ai / Flux proxy).
 */
export async function generateImageTektone(
  token: string,
  opts: {
    prompt: string;
    model?: string;
    size?: string;
    baseUrl?: string;
  },
): Promise<{ bytes: Uint8Array; mimeType: string; url?: string }> {
  const endpoint = opts.baseUrl
    ? opts.baseUrl.replace(/\/+$/, "").endsWith("/images/generations")
      ? opts.baseUrl
      : opts.baseUrl.replace(/\/+$/, "").endsWith("/v1")
      ? `${opts.baseUrl}/images/generations`
      : `${opts.baseUrl}/v1/images/generations`
    : DEFAULT_TEKTONE_IMAGE_URL;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      prompt: opts.prompt,
      model: opts.model || "fal-ai/flux/schnell",
      size: opts.size || "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Tektone AI image API error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as {
    data?: { b64_json?: string; url?: string }[];
  };

  const item = data.data?.[0];
  if (!item) throw new Error("Tektone AI image response contained no image data");

  if (item.b64_json) {
    return { bytes: base64ToBytes(item.b64_json), mimeType: "image/png" };
  }

  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Failed to fetch generated image URL: ${imgRes.status}`);
    const mimeType = imgRes.headers.get("content-type") || "image/png";
    const arrayBuffer = await imgRes.arrayBuffer();
    return { bytes: new Uint8Array(arrayBuffer), mimeType, url: item.url };
  }

  throw new Error("Tektone AI image response did not contain b64_json or url");
}

/**
 * Generates a single on-brand cover/hero image via Gemini's image-capable model.
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

/**
 * Unified image generator: tries Tektone AI (ai.tektone.com.br) first if token available,
 * then falls back to Gemini.
 */
export async function generateCoverImage(opts: {
  prompt: string;
  tektoneToken?: string;
  tektoneEndpoint?: string;
  geminiApiKey?: string;
}): Promise<{ bytes: Uint8Array; mimeType: string }> {
  let tektoneErr: unknown = null;

  if (opts.tektoneToken) {
    try {
      return await generateImageTektone(opts.tektoneToken, {
        prompt: opts.prompt,
        baseUrl: opts.tektoneEndpoint,
      });
    } catch (e) {
      tektoneErr = e;
    }
  }

  if (opts.geminiApiKey) {
    try {
      return await generateCoverImageGemini(opts.geminiApiKey, { prompt: opts.prompt });
    } catch (geminiErr) {
      const msg = `Tektone AI image failed (${tektoneErr instanceof Error ? tektoneErr.message : String(tektoneErr)}); Gemini image failed (${geminiErr instanceof Error ? geminiErr.message : String(geminiErr)})`;
      throw new Error(msg);
    }
  }

  if (tektoneErr) throw tektoneErr;
  throw new Error("No image generation API credentials configured (neither Tektone AI nor Gemini)");
}
