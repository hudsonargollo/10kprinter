/**
 * Builds a wa.me click-to-chat link. Leads here are US businesses scraped
 * via Google Places, so a bare 10-digit number needs a leading "1", not a
 * Brazil "55" prefix. An already-11-digit number starting with 1 is left
 * as-is; anything else passes through raw so it can still be fixed manually.
 */
export function waLink(phone?: string | null, text = ""): string | null {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const withCC = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${withCC}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
