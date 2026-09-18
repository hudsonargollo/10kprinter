import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { Globe, CheckCircle2, Send, Sparkles } from "lucide-react";
import type { Lang } from "../../i18n/translations";

export const PIPELINE_DURATION_FRAMES = 240; // 8 seconds at 30 fps
export const PIPELINE_FPS = 30;

interface PipelineCompositionProps {
  lang?: Lang;
}

export function PipelineComposition({ lang = "es" }: PipelineCompositionProps) {
  const frame = useCurrentFrame();

  const currentStep = Math.min(3, Math.floor(frame / 60));

  const stepsData = {
    es: [
      {
        badge: "PASO 01: CAZA GEOGRÁFICA GLOBAL",
        title: "Objetivo Escaneado: Santa Cruz / Miami / São Paulo",
        subtitle: "Localizando negocios locales de alto valor con sitios web activos...",
        leadName: "Centro Odontológico San Martín",
        url: "https://odontosanmarin-scz.com",
        phone: "+591 784 92011",
        city: "Santa Cruz de la Sierra",
        targetLabel: "Entidad Objetivo:",
        scrapedLabel: "Sitio Web Extraído:",
        locationLabel: "Ubicación y WhatsApp:",
        browserNotice: "Navegador headless capturando árbol DOM, captura de pantalla y tokens de marca...",
      },
      {
        badge: "PASO 02: AUDITORÍA DOM PROFUNDA",
        title: "Inspección de DOM Real y Análisis de Rendimiento",
        subtitle: "Evaluando fricción de conversión, adaptabilidad móvil y fugas de llamadas a la acción...",
        score: 38,
        leaksTitle: "FUGAS DE CONVERSIÓN (Puntaje: 38/100)",
        qualifiedBadge: "CALIFICADO",
        bad: [
          "Sin botón de WhatsApp visible arriba del pliegue en móvil",
          "Carga lenta en 4.2s en 4G (imágenes pesadas sin optimizar)",
          "Sin formulario rápido de captura de pacientes",
        ],
        assetsTitle: "ACTIVOS ACTUALES DETECTADOS",
        good: ["Lista clara de tratamientos dentales", "Horarios de atención actualizados"],
        readyNotice: "Listo para propuesta instantánea de rediseño de alto valor.",
      },
      {
        badge: "PASO 03: PRD Y PALETA DE MARCA",
        title: "Paleta Tailwind y Alcance Detallado Generados",
        subtitle: "Construyendo el plan técnico exacto con precios y propuesta desglosada...",
        primaryColor: "#0284c7",
        bgAltColor: "#f0f9ff",
        price: "$300 USD",
        deliverable: "Landing Page Rápida en Next.js + Formulario Instantáneo de WhatsApp",
        scopeLabel: "Paquete de Alcance:",
        priceLabel: "Precio Gancho Desglosado:",
        brandPaletteLabel: "Paleta de Marca Extraída:",
        extractedLabel: "Extraída del logo original",
      },
      {
        badge: "PASO 04: MONETIZACIÓN Y CIERRE",
        title: "Propuesta Interactiva Lista para Enviar",
        subtitle: "Contacto por WhatsApp en 1 clic personalizado para el dueño del negocio...",
        scriptLabel: "SCRIPT DE CONTACTO EN 1 CLIC",
        waMessage:
          "Hola Dr. San Martín, auditamos la web de su clínica y encontramos 3 fugas de reservas móviles. Le armamos la propuesta interactiva y demo aquí: 1kprint.clubemkt.digital/p/scz-dental",
        dealTier: "LEAD CALIENTE · Valor del Trato: $300 + $100/mes",
        deepLinkNotice: "Enlace Directo de WhatsApp Generado",
        readyCloseNotice: "Listo para Cerrar · Escala Global",
      },
    ],
    pt: [
      {
        badge: "ETAPA 01: CAÇA GEOGRÁFICA GLOBAL",
        title: "Alvo Escaneado: Santa Cruz / Miami / São Paulo",
        subtitle: "Localizando negócios locais de alto valor com sites ativos...",
        leadName: "Centro Odontológico San Martín",
        url: "https://odontosanmarin-scz.com",
        phone: "+591 784 92011",
        city: "Santa Cruz de la Sierra",
        targetLabel: "Entidade Alvo:",
        scrapedLabel: "Site Extraído:",
        locationLabel: "Localização e WhatsApp:",
        browserNotice: "Navegador headless capturando árvore DOM, captura de tela e tokens de marca...",
      },
      {
        badge: "ETAPA 02: AUDITORIA DOM PROFUNDA",
        title: "Inspeção de DOM Real e Análise de Performance",
        subtitle: "Avaliando fricção de conversão, responsividade mobile e vazamentos de CTA...",
        score: 38,
        leaksTitle: "VAZAMENTOS DE CONVERSÃO (Pontuação: 38/100)",
        qualifiedBadge: "QUALIFICADO",
        bad: [
          "Sem botão de WhatsApp visível acima da dobra no celular",
          "Carregamento lento em 4.2s no 4G (imagens pesadas sem otimização)",
          "Sem formulário de captura rápida de pacientes",
        ],
        assetsTitle: "ATIVOS ATUAIS DETECTADOS",
        good: ["Lista clara de tratamentos dentários", "Horários de funcionamento atualizados"],
        readyNotice: "Pronto para proposta instantânea de redesenho de alto valor.",
      },
      {
        badge: "ETAPA 03: PRD E PALETA DE MARCA",
        title: "Paleta Tailwind e Escopo Detalhado Gerados",
        subtitle: "Construindo o plano técnico exato com preços transparentes e proposta...",
        primaryColor: "#0284c7",
        bgAltColor: "#f0f9ff",
        price: "$300 USD",
        deliverable: "Landing Page Rápida em Next.js + Formulário Instantâneo de WhatsApp",
        scopeLabel: "Pacote de Escopo:",
        priceLabel: "Preço Gancho Detalhado:",
        brandPaletteLabel: "Paleta de Marca Extraída:",
        extractedLabel: "Extraída do logo original",
      },
      {
        badge: "ETAPA 04: MONETIZAÇÃO E FECHAMENTO",
        title: "Proposta Interativa Pronta para Envio",
        subtitle: "Contato no WhatsApp em 1 clique personalizado para o dono do negócio...",
        scriptLabel: "SCRIPT DE CONTATO EM 1 CLIQUE",
        waMessage:
          "Olá Dr. San Martín, auditamos o site da sua clínica e encontramos 3 vazamentos de agendamentos no celular. Preparamos a proposta interativa e demo aqui: 1kprint.clubemkt.digital/p/scz-dental",
        dealTier: "LEAD QUENTE · Valor do Negócio: $300 + $100/mês",
        deepLinkNotice: "Link Direto do WhatsApp Gerado",
        readyCloseNotice: "Pronto para Fechar · Escala Global",
      },
    ],
    en: [
      {
        badge: "STEP 01: GLOBAL DISCOVERY",
        title: "Target Scanned: Santa Cruz / Miami / São Paulo",
        subtitle: "Locating high-ticket local businesses with live websites...",
        leadName: "Centro Odontológico San Martín",
        url: "https://odontosanmarin-scz.com",
        phone: "+591 784 92011",
        city: "Santa Cruz de la Sierra",
        targetLabel: "Target Entity:",
        scrapedLabel: "Scraped Website:",
        locationLabel: "Location & WhatsApp:",
        browserNotice: "Headless browser capturing DOM tree, hero screenshot & copy tokens...",
      },
      {
        badge: "STEP 02: DEEP DOM AUDIT",
        title: "Real DOM Inspection & Performance Analysis",
        subtitle: "Evaluating conversion friction, mobile responsiveness & CTA leaks...",
        score: 38,
        leaksTitle: "CONVERSION LEAKS (Score: 38/100)",
        qualifiedBadge: "QUALIFIED",
        bad: [
          "No mobile WhatsApp CTA above fold",
          "Page load 4.2s on 4G (heavy uncompressed assets)",
          "No lead capture mechanism",
        ],
        assetsTitle: "CURRENT ASSETS DETECTED",
        good: ["Clear service list", "Active operating hours"],
        readyNotice: "Ready for instant high-ticket redesign proposal.",
      },
      {
        badge: "STEP 03: PRD & BRAND TOKENS",
        title: "Tailwind Palette & Itemized Scope Generated",
        subtitle: "Building the exact technical upgrade plan with transparent pricing...",
        primaryColor: "#0284c7",
        bgAltColor: "#f0f9ff",
        price: "$300 USD",
        deliverable: "High-Speed Next.js Landing + WhatsApp Instant Booking Form",
        scopeLabel: "Scope Package:",
        priceLabel: "Itemized Price Hook:",
        brandPaletteLabel: "Auto Brand Palette:",
        extractedLabel: "Extracted from original logo",
      },
      {
        badge: "STEP 04: MONETIZATION & CLOSING",
        title: "Bilingual Proposal Ready to Send",
        subtitle: "1-Click WhatsApp outreach personalized for the business owner...",
        scriptLabel: "1-CLICK OUTREACH SCRIPT",
        waMessage:
          "Hello Dr. San Martín, we audited your clinic's website and found 3 mobile booking leaks. We prepared a full interactive proposal and demo for you here: 1kprint.clubemkt.digital/p/scz-dental",
        dealTier: "HOT LEAD · Deal Value: $300 + $100/mo",
        deepLinkNotice: "Direct WhatsApp Deep-Link Generated",
        readyCloseNotice: "Ready to Close · Global Scale",
      },
    ],
  };

  const steps = stepsData[lang] || stepsData.es;
  const s = steps[currentStep];

  const headerTitles = {
    es: {
      brandTitle: "MONEYMACHINE: PIPELINE AUTOMATIZADO",
      authorTag: "Creado por Hudson Argollo · Motor Global de Lead a Cierre",
      stepPills: ["01 Rastrear", "02 Auditar", "03 PRD", "04 Cerrar"],
      velocityLabel: "VELOCIDAD DEL PIPELINE: 100% AUTOMATIZADO",
      completeLabel: "COMPLETO",
    },
    pt: {
      brandTitle: "MONEYMACHINE: PIPELINE AUTOMATIZADO",
      authorTag: "Criado por Hudson Argollo · Motor Global de Lead a Fechamento",
      stepPills: ["01 Caçar", "02 Auditar", "03 PRD", "04 Fechar"],
      velocityLabel: "VELOCIDADE DO PIPELINE: 100% AUTOMATIZADO",
      completeLabel: "CONCLUÍDO",
    },
    en: {
      brandTitle: "MONEYMACHINE AUTOMATED PIPELINE",
      authorTag: "Created by Hudson Argollo · Worldwide Lead-to-Close Engine",
      stepPills: ["01 Hunt", "02 Audit", "03 PRD", "04 Close"],
      velocityLabel: "PIPELINE VELOCITY: 100% AUTOMATED",
      completeLabel: "COMPLETE",
    },
  };

  const h = headerTitles[lang] || headerTitles.es;

  // Smooth entrance spring for current active card
  const cardScale = spring({
    frame: frame % 60,
    fps: 30,
    config: { damping: 15, mass: 0.6, stiffness: 120 },
  });

  const cardOpacity = interpolate(frame % 60, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill className="bg-[#090b10] text-white p-6 sm:p-8 flex flex-col justify-between font-sans select-none overflow-hidden border border-white/10 rounded-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e8ff5c] text-black font-extrabold flex items-center justify-center text-xs font-mono">
            MM
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white/90">
              {h.brandTitle}
            </div>
            <div className="text-[11px] font-mono text-[#e8ff5c]">
              {h.authorTag}
            </div>
          </div>
        </div>

        {/* Live Step Pills */}
        <div className="flex items-center gap-1.5">
          {h.stepPills.map((label, idx) => (
            <div
              key={label}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                currentStep === idx
                  ? "bg-[#e8ff5c] text-black shadow-sm scale-105"
                  : currentStep > idx
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/5 text-white/40 border border-white/5"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Center Stage Card Animation */}
      <div
        style={{
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
        }}
        className="my-auto"
      >
        <div className="rounded-xl border border-white/15 bg-white/[0.03] backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8ff5c]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e8ff5c]/15 border border-[#e8ff5c]/30 text-[#e8ff5c] text-[11px] font-mono font-bold">
              <Sparkles className="w-3 h-3" />
              {s.badge}
            </span>
            <span className="text-[11px] font-mono text-white/40">
              Frame {frame} / {PIPELINE_DURATION_FRAMES}
            </span>
          </div>

          <h3 className="text-xl font-bold font-heading text-white tracking-tight">{s.title}</h3>
          <p className="text-xs text-white/60 mt-1 mb-5">{s.subtitle}</p>

          {/* Dynamic Content based on Step */}
          {currentStep === 0 && (
            <div className="space-y-3 bg-black/40 p-4 rounded-lg border border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40">{s.targetLabel}</span>
                <span className="text-[#e8ff5c] font-bold">{s.leadName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{s.scrapedLabel}</span>
                <span className="text-white/90 underline">{s.url}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{s.locationLabel}</span>
                <span className="text-emerald-400 font-semibold">{s.city} · {s.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-[11px] pt-2 border-t border-white/10">
                <Globe className="w-3.5 h-3.5 text-[#e8ff5c] animate-spin" />
                <span>{s.browserNotice}</span>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span>{s.leaksTitle}</span>
                  <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded">{s.qualifiedBadge}</span>
                </div>
                {s.bad?.map((item, i) => (
                  <div key={i} className="text-rose-200/80 text-[11px] flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg space-y-2">
                <div className="text-emerald-300 font-bold">{s.assetsTitle}</div>
                {s.good?.map((item, i) => (
                  <div key={i} className="text-emerald-200/80 text-[11px] flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
                <div className="pt-2 text-[10px] text-white/50 border-t border-emerald-500/20">
                  {s.readyNotice}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3 bg-black/40 p-4 rounded-lg border border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40">{s.scopeLabel}</span>
                <span className="text-white font-bold">{s.deliverable}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{s.priceLabel}</span>
                <span className="text-[#e8ff5c] text-sm font-extrabold">{s.price}</span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <span className="text-white/40">{s.brandPaletteLabel}</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#0284c7] border border-white/30" title="Primary" />
                  <div className="w-5 h-5 rounded bg-[#f0f9ff] border border-white/30" title="Background Alt" />
                  <div className="w-5 h-5 rounded bg-[#0f172a] border border-white/30" title="Dark Base" />
                </div>
                <span className="text-[10px] text-white/50">{s.extractedLabel}</span>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3 bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-lg font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> {s.scriptLabel}
                </span>
                <span className="bg-[#e8ff5c] text-black font-bold px-2 py-0.5 rounded text-[10px]">
                  {s.dealTier}
                </span>
              </div>
              <div className="bg-black/50 p-3 rounded border border-white/10 text-white/90 italic text-[11px] leading-relaxed">
                "{s.waMessage}"
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
                <span>{s.deepLinkNotice}</span>
                <span className="text-emerald-400 font-bold">{s.readyCloseNotice}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
          <span>{h.velocityLabel}</span>
          <span className="text-[#e8ff5c] font-bold">
            {Math.round(((frame + 1) / PIPELINE_DURATION_FRAMES) * 100)}% {h.completeLabel}
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#e8ff5c] via-emerald-400 to-[#e8ff5c] transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${((frame + 1) / PIPELINE_DURATION_FRAMES) * 100}%` }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}
