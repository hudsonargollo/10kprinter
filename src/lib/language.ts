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

export const VERTICAL_LABELS_I18N: Record<AppLanguage, Record<string, string>> = {
  es: {
    "website-redesign": "Rediseño de Sitio Web",
    "marketing-automation": "Automatización de Marketing",
    "email-marketing": "Email Marketing",
    "social-media": "Gestión de Redes Sociales",
  },
  pt: {
    "website-redesign": "Redesign de Website",
    "marketing-automation": "Automação de Marketing",
    "email-marketing": "Email Marketing",
    "social-media": "Gestão de Redes Sociais",
  },
  en: {
    "website-redesign": "Website Redesign",
    "marketing-automation": "Marketing Automation",
    "email-marketing": "Email Marketing",
    "social-media": "Social Media Management",
  },
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
  const normExplicit = (explicitLang || "").toLowerCase().trim();
  if (normExplicit === "pt" || normExplicit === "es") {
    return normExplicit as AppLanguage;
  }
  if (normExplicit === "en" && !region && !url && !bodyText) {
    return "en";
  }

  const normRegion = (region || "").toLowerCase();
  if (
    normRegion.includes("brazil") ||
    normRegion.includes("brasil") ||
    normRegion.includes("são paulo") ||
    normRegion.includes("sao paulo") ||
    normRegion.includes("rio") ||
    normRegion.includes("portugal") ||
    normRegion.includes("lisboa") ||
    normRegion.includes("porto") ||
    normRegion.includes("curitiba") ||
    normRegion.includes("florianópolis") ||
    normRegion.includes("florianopolis") ||
    normRegion.includes("belo horizonte") ||
    normRegion.includes("porto alegre") ||
    normRegion.includes("salvador") ||
    normRegion.includes("recife") ||
    normRegion.includes("fortaleza") ||
    normRegion.includes("brasilia") ||
    normRegion.includes("brasília") ||
    normRegion.includes("campinas") ||
    normRegion.includes("goiania") ||
    normRegion.includes("goiânia") ||
    normRegion.includes("manaus") ||
    normRegion.includes("belem") ||
    normRegion.includes("belém")
  ) {
    return "pt";
  }

  if (
    normRegion.includes("bolivia") ||
    normRegion.includes("santa cruz") ||
    normRegion.includes("la paz") ||
    normRegion.includes("cochabamba") ||
    normRegion.includes("sucre") ||
    normRegion.includes("tarija") ||
    normRegion.includes("spain") ||
    normRegion.includes("españa") ||
    normRegion.includes("madrid") ||
    normRegion.includes("barcelona") ||
    normRegion.includes("valencia") ||
    normRegion.includes("sevilla") ||
    normRegion.includes("mexico") ||
    normRegion.includes("méxico") ||
    normRegion.includes("cdmx") ||
    normRegion.includes("guadalajara") ||
    normRegion.includes("monterrey") ||
    normRegion.includes("argentina") ||
    normRegion.includes("buenos aires") ||
    normRegion.includes("cordoba") ||
    normRegion.includes("córdoba") ||
    normRegion.includes("colombia") ||
    normRegion.includes("bogota") ||
    normRegion.includes("bogotá") ||
    normRegion.includes("medellin") ||
    normRegion.includes("medellín") ||
    normRegion.includes("cali") ||
    normRegion.includes("chile") ||
    normRegion.includes("santiago") ||
    normRegion.includes("peru") ||
    normRegion.includes("perú") ||
    normRegion.includes("lima") ||
    normRegion.includes("uruguay") ||
    normRegion.includes("montevideo") ||
    normRegion.includes("paraguay") ||
    normRegion.includes("asuncion") ||
    normRegion.includes("asunción") ||
    normRegion.includes("ecuador") ||
    normRegion.includes("quito") ||
    normRegion.includes("guayaquil") ||
    normRegion.includes("venezuela") ||
    normRegion.includes("caracas") ||
    normRegion.includes("costa rica") ||
    normRegion.includes("panama") ||
    normRegion.includes("panamá") ||
    normRegion.includes("dominicana") ||
    normRegion.includes("guatemala")
  ) {
    return "es";
  }

  const normUrl = (url || "").toLowerCase();
  if (
    normUrl.endsWith(".br") ||
    normUrl.includes(".com.br") ||
    normUrl.includes(".net.br") ||
    normUrl.includes(".org.br") ||
    normUrl.endsWith(".pt")
  ) {
    return "pt";
  }
  if (
    normUrl.endsWith(".es") ||
    normUrl.includes(".com.es") ||
    normUrl.endsWith(".mx") ||
    normUrl.includes(".com.mx") ||
    normUrl.endsWith(".ar") ||
    normUrl.includes(".com.ar") ||
    normUrl.endsWith(".bo") ||
    normUrl.includes(".com.bo") ||
    normUrl.endsWith(".cl") ||
    normUrl.endsWith(".co") ||
    normUrl.includes(".com.co") ||
    normUrl.endsWith(".pe") ||
    normUrl.includes(".com.pe") ||
    normUrl.endsWith(".uy") ||
    normUrl.includes(".com.uy") ||
    normUrl.endsWith(".py") ||
    normUrl.endsWith(".ec") ||
    normUrl.endsWith(".cr") ||
    normUrl.endsWith(".pa") ||
    normUrl.endsWith(".gt")
  ) {
    return "es";
  }

  if (bodyText) {
    const textSample = bodyText.slice(0, 3000).toLowerCase();
    const ptScore = (
      textSample.match(
        /\b(para|com|não|nao|mais|você|voce|serviços|servicos|contato|empresa|sobre|nossos|nossa|todos|direitos|reservados|horário|horario|atendimento|endereço|endereco|telefone|saiba|conheça|conheca|produtos|clientes|equipe|fale|conosco|orçamento|orcamento|agende|obrigado)\b/g
      ) || []
    ).length;
    const esScore = (
      textSample.match(
        /\b(para|con|más|mas|usted|servicios|contacto|empresa|sobre|nuestros|nuestra|bienvenidos|todos|derechos|reservados|horario|atención|atencion|dirección|direccion|teléfono|telefono|conoce|productos|clientes|equipo|habla|nosotros|consulta|agenda|solicita|gracias|cotización|cotizacion)\b/g
      ) || []
    ).length;

    if (ptScore >= 2 && ptScore >= esScore) return "pt";
    if (esScore >= 2) return "es";
  }

  if (normExplicit === "en") return "en";

  return "en";
}

