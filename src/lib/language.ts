export type AppLanguage = "en" | "pt" | "es";

export interface LanguageInfo {
  code: AppLanguage;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Record<AppLanguage, LanguageInfo> = {
  en: { code: "en", name: "English", nativeName: "English" },
  pt: { code: "pt", name: "Portuguese", nativeName: "Português" },
  es: { code: "es", name: "Spanish", nativeName: "Español" },
};

/**
 * Resolves the target generation language based on explicit preference,
 * region name, website URL domain, or scraped body text.
 */
export function resolveTargetLanguage(
  explicitLang?: string | null,
  region?: string | null,
  url?: string | null,
  bodyText?: string | null
): AppLanguage {
  if (explicitLang && ["en", "pt", "es"].includes(explicitLang.toLowerCase())) {
    return explicitLang.toLowerCase() as AppLanguage;
  }

  const normRegion = (region || "").toLowerCase();
  if (
    normRegion.includes("brazil") ||
    normRegion.includes("brasil") ||
    normRegion.includes("são paulo") ||
    normRegion.includes("sao paulo") ||
    normRegion.includes("rio") ||
    normRegion.includes("portugal") ||
    normRegion.includes("curitiba") ||
    normRegion.includes("florianópolis") ||
    normRegion.includes("belo horizonte")
  ) {
    return "pt";
  }

  if (
    normRegion.includes("bolivia") ||
    normRegion.includes("santa cruz") ||
    normRegion.includes("spain") ||
    normRegion.includes("españa") ||
    normRegion.includes("mexico") ||
    normRegion.includes("méxico") ||
    normRegion.includes("argentina") ||
    normRegion.includes("colombia") ||
    normRegion.includes("chile") ||
    normRegion.includes("peru") ||
    normRegion.includes("perú") ||
    normRegion.includes("madrid") ||
    normRegion.includes("barcelona") ||
    normRegion.includes("buenos aires")
  ) {
    return "es";
  }

  const normUrl = (url || "").toLowerCase();
  if (normUrl.endsWith(".br") || normUrl.includes(".com.br") || normUrl.endsWith(".pt")) {
    return "pt";
  }
  if (
    normUrl.endsWith(".es") ||
    normUrl.endsWith(".mx") ||
    normUrl.endsWith(".ar") ||
    normUrl.endsWith(".bo") ||
    normUrl.endsWith(".cl") ||
    normUrl.endsWith(".co") ||
    normUrl.endsWith(".pe")
  ) {
    return "es";
  }

  if (bodyText) {
    const textSample = bodyText.slice(0, 2000).toLowerCase();
    const ptScore = (textSample.match(/\b(para|com|não|mais|você|serviços|contato|empresa|sobre|nossos)\b/g) || []).length;
    const esScore = (textSample.match(/\b(para|con|más|usted|servicios|contacto|empresa|sobre|nuestros|bienvenidos)\b/g) || []).length;

    if (ptScore > 5 && ptScore > esScore) return "pt";
    if (esScore > 5) return "es";
  }

  return "en";
}

/**
 * Returns a strict prompt instruction for LLMs enforcing output language.
 */
export function getLanguagePromptInstruction(lang: AppLanguage): string {
  switch (lang) {
    case "pt":
      return `\n\n[STRICT LANGUAGE REQUIREMENT]\nYou MUST write all generated text, findings ('good', 'bad', 'fix' items), markdown, section headers, technical requirements, rationale, and copy suggestions entirely in Portuguese (Português). Do not mix in English unless referring to specific technical code tokens or standard framework names.`;
    case "es":
      return `\n\n[STRICT LANGUAGE REQUIREMENT]\nYou MUST write all generated text, findings ('good', 'bad', 'fix' items), markdown, section headers, technical requirements, rationale, and copy suggestions entirely in Spanish (Español). Do not mix in English unless referring to specific technical code tokens or standard framework names.`;
    case "en":
    default:
      return `\n\n[STRICT LANGUAGE REQUIREMENT]\nYou MUST write all generated text, findings, and markdown in English.`;
  }
}
