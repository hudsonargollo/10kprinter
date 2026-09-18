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
    titleSuffix: "Modernization Proposal",
    badge: "CONFIDENTIAL PROPOSAL",
    proofHeading: "What's Already Working",
    proofSub: "Strengths identified on your current web properties",
    fixesHeading: "Conversion Frictions & Leaks",
    fixesSub: "Identified revenue leaks and exact engineered solutions",
    roadmapHeading: "7-Day Rapid Implementation Roadmap",
    roadmapSub: "From agreement to live production deployment",
    roadmapSteps: [
      { day: "Day 1-2", title: "Architecture & Design System", desc: "Tailwind tokens, typography hierarchy, high-contrast assets, and responsive wireframes." },
      { day: "Day 3-4", title: "Component Build & Automations", desc: "Framer Motion interactions, lead funnels, and CRM / n8n workflow routing." },
      { day: "Day 5-6", title: "WhatsApp & Conversion Engine", desc: "Instant click-to-chat capture, multi-step qualification, and SEO optimization." },
      { day: "Day 7", title: "QA, DNS Cutover & Launch", desc: "Live domain cutover on Cloudflare Edge with 100% uptime SLA." },
    ],
    offerHeading: "Investment Structure",
    setupLabel: "One-Time Implementation",
    consultAddon: "Executive Strategy Consult (Hudson Argollo)",
    totalSetup: "Total One-Time Implementation",
    recurringHeading: "Ongoing Growth & Maintenance (Optional)",
    recurringPlan: "Monthly Hosting, Edge CDN, CRM Sync & Security",
    recurringPrice: "$97 / month",
    ctaHeading: "Ready to accelerate your revenue pipeline?",
    ctaSub: "Lock in your build slot on WhatsApp or schedule your 1-hour strategy kickoff.",
    ctaButton: "Accept & Chat on WhatsApp",
  },
  pt: {
    titleSuffix: "Proposta de Modernização",
    badge: "PROPOSTA CONFIDENCIAL",
    proofHeading: "O Que Já Está Funcionando",
    proofSub: "Pontos fortes identificados na sua presença digital atual",
    fixesHeading: "Fricções de Conversão & Fugas de Receita",
    fixesSub: "Gargalos identificados e soluções técnicas desenvolvidas",
    roadmapHeading: "Cronograma de Entrega Ágil em 7 Dias",
    roadmapSub: "Do fechamento à publicação em produção",
    roadmapSteps: [
      { day: "Dia 1-2", title: "Arquitetura & Design System", desc: "Tokens Tailwind, tipografia de alto impacto, ativos visuais e wireframes responsivos." },
      { day: "Dia 3-4", title: "Construção de Componentes & Automações", desc: "Interações Framer Motion, funis de captura e roteamento n8n / CRM." },
      { day: "Dia 5-6", title: "Motor de Conversão & WhatsApp", desc: "Captura direta via WhatsApp, qualificação em etapas e otimização de velocidade." },
      { day: "Dia 7", title: "Homologação, DNS & Lançamento", desc: "Virada de domínio na Cloudflare Edge com redundância e SSL global." },
    ],
    offerHeading: "Estrutura do Investimento",
    setupLabel: "Implementação e Entrega Completa",
    consultAddon: "Consultoria Estratégica Executiva (Hudson Argollo)",
    totalSetup: "Total da Implementação",
    recurringHeading: "Manutenção e Crescimento Contínuo (Opcional)",
    recurringPlan: "Hospedagem Edge, CDN Global, Monitoramento & Suporte CRM",
    recurringPrice: "US$ 97 / mês",
    ctaHeading: "Pronto para acelerar suas conversões?",
    ctaSub: "Garanta a sua vaga de implementação diretamente no WhatsApp.",
    ctaButton: "Aprovar no WhatsApp",
  },
  es: {
    titleSuffix: "Propuesta de Modernización",
    badge: "PROPUESTA CONFIDENCIAL",
    proofHeading: "Lo Que Ya Está Funcionando",
    proofSub: "Fortalezas detectadas en tu presencia web actual",
    fixesHeading: "Fricciones de Conversión & Fugas de Clientes",
    fixesSub: "Puntos críticos identificados y solución técnica diseñada",
    roadmapHeading: "Cronograma de Implementación en 7 Días",
    roadmapSub: "Desde la aprobación hasta el lanzamiento en producción",
    roadmapSteps: [
      { day: "Día 1-2", title: "Arquitectura & Sistema de Diseño", desc: "Paleta Tailwind de alto contraste, tipografía moderna y estructura responsiva." },
      { day: "Día 3-4", title: "Desarrollo de Módulos & Automatización", desc: "Animaciones fluidas, embudos de captura y conexión directa con CRM / n8n." },
      { day: "Día 5-6", title: "Motor de WhatsApp & Conversión", desc: "Captura en 1-clic a WhatsApp, formularios cualificados y velocidad ultra-rápida." },
      { day: "Día 7", title: "Control de Calidad, DNS & Lanzamiento", desc: "Puesta en marcha en Cloudflare Edge con disponibilidad global garantizada." },
    ],
    offerHeading: "Estructura de la Inversión",
    setupLabel: "Implementación y Entrega Llave en Mano",
    consultAddon: "Consultoría Estratégica Ejecutiva (Hudson Argollo)",
    totalSetup: "Total de Implementación",
    recurringHeading: "Mantenimiento y Aceleración Continua (Opcional)",
    recurringPlan: "Alojamiento Edge, CDN Global, Monitoreo & Soporte CRM",
    recurringPrice: "US$ 97 / mes",
    ctaHeading: "¿Listo para transformar tus resultados?",
    ctaSub: "Confirma tu implementación directamente por WhatsApp.",
    ctaButton: "Aprobar por WhatsApp",
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
    --primary: ${brandTokens.primary || "#e8ff5c"};
    --background: ${brandTokens.background || "#0b0813"};
    --background-alt: ${brandTokens.backgroundAlt || "#161020"};
    --text-on-primary: ${brandTokens.textOnPrimary || "#000000"};
    --text-on-background: ${brandTokens.textOnBackground || "#ffffff"};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--background); color: var(--text-on-background);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .container { max-width: 820px; margin: 0 auto; padding: 0 1.5rem; }
  .hero {
    position: relative; min-height: 65vh; display: flex; align-items: flex-end;
    background-image: url("${esc(coverImageUrl)}"); background-size: cover; background-position: center;
    padding: 4rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .hero::before {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(to top, var(--background) 10%, rgba(11,8,19,0.7) 60%, transparent 100%);
  }
  .hero-content { position: relative; max-width: 820px; margin: 0 auto; width: 100%; }
  .badge {
    display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px;
    background: rgba(232, 255, 92, 0.15); color: var(--primary);
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1rem;
    border: 1px solid rgba(232, 255, 92, 0.3);
  }
  .hero h1 { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 800; margin: 0 0 0.75rem; letter-spacing: -0.02em; line-height: 1.15; }
  .hero p { font-size: 1.1rem; opacity: 0.85; margin: 0; max-width: 650px; }
  
  section { padding: 3.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .section-header { margin-bottom: 2rem; }
  .section-header h2 { font-size: 1.65rem; font-weight: 800; margin: 0 0 0.35rem; letter-spacing: -0.01em; }
  .section-header p { font-size: 0.95rem; opacity: 0.7; margin: 0; }
  
  .proof-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
  .proof-item { padding: 1rem 1.25rem; background: var(--background-alt); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.95rem; }
  .proof-item::before { content: "✓"; color: #34d399; font-weight: bold; }
  
  .fixes-grid { display: flex; flex-direction: column; gap: 1rem; }
  .fix-card { padding: 1.25rem 1.5rem; border-left: 4px solid var(--primary); background: var(--background-alt); border-radius: 0 12px 12px 0; border: 1px solid rgba(255,255,255,0.06); border-left-width: 4px; }
  .fix-card .bad { font-size: 0.9rem; color: #f87171; text-decoration: line-through; opacity: 0.85; margin-bottom: 0.35rem; }
  .fix-card .fix { font-weight: 600; font-size: 1rem; color: #ffffff; }
  
  .roadmap-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
  .roadmap-card { padding: 1.25rem; background: var(--background-alt); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); }
  .roadmap-card .day { font-size: 0.75rem; font-family: monospace; color: var(--primary); font-weight: 700; margin-bottom: 0.35rem; }
  .roadmap-card .title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.35rem; }
  .roadmap-card .desc { font-size: 0.85rem; opacity: 0.75; line-height: 1.4; }

  .offer-box {
    background: linear-gradient(145deg, var(--background-alt), rgba(22, 16, 32, 0.95));
    border: 1px solid rgba(232, 255, 92, 0.25); border-radius: 16px; padding: 2rem;
  }
  .offer-box .line-item { display: flex; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 1rem; }
  .offer-box .total { display: flex; justify-content: space-between; padding-top: 1.25rem; font-size: 1.35rem; font-weight: 800; color: var(--primary); }
  
  .recurring-box { margin-top: 1.5rem; padding: 1.25rem 1.5rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
  
  .cta-section { text-align: center; padding: 4.5rem 0; }
  .cta-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    margin-top: 1.5rem; padding: 1.1rem 2.5rem; background: var(--primary); color: var(--text-on-primary);
    border-radius: 999px; text-decoration: none; font-weight: 800; font-size: 1.05rem;
    box-shadow: 0 10px 25px rgba(232, 255, 92, 0.25); transition: transform 0.2s, box-shadow 0.2s;
  }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(232, 255, 92, 0.35); }
</style>
</head>
<body>
  <div class="hero">
    <div class="hero-content">
      <span class="badge">${t.badge}</span>
      <h1>${esc(businessName)}</h1>
      ${valueProp ? `<p>${esc(valueProp)}</p>` : ""}
    </div>
  </div>

  <div class="container">
    ${
      proof.length
        ? `<section class="proof">
      <div class="section-header">
        <h2>${t.proofHeading}</h2>
        <p>${t.proofSub}</p>
      </div>
      <ul class="proof-list">${proof.map((g) => `<li class="proof-item">${esc(g)}</li>`).join("")}</ul>
    </section>`
        : ""
    }

    <section class="fixes">
      <div class="section-header">
        <h2>${t.fixesHeading}</h2>
        <p>${t.fixesSub}</p>
      </div>
      <div class="fixes-grid">
        ${fixes
          .map(
            (f) =>
              `<div class="fix-card">${f.bad ? `<div class="bad">${esc(f.bad)}</div>` : ""}<div class="fix">${esc(f.fix)}</div></div>`,
          )
          .join("")}
      </div>
    </section>

    <section class="roadmap">
      <div class="section-header">
        <h2>${t.roadmapHeading}</h2>
        <p>${t.roadmapSub}</p>
      </div>
      <div class="roadmap-grid">
        ${t.roadmapSteps
          .map(
            (s) => `
          <div class="roadmap-card">
            <div class="day">${esc(s.day)}</div>
            <div class="title">${esc(s.title)}</div>
            <div class="desc">${esc(s.desc)}</div>
          </div>
        `
          )
          .join("")}
      </div>
    </section>

    <section class="offer">
      <div class="section-header">
        <h2>${t.offerHeading}</h2>
      </div>
      <div class="offer-box">
        <div class="line-item"><span>${esc(verticalLabel)} — ${t.setupLabel}</span><strong style="font-family:monospace">$${priceUsd}</strong></div>
        <div class="line-item"><span>${t.consultAddon}</span><strong style="font-family:monospace">$${CONSULT_ADDON_USD}</strong></div>
        <div class="total"><span>${t.totalSetup}</span><span style="font-family:monospace">$${priceUsd + CONSULT_ADDON_USD}</span></div>
      </div>
      
      <div class="recurring-box">
        <div>
          <strong style="display:block; font-size:0.95rem;">${t.recurringHeading}</strong>
          <span style="font-size:0.85rem; opacity:0.75;">${t.recurringPlan}</span>
        </div>
        <strong style="font-family:monospace; color:var(--primary); font-size:1.05rem;">${t.recurringPrice}</strong>
      </div>
    </section>

    <section class="cta-section">
      <h2>${t.ctaHeading}</h2>
      <p style="opacity:0.8; max-width:550px; margin:0 auto;">${t.ctaSub}</p>
      ${waLink ? `<a href="${esc(waLink)}" class="cta-btn" target="_blank" rel="noopener">${t.ctaButton} →</a>` : ""}
    </section>
  </div>
</body>
</html>`;
}
