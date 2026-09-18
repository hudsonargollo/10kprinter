import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Zap, Copy, Check, Sparkles, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface SampleAudit {
  id: string;
  niche: string;
  businessName: string;
  city: string;
  website: string;
  tempScore: string;
  tempColor: string;
  leakEstimate: string;
  findings: {
    type: "bad" | "good";
    title: string;
    impact: string;
  }[];
  proposalBundle: {
    items: { name: string; price: number }[];
    total: number;
  };
  samplePitch: string;
}

export function LiveAuditSimulator() {
  const { lang } = useLanguage();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const sampleDataByLang: Record<string, SampleAudit[]> = {
    es: [
      {
        id: "dental",
        niche: "Clínicas Dentales",
        businessName: "Clínica Dental Santa Cruz",
        city: "Santa Cruz, BO",
        website: "clinicadentalscz.com",
        tempScore: "CALIENTE",
        tempColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        leakEstimate: "$4,800 USD / mes",
        findings: [
          { type: "bad", title: "Falta botón fijo de WhatsApp/Citas en móviles", impact: "-34% conversiones en celular" },
          { type: "bad", title: "Sin testimonios ni reseñas de Google en la portada", impact: "-22% confianza percibida" },
          { type: "good", title: "Equipo médico certificado y catálogo de especialidades", impact: "Excelente base de oferta" },
        ],
        proposalBundle: {
          items: [
            { name: "Motor de Citas en 1-Clic + Webhook de WhatsApp", price: 350 },
            { name: "Widget de Reseñas de Google y Prueba Social", price: 200 },
            { name: "Rediseño de Portada Móvil de Alta Conversión", price: 250 },
          ],
          total: 800,
        },
        samplePitch: "¡Hola Dr. Miller! Estuve analizando el sitio de la clínica hoy — noté que los pacientes en celular no tienen botón directo de WhatsApp, perdiendo ~12 citas al mes. Diseñamos un plan de solución en 1 página con precios aquí...",
      },
      {
        id: "law",
        niche: "Bufetes de Abogados",
        businessName: "Vanguardia Legal & Asociados",
        city: "Madrid / La Paz",
        website: "vanguardialegal.es",
        tempScore: "CALIENTE",
        tempColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        leakEstimate: "€ 3.500 / mes",
        findings: [
          { type: "bad", title: "Formulario con 9 campos obligatorios en vez de consulta rápida", impact: "-55% envíos completados" },
          { type: "bad", title: "Tiempo de carga > 4.8s en conexiones 4G", impact: "-40% rebote inmediato" },
          { type: "good", title: "Posicionamiento local con más de 120 casos ganados", impact: "Alto volumen de tráfico" },
        ],
        proposalBundle: {
          items: [
            { name: "Formulario de Triaje y Captura en 2 Pasos", price: 400 },
            { name: "Optimización de Velocidad en Cloudflare Edge (<1.1s)", price: 350 },
            { name: "Bot de Calificación de Casos vía WhatsApp", price: 450 },
          ],
          total: 1200,
        },
        samplePitch: "Estimado Dr. Roberto: Notamos que el formulario del bufete tiene 9 campos en el celular, lo que frena más del 50% de consultas urgentes. Preparamos una propuesta de triaje en 2 pasos para duplicar sus casos...",
      },
      {
        id: "realestate",
        niche: "Bienes Raíces de Lujo",
        businessName: "Aura Prime Inmobiliaria",
        city: "Santa Cruz / Miami",
        website: "auraprimeinmuebles.com",
        tempScore: "TIBIO",
        tempColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        leakEstimate: "$6,500 USD / mes",
        findings: [
          { type: "bad", title: "Sin catálogo interactivo ni tour virtual en propiedades VIP", impact: "Baja interacción en inmuebles premium" },
          { type: "bad", title: "Descarga de dossier en PDF estático por correo manual", impact: "Demora en respuesta a compradores" },
          { type: "good", title: "Fotografía de alta gama y ubicaciones prémium", impact: "Cartera exclusiva de propiedades" },
        ],
        proposalBundle: {
          items: [
            { name: "Catálogo Interactivo con Vista Rápida VIP", price: 500 },
            { name: "Sistema de Envío Inmediato de Dossier por WhatsApp", price: 300 },
          ],
          total: 800,
        },
        samplePitch: "Hola equipo de Aura Prime: Hicimos un diagnóstico de su portal inmobiliario — sus propiedades son increíbles, pero los compradores esperan horas por los dossiers en PDF. Diseñamos un flujo instantáneo que cuadruplica el contacto con agentes...",
      },
    ],
    pt: [
      {
        id: "dental",
        niche: "Clínicas Odontológicas",
        businessName: "Clínica Dental Prime",
        city: "São Paulo, SP",
        website: "odontoprime-sp.com.br",
        tempScore: "QUENTE",
        tempColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        leakEstimate: "R$ 14.800 / mês",
        findings: [
          { type: "bad", title: "Falta botão fixo de WhatsApp/Agendamento no celular", impact: "-34% conversões no celular" },
          { type: "bad", title: "Sem avaliações do Google ou prova social na primeira dobra", impact: "-22% na percepção de confiança" },
          { type: "good", title: "Corpo clínico certificado e tratamentos bem explicados", impact: "Excelente base de oferta" },
        ],
        proposalBundle: {
          items: [
            { name: "Motor de Agendamento em 1-Clique + Webhook WhatsApp", price: 350 },
            { name: "Widget de Avaliações Google e Prova Social", price: 200 },
            { name: "Redesign de Hero de Alta Conversão", price: 250 },
          ],
          total: 800,
        },
        samplePitch: "Olá Dr. Miller! Analisei o site da clínica hoje — notei que os pacientes no celular não têm botão direto de WhatsApp, perdendo ~12 agendamentos/mês. Estruturei uma proposta de solução em 1 página com preços prontos aqui...",
      },
      {
        id: "law",
        niche: "Escritórios de Advocacia",
        businessName: "Vanguarda Advocacia & Associados",
        city: "Rio de Janeiro, RJ",
        website: "vanguardaadvogados.com.br",
        tempScore: "QUENTE",
        tempColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        leakEstimate: "R$ 18.000 / mês",
        findings: [
          { type: "bad", title: "Formulário com 9 campos obrigatórios no mobile", impact: "-55% de conclusões" },
          { type: "bad", title: "Tempo de carregamento > 4.8s em 4G", impact: "-40% de rejeição imediata" },
          { type: "good", title: "Ótimo ranqueamento local com mais de 120 casos ganhos", impact: "Alto tráfego orgânico" },
        ],
        proposalBundle: {
          items: [
            { name: "Formulário de Triagem Rápida em 2 Passos", price: 400 },
            { name: "Aceleração Cloudflare Edge Performance (<1.1s)", price: 350 },
            { name: "Bot de Atendimento e Triagem de Casos no WhatsApp", price: 450 },
          ],
          total: 1200,
        },
        samplePitch: "Olá Dr. Roberto! Notamos que o formulário do escritório tem 9 campos no celular, o que derruba mais de 50% dos contatos urgentes. Preparamos uma proposta enxuta de triagem em 2 passos para triplicar seus leads...",
      },
      {
        id: "realestate",
        niche: "Imóveis de Alto Padrão",
        businessName: "Aura Prime Imóveis",
        city: "São Paulo / Balneário Camboriú",
        website: "auraprimeimoveis.com.br",
        tempScore: "MORNO",
        tempColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        leakEstimate: "R$ 25.000 / mês",
        findings: [
          { type: "bad", title: "Sem visualizador interativo ou tour virtual nos imóveis VIP", impact: "Baixo engajamento em imóveis de luxo" },
          { type: "bad", title: "Download de catálogo em PDF manual por e-mail", impact: "Demora na resposta ao comprador" },
          { type: "good", title: "Fotografia profissional e catálogo em localizações nobres", impact: "Carteira exclusiva de alto padrão" },
        ],
        proposalBundle: {
          items: [
            { name: "Vitrine Interativa com Visualização Rápida VIP", price: 500 },
            { name: "Sistema de Envio Imediato de Catálogo pelo WhatsApp", price: 300 },
          ],
          total: 800,
        },
        samplePitch: "Olá equipe Aura Prime! Fizemos um diagnóstico do portal de vocês — os imóveis são incríveis, mas compradores esperam horas pelo PDF. Criamos um fluxo de entrega instantânea no WhatsApp que quadruplica contatos com corretores...",
      },
    ],
    en: [
      {
        id: "dental",
        niche: "Dental Clinics",
        businessName: "BrightSmile Dental Care",
        city: "Miami, FL",
        website: "brightsmile-example.com",
        tempScore: "HOT",
        tempColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        leakEstimate: "$4,800 / mo",
        findings: [
          { type: "bad", title: "Missing 1-tap WhatsApp/SMS booking on mobile", impact: "-34% mobile conversions" },
          { type: "bad", title: "No Google Reviews widget or trust badges on landing view", impact: "-22% trust rating" },
          { type: "good", title: "Clean doctor credentials and services listed", impact: "Solid foundational offer" },
        ],
        proposalBundle: {
          items: [
            { name: "Instant Mobile Booking Engine + WhatsApp Webhook", price: 350 },
            { name: "Live Google Reviews & Trust Social Proof Embed", price: 200 },
            { name: "High-Converting Hero Redesign", price: 250 },
          ],
          total: 800,
        },
        samplePitch: "Hi Dr. Miller! Audited BrightSmile's site today — noticed patients on mobile have no 1-tap booking button, costing ~12 new patient bookings/mo. Put together a 1-page fix plan with full pricing ready here...",
      },
      {
        id: "law",
        niche: "Law Firms",
        businessName: "Vanguard Injury Law",
        city: "London / New York",
        website: "vanguardlaw-demo.com",
        tempScore: "HOT",
        tempColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        leakEstimate: "$18,000 / mo",
        findings: [
          { type: "bad", title: "Form has 9 mandatory fields instead of quick 2-step consult", impact: "-55% form completion" },
          { type: "bad", title: "Page load speed > 4.8s on 4G connections", impact: "-40% immediate bounce" },
          { type: "good", title: "High local search ranking with 120+ verified cases", impact: "High traffic asset" },
        ],
        proposalBundle: {
          items: [
            { name: "2-Step Frictionless Lead Triage Form", price: 400 },
            { name: "Edge Caching & 4G Performance Overhaul (<1.1s)", price: 350 },
            { name: "Automated Case Intake WhatsApp Bot", price: 450 },
          ],
          total: 1200,
        },
        samplePitch: "Hi Dr. Roberto! Noticed Vanguard's mobile form has 9 fields, causing 50%+ of urgent case inquiries to drop off. We built a 2-step triage flow ready to implement in 7 days to double your inbound cases...",
      },
      {
        id: "realestate",
        niche: "Luxury Real Estate",
        businessName: "Aura Prime Properties",
        city: "Miami / London",
        website: "auraprime-demo.com",
        tempScore: "WARM",
        tempColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        leakEstimate: "$6,500 / mo",
        findings: [
          { type: "bad", title: "No interactive VIP property tour / 3D viewer", impact: "Low engagement on luxury listings" },
          { type: "bad", title: "Generic PDF brochure download requiring manual email reply", impact: "Slow lead response time" },
          { type: "good", title: "High-end photography and prime location catalog", impact: "Premium asset base" },
        ],
        proposalBundle: {
          items: [
            { name: "Interactive Listing Showcase + Fast VIP Preview", price: 500 },
            { name: "Instant WhatsApp Brochure Delivery System", price: 300 },
          ],
          total: 800,
        },
        samplePitch: "Hello Aura Prime team! Ran an automated teardown of your property showcase — your luxury listings are stunning, but buyers wait hours for brochure downloads. We built an instant delivery flow that quadruples agent connections...",
      },
    ],
  };

  const sampleList = sampleDataByLang[lang] || sampleDataByLang.en;
  const audit = sampleList[selectedIdx] || sampleList[0];

  const labels = {
    es: {
      badge: "AUDITORÍA EN TIEMPO REAL",
      leak: "Pérdida de Ingresos:",
      frictionTitle: "Fricción de Conversión Auditada",
      proposalTitle: "Propuesta Cotizada Automáticamente",
      total: "Total:",
      pitchTitle: "Guión de WhatsApp Listo para Enviar",
      copy: "Copiar Guión",
      copied: "¡Copiado!",
      cta: "Rastrear y Cazar Leads Reales en tu Ciudad",
    },
    pt: {
      badge: "AUDITORIA EM TEMPO REAL",
      leak: "Vazamento de Receita:",
      frictionTitle: "Fricção de Conversão Auditada",
      proposalTitle: "Proposta Cotada Automaticamente",
      total: "Total:",
      pitchTitle: "Script de WhatsApp Pronto para Enviar",
      copy: "Copiar Script",
      copied: "Copiado!",
      cta: "Rastrear e Caçar Leads Reais na sua Cidade",
    },
    en: {
      badge: "REAL-TIME AUDIT",
      leak: "Revenue Leaking:",
      frictionTitle: "Audited Conversion Friction",
      proposalTitle: "Auto-Generated Proposal",
      total: "Total:",
      pitchTitle: "Ready-to-Send WhatsApp Pitch",
      copy: "Copy Pitch",
      copied: "Copied!",
      cta: "Scan & Hunt Real Leads in Your City",
    },
  }[lang] || {
    badge: "REAL-TIME AUDIT",
    leak: "Revenue Leaking:",
    frictionTitle: "Audited Conversion Friction",
    proposalTitle: "Auto-Generated Proposal",
    total: "Total:",
    pitchTitle: "Ready-to-Send WhatsApp Pitch",
    copy: "Copy Pitch",
    copied: "Copied!",
    cta: "Scan & Hunt Real Leads in Your City",
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(audit.samplePitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-[#120d18]/95 backdrop-blur-xl shadow-2xl overflow-hidden text-left flex flex-col font-sans">
      {/* Top Bar / Mac style dots */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-xs font-mono text-white/40 ml-2">live-audit-engine.tsx</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#e8ff5c]/10 text-[#e8ff5c] border border-[#e8ff5c]/20">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>{labels.badge}</span>
        </div>
      </div>

      {/* Niche Selector Pills */}
      <div className="p-3 border-b border-white/10 flex gap-2 overflow-x-auto no-scrollbar bg-black/20">
        {sampleList.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelectedIdx(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedIdx === idx
                ? "bg-[#e8ff5c] text-black shadow-md font-semibold"
                : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Zap className={`w-3 h-3 ${selectedIdx === idx ? "text-black fill-black" : "text-white/40"}`} />
            {item.niche}
          </button>
        ))}
      </div>

      {/* Main Audit Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={audit.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="p-5 space-y-4"
        >
          {/* Business Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{audit.businessName}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${audit.tempColor}`}>
                  {audit.tempScore}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 font-mono">
                {audit.city} • <span className="underline decoration-white/20">{audit.website}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">{labels.leak}</span>
              <span className="text-sm font-mono font-bold text-rose-400">{audit.leakEstimate}</span>
            </div>
          </div>

          {/* Audit Findings */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2 block">
              {labels.frictionTitle}
            </span>
            <div className="space-y-1.5">
              {audit.findings.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  {f.type === "bad" ? (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="text-white/90 font-medium">{f.title}</span>
                    <span className="text-white/40 font-mono text-[11px] block mt-0.5">{f.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Offer Bundle */}
          <div className="bg-[#e8ff5c]/[0.03] border border-[#e8ff5c]/20 rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#e8ff5c]">
                {labels.proposalTitle}
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {labels.total} <span className="text-[#e8ff5c] text-sm">${audit.proposalBundle.total}</span>
              </span>
            </div>
            <div className="space-y-1">
              {audit.proposalBundle.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs text-white/70">
                  <span className="truncate pr-2">• {it.name}</span>
                  <span className="font-mono text-white/90">${it.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pitch Ready */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-[#e8ff5c]" /> {labels.pitchTitle}
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-mono text-[#e8ff5c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? labels.copied : labels.copy}
              </button>
            </div>
            <p className="text-xs text-white/80 italic line-clamp-2 bg-white/[0.02] p-2 rounded border border-white/5 font-mono">
              "{audit.samplePitch}"
            </p>
          </div>

          {/* Bottom Action */}
          <div className="pt-1">
            <a
              href="/app"
              className="w-full group py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#e8ff5c] to-[#c7e034] text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg hover:shadow-[#e8ff5c]/20"
            >
              <span>{labels.cta}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
