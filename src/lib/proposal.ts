import type { AuditFinding, BrandTokens, LeadRow, ScrapeSummary } from "../types";
import type { AppLanguage } from "./language";

// Mirrors dashboard/src/types.ts's CONSULT_ADDON_USD — keep both in sync if this ever changes.
const CONSULT_ADDON_USD = 100;

export function buildCoverImagePrompt(brandTokens: BrandTokens): string {
  return (
    `Abstract crystalline geometric gradient composition, premium minimal tech aesthetic, soft ` +
    `directional glow lighting, wide 16:9 hero-banner framing filling the entire frame, dominant ` +
    `colors ${brandTokens.primary} and ${brandTokens.background}, 4K, high detail, no text, no logos, ` +
    `no watermark, no readable signage, no people, no real-world objects or storefronts.`
  );
}

export function buildWaLink(phone: string | null, text = ""): string | null {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const withCC = digits.length === 10 ? `1${digits}` : digits;
  return `https://wa.me/${withCC}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface ProposalInput {
  lead: LeadRow;
  verticalLabel: string;
  scrapeSummary: ScrapeSummary;
  finding: AuditFinding;
  brandTokens: BrandTokens;
  priceUsd: number;
  coverImageUrl: string;
  waLink: string | null;
  lang?: AppLanguage;
}

const PROPOSAL_I18N = {
  en: {
    titleSuffix: "Proposal",
    proofHeading: "What's already working",
    fixesHeading: "What we'd fix",
    offerHeading: "The offer",
    consultAddon: "Strategy consult add-on",
    total: "Total",
    ctaHeading: "Ready to see it built?",
    ctaSub: "Book the $100 strategy hour — it's applied toward the project above.",
    ctaButton: "Book on WhatsApp",
  },
  pt: {
    titleSuffix: "Proposta",
    proofHeading: "O que já está funcionando",
    fixesHeading: "O que vamos corrigir",
    offerHeading: "A Proposta",
    consultAddon: "Consultoria estratégica adicional",
    total: "Total",
    ctaHeading: "Pronto para ver pronto?",
    ctaSub: "Agende a consultoria estratégica de US$ 100 — valor abatido no projeto acima.",
    ctaButton: "Conversar no WhatsApp",
  },
  es: {
    titleSuffix: "Propuesta",
    proofHeading: "Lo que ya funciona",
    fixesHeading: "Lo que corregiremos",
    offerHeading: "La Oferta",
    consultAddon: "Consultoría estratégica adicional",
    total: "Total",
    ctaHeading: "¿Listo para verlo construido?",
    ctaSub: "Agenda la consultoría estratégica de US$ 100 — se aplica al proyecto de arriba.",
    ctaButton: "Escribir por WhatsApp",
  },
};

export function buildProposalHtml(input: ProposalInput): string {
  const { lead, verticalLabel, scrapeSummary, finding, brandTokens, priceUsd, coverImageUrl, waLink, lang = "en" } = input;
  const t = PROPOSAL_I18N[lang] || PROPOSAL_I18N.en;
  const businessName = lead.business_name ?? lead.url;
  const valueProp = scrapeSummary.metaDescription || scrapeSummary.title || "";
  const proof = finding.good.slice(0, 3);
  const fixes = finding.bad.slice(0, 3).map((bad, i) => ({ bad, fix: finding.fix[i] ?? finding.fix[0] ?? "" }));

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(businessName)} — ${esc(verticalLabel)} ${t.titleSuffix}</title>
<style>
  :root {
    --primary: ${brandTokens.primary};
    --background: ${brandTokens.background};
    --background-alt: ${brandTokens.backgroundAlt};
    --text-on-primary: ${brandTokens.textOnPrimary};
    --text-on-background: ${brandTokens.textOnBackground};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--background); color: var(--text-on-background);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5;
  }
  .hero {
    position: relative; min-height: 60vh; display: flex; align-items: flex-end;
    background-image: url("${esc(coverImageUrl)}"); background-size: cover; background-position: center;
    padding: 3rem 1.5rem;
  }
  .hero::before {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(to top, ${brandTokens.background} 5%, transparent 70%);
  }
  .hero-content { position: relative; max-width: 720px; margin: 0 auto; text-align: center; color: var(--text-on-primary); }
  .hero h1 { font-size: clamp(1.75rem, 5vw, 3rem); font-weight: 800; margin: 0 0 0.75rem; letter-spacing: -0.02em; }
  .hero p { font-size: 1.05rem; opacity: 0.9; margin: 0; }
  section { max-width: 720px; margin: 0 auto; padding: 3rem 1.5rem; }
  .proof { background: var(--background-alt); }
  .proof ul, .fixes ul { list-style: none; padding: 0; margin: 1rem 0 0; }
  .proof li { padding: 0.75rem 1rem; margin-bottom: 0.5rem; background: var(--background); border-radius: 8px; }
  .fix-item { padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid var(--primary); background: var(--background-alt); border-radius: 0 8px 8px 0; }
  .fix-item .bad { font-size: 0.85rem; opacity: 0.65; text-decoration: line-through; }
  .fix-item .fix { font-weight: 600; margin-top: 0.25rem; }
  h2 { font-size: 1.5rem; margin: 0 0 0.5rem; }
  .offer { background: var(--primary); color: var(--text-on-primary); border-radius: 16px; }
  .offer .line-item { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.2); }
  .offer .total { display: flex; justify-content: space-between; padding-top: 1rem; font-size: 1.25rem; font-weight: 800; }
  .cta { text-align: center; }
  .cta a { display: inline-block; margin-top: 1rem; padding: 1rem 2rem; background: var(--primary); color: var(--text-on-primary); border-radius: 999px; text-decoration: none; font-weight: 700; }
</style>
</head>
<body>
  <div class="hero">
    <div class="hero-content">
      <h1>${esc(businessName)}</h1>
      ${valueProp ? `<p>${esc(valueProp)}</p>` : ""}
    </div>
  </div>

  ${
    proof.length
      ? `<section class="proof">
    <h2>${t.proofHeading}</h2>
    <ul>${proof.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
  </section>`
      : ""
  }

  <section class="fixes">
    <h2>${t.fixesHeading}</h2>
    ${fixes
      .map(
        (f) =>
          `<div class="fix-item">${f.bad ? `<div class="bad">${esc(f.bad)}</div>` : ""}<div class="fix">${esc(f.fix)}</div></div>`,
      )
      .join("")}
  </section>

  <section class="offer">
    <h2>${t.offerHeading}</h2>
    <div class="line-item"><span>${esc(verticalLabel)}</span><span>$${priceUsd}</span></div>
    <div class="line-item"><span>${t.consultAddon}</span><span>$${CONSULT_ADDON_USD}</span></div>
    <div class="total"><span>${t.total}</span><span>$${priceUsd + CONSULT_ADDON_USD}</span></div>
  </section>

  <section class="cta">
    <h2>${t.ctaHeading}</h2>
    <p>${t.ctaSub}</p>
    ${waLink ? `<a href="${esc(waLink)}" target="_blank" rel="noopener">${t.ctaButton}</a>` : ""}
  </section>
</body>
</html>`;
}