/**
 * Returns a strict prompt instruction for LLMs enforcing output language.
 */
export function getLanguagePromptInstruction(lang: AppLanguage): string {
  switch (lang) {
    case "pt":
      return `\n\n[STRICT LANGUAGE REQUIREMENT - PORTUGUÊS / PORTUGUESE]
You MUST generate all output, findings ('good', 'bad', 'fix' items), markdown, section headers, technical requirements, rationale, and copy suggestions ENTIRELY in Portuguese (Português).
- Every single 'good' finding item MUST be in natural Portuguese.
- Every single 'bad' finding item MUST be in natural Portuguese.
- Every single 'fix' finding item MUST be in natural Portuguese.
- Any PRD, pitch, or proposal copy MUST be written entirely in Portuguese.
Do NOT mix in English unless referring to specific technical code tokens or standard framework names.`;
    case "es":
      return `\n\n[STRICT LANGUAGE REQUIREMENT - ESPAÑOL / SPANISH]
You MUST generate all output, findings ('good', 'bad', 'fix' items), markdown, section headers, technical requirements, rationale, and copy suggestions ENTIRELY in Spanish (Español).
- Every single 'good' finding item MUST be in natural Spanish.
- Every single 'bad' finding item MUST be in natural Spanish.
- Every single 'fix' finding item MUST be in natural Spanish.
- Any PRD, pitch, or proposal copy MUST be written entirely in Spanish.
Do NOT mix in English unless referring to specific technical code tokens or standard framework names.`;
    case "en":
    default:
      return `\n\n[STRICT LANGUAGE REQUIREMENT - ENGLISH]
You MUST generate all text, findings ('good', 'bad', 'fix' items), PRD markdown, and copy in English.`;
  }
}
