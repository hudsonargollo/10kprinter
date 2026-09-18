import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, DollarSign, Activity, Compass, Flame, CheckCircle2, Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

export function InteractiveShowcaseSection() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"offer" | "audits" | "hunt" | "sales">("offer");

  const tabs = [
    { id: "offer", label: lang === "es" ? "Oferta y Precios" : lang === "pt" ? "Oferta e Preços" : "Offer & Pricing", icon: DollarSign },
    { id: "audits", label: lang === "es" ? "Auditoría DOM" : lang === "pt" ? "Auditoria DOM" : "DOM Audits", icon: Activity },
    { id: "hunt", label: lang === "es" ? "Hunt Wizard Global" : lang === "pt" ? "Hunt Wizard Global" : "Global Hunt Wizard", icon: Compass },
    { id: "sales", label: lang === "es" ? "Pipeline y Ventas" : lang === "pt" ? "Pipeline e Vendas" : "Sales Pipeline", icon: Flame },
  ];

  const content = {
    es: {
      badge: "ARTEFACTOS INTERACTIVOS DEL SISTEMA",
      title: "El Motor de Prospección en Detalle",
      sub: "Explora cada módulo del sistema: cotización automática, diagnósticos técnicos, búsqueda geográfica y embudo de conversión.",
      offer: {
        leadName: "Clínica Dental Santa Cruz",
        leadScore: "LEAD CALIENTE · Puntaje: 88",
        leadMeta: "https://clinicadentalscz.com · Santa Cruz, Bolivia",
        targetLang: "Idioma Objetivo: ES (Español)",
        hookTag: "OFERTA GANCHO",
        hookPrice: "$100 USD",
        hookTitle: "Botón de WhatsApp y Agendamiento Móvil",
        hookDesc: "Implementación de barra flotante fija de WhatsApp y formulario rápido de citas para pacientes.",
        hookBenefit: "Gancho de alta conversión",
        coreBadge: "REDISEÑO PRINCIPAL",
        coreTag: "REDISEÑO WEB",
        corePrice: "$300 USD",
        coreTitle: "Landing Page Rápida en Next.js para Clínica",
        coreDesc: "Reconstrucción completa con paleta de marca extraída, catálogo de tratamientos y prueba social.",
        coreBenefit: "Puntaje Móvil 95+ PageSpeed",
        retainerTag: "RETAINER MENSUAL",
        retainerPrice: "$250/mes",
        retainerTitle: "Automatización de Reseñas y Motor SEO",
        retainerDesc: "Mantenimiento del ranking en Google Maps y recolección automática de opiniones vía WhatsApp.",
        retainerBenefit: "Ingreso recurrente para la agencia",
        paletteLabel: "Paleta de Marca Extraída:",
        bundleTotal: "Total de Propuesta:",
        sendBtn: "Enviar Propuesta por WhatsApp",
      },
      audits: {
        title: "Rúbrica de Conversión DOM en Vivo",
        sub: "Inspeccionando nodos del DOM, métricas de rendimiento y llamadas a la acción móviles",
        evaluated: "4 Verticales Evaluadas",
        card1Title: "Rediseño Web (UX/UI)",
        card1Score: "PUNTAJE: 35/100",
        card1Bad1: "El viewport tarda 4.8s en cargar por una imagen hero no optimizada de 4MB.",
        card1Bad2: "Cero botones de agendamiento directo visibles en pantalla móvil.",
        card1Fix: "Solución: Desplegar landing page en Tailwind con barra fija de reservas.",
        card2Title: "Marketing y Automatización de Leads",
        card2Score: "PUNTAJE: 40/100",
        card2Bad1: "Sin incentivo de captura de correo o WhatsApp para nuevos visitantes.",
        card2Bad2: "El número telefónico es texto estático, no un enlace clickeable tel: o wa.me.",
        card2Fix: "Solución: Formulario automático de captura de citas y flujo de recordatorios.",
      },
      hunt: {
        title: "Sesión de Caza Global",
        sub: "Descubrimiento espacial en vivo mediante Google Places API",
        targetBadge: "Objetivo: Santa Cruz de la Sierra, BO",
        niche1: "Clínicas Dentales",
        niche1Desc: "20 descubiertos · 18 sitios web",
        niche2: "Bufetes de Abogados",
        niche2Desc: "15 descubiertos · 14 sitios web",
        niche3: "Bienes Raíces",
        niche3Desc: "25 descubiertos · 22 sitios web",
        readyBadge: "LISTO",
        batchText: "Capacidad del Lote:",
        batchSub: "60 leads listos para extracción DOM y auditoría automática",
        estTime: "Tiempo Estimado de Auditoría: ~45 segundos",
      },
      sales: {
        title: "Termómetro de Leads y Etapas del Trato",
        sub: "Puntuado automáticamente según la severidad de la auditoría",
        hotBadge: "🔥 CALIENTE (Necesidad Urgente)",
        stage1: "1. Descubiertos",
        stage1Val: "42 Leads",
        stage2: "2. Auditados",
        stage2Val: "38 Calificados",
        stage3: "3. Propuesta Enviada",
        stage3Val: "19 Contactos",
        stage4: "4. Cerrado / Ganado",
        stage4Val: "$4,800 USD Cerrados",
      },
    },
    pt: {
      badge: "ARTEFATOS INTERATIVOS DO SISTEMA",
      title: "O Motor de Prospecção em Detalhes",
      sub: "Explore cada módulo do sistema: precificação automática, diagnósticos técnicos, caça geográfica e funil de vendas.",
      offer: {
        leadName: "Clínica Odontológica San Martín",
        leadScore: "LEAD QUENTE · Pontuação: 88",
        leadMeta: "https://odontosanmarin.com · São Paulo, Brasil",
        targetLang: "Idioma Alvo: PT (Português)",
        hookTag: "OFERTA DE ENTRADA",
        hookPrice: "$100 USD",
        hookTitle: "Botão de WhatsApp e Agendamento Mobile",
        hookDesc: "Implementação de barra flutuante de WhatsApp e formulário rápido de agendamento de pacientes.",
        hookBenefit: "Gancho de alta conversão",
        coreBadge: "REDESENHO PRINCIPAL",
        coreTag: "REDESENHO WEB",
        corePrice: "$300 USD",
        coreTitle: "Landing Page Rápida em Next.js para Clínica",
        coreDesc: "Reconstrução completa com paleta extraída da marca, grade de tratamentos e prova social.",
        coreBenefit: "Pontuação Mobile 95+ PageSpeed",
        retainerTag: "RETAINER MENSAL",
        retainerPrice: "$250/mês",
        retainerTitle: "Automação de Avaliações e Motor SEO",
        retainerDesc: "Manutenção de ranking no Google Maps e coleta automática de avaliações via WhatsApp.",
        retainerBenefit: "Receita recorrente para a agência",
        paletteLabel: "Paleta de Marca Extraída:",
        bundleTotal: "Total da Proposta:",
        sendBtn: "Enviar Proposta no WhatsApp",
      },
      audits: {
        title: "Rúbrica de Conversão DOM ao Vivo",
        sub: "Inspecionando nós do DOM, métricas de performance e CTAs responsivos",
        evaluated: "4 Verticais Avaliadas",
        card1Title: "Redesenho Web (UX/UI)",
        card1Score: "PONTUAÇÃO: 35/100",
        card1Bad1: "O viewport demora 4.8s para carregar devido a uma imagem hero de 4MB.",
        card1Bad2: "Nenhum botão de agendamento direto visível na tela do celular.",
        card1Fix: "Solução: Publicar landing page em Tailwind com barra fixa de agendamentos.",
        card2Title: "Marketing e Automação de Leads",
        card2Score: "PONTUAÇÃO: 40/100",
        card2Bad1: "Sem incentivo de captura de e-mail ou WhatsApp para novos visitantes.",
        card2Bad2: "O telefone é texto estático, não um link clicável tel: ou wa.me.",
        card2Fix: "Solução: Formulário automático de agendamento e fluxo de lembretes.",
      },
      hunt: {
        title: "Sessão de Caça Global",
        sub: "Descoberta espacial ao vivo via Google Places API",
        targetBadge: "Alvo: São Paulo, SP, BR",
        niche1: "Clínicas Odontológicas",
        niche1Desc: "20 descobertos · 18 sites",
        niche2: "Escritórios de Advocacia",
        niche2Desc: "15 descobertos · 14 sites",
        niche3: "Imobiliárias",
        niche3Desc: "25 descobertos · 22 sites",
        readyBadge: "PRONTO",
        batchText: "Capacidade do Lote:",
        batchSub: "60 leads prontos para extração DOM e auditoria automática",
        estTime: "Tempo Estimado de Auditoria: ~45 segundos",
      },
      sales: {
        title: "Termômetro de Leads e Estágios do Negócio",
        sub: "Pontuado automaticamente com base na gravidade da auditoria",
        hotBadge: "🔥 QUENTE (Necessidade Urgente)",
        stage1: "1. Descobertos",
        stage1Val: "42 Leads",
        stage2: "2. Auditados",
        stage2Val: "38 Qualificados",
        stage3: "3. Proposta Enviada",
        stage3Val: "19 Contatos",
        stage4: "4. Fechado / Ganho",
        stage4Val: "$4,800 USD Fechados",
      },
    },
    en: {
      badge: "INTERACTIVE SYSTEM ARTIFACTS",
      title: "The Prospecting Engine in Detail",
      sub: "Explore every system module: automatic pricing, technical diagnostics, geographic hunting, and conversion pipeline.",
      offer: {
        leadName: "Clínica Dental Santa Cruz",
        leadScore: "HOT LEAD · Score: 88",
        leadMeta: "https://clinicadentalscz.com · Santa Cruz, Bolivia",
        targetLang: "Target Language: EN (English)",
        hookTag: "HOOK OFFER",
        hookPrice: "$100 USD",
        hookTitle: "Mobile Booking & WhatsApp CTA",
        hookDesc: "Implement sticky bottom WhatsApp consultation bar and instant patient intake form.",
        hookBenefit: "High conversion impulse hook",
        coreBadge: "CORE REDESIGN",
        coreTag: "WEBSITE REDESIGN",
        corePrice: "$300 USD",
        coreTitle: "Next.js Fast Dental Landing Page",
        coreDesc: "Full page rebuild with extracted brand tokens, dynamic treatments grid, and social proof.",
        coreBenefit: "95+ PageSpeed Mobile Score",
        retainerTag: "MONTHLY RETAINER",
        retainerPrice: "$250/mo",
        retainerTitle: "Review Automation & SEO Engine",
        retainerDesc: "Google Maps ranking maintenance and post-visit WhatsApp review collection.",
        retainerBenefit: "Recurring agency revenue",
        paletteLabel: "Extracted Brand Palette:",
        bundleTotal: "Proposal Bundle Total:",
        sendBtn: "Send WhatsApp Proposal",
      },
      audits: {
        title: "Live DOM Conversion Rubric",
        sub: "Inspecting DOM nodes, performance metrics, and responsive CTAs",
        evaluated: "4 Verticals Evaluated",
        card1Title: "Website Redesign (UX/UI)",
        card1Score: "SCORE: 35/100",
        card1Bad1: "Viewport loads in 4.8s due to unoptimized 4MB hero image.",
        card1Bad2: "Zero direct booking CTA on mobile view above the fold.",
        card1Fix: "Fix: Deploy Tailwind landing page with instant sticky booking bar.",
        card2Title: "Marketing & Lead Automation",
        card2Score: "SCORE: 40/100",
        card2Bad1: "No email or SMS lead capture incentive for first-time visitors.",
        card2Bad2: "Phone number is static text, not a clickable tel: or wa.me link.",
        card2Fix: "Fix: Add automatic appointment lead capture form & SMS reminder flow.",
      },
      hunt: {
        title: "Global Hunt Session",
        sub: "Spatial discovery across Google Places API",
        targetBadge: "Target: Santa Cruz de la Sierra, BO",
        niche1: "Dental Clinics",
        niche1Desc: "20 discovered · 18 websites",
        niche2: "Law Firms",
        niche2Desc: "15 discovered · 14 websites",
        niche3: "Real Estate Agencies",
        niche3Desc: "25 discovered · 22 websites",
        readyBadge: "READY",
        batchText: "Batch Capacity:",
        batchSub: "60 leads ready for automated DOM scrape & audit",
        estTime: "Estimated Audit Time: ~45 seconds",
      },
      sales: {
        title: "Lead Thermometer & Deal Stage",
        sub: "Scored automatically based on audit severity",
        hotBadge: "🔥 HOT (Urgent Need)",
        stage1: "1. Discovered",
        stage1Val: "42 Leads",
        stage2: "2. Audited",
        stage2Val: "38 Qualified",
        stage3: "3. Proposal Sent",
        stage3Val: "19 Outreaches",
        stage4: "4. Closed / Won",
        stage4Val: "$4,800 USD Closed",
      },
    },
  };

  const c = content[lang] || content.es;

  return (
    <section id="interactive-showcase" className="py-24 px-6 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8ff5c]/10 border border-[#e8ff5c]/30 text-[#e8ff5c] text-xs font-mono font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{c.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white"
          >
            {c.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/60 text-base max-w-2xl mx-auto"
          >
            {c.sub}
          </motion.p>
        </div>

        {/* Tab Selector Pill Bar */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#e8ff5c] text-black shadow-lg shadow-[#e8ff5c]/20 scale-102"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic High-Fidelity UI Artifact Container */}
        <div className="rounded-3xl border border-white/15 bg-card/70 backdrop-blur-xl p-4 sm:p-7 shadow-2xl overflow-hidden relative">
          {/* Subtle Glow Accent */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#e8ff5c]/5 rounded-full blur-[100px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {activeTab === "offer" && (
              <motion.div
                key="offer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Simulated Lead Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{c.offer.leadName}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/30">
                        {c.offer.leadScore}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{c.offer.leadMeta}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/60"><strong>{c.offer.targetLang}</strong></span>
                  </div>
                </div>

                {/* Itemized Service Stack */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#e8ff5c] font-bold">{c.offer.hookTag}</span>
                      <span className="text-base font-mono font-extrabold text-white">{c.offer.hookPrice}</span>
                    </div>
                    <div className="font-bold text-sm text-white">{c.offer.hookTitle}</div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {c.offer.hookDesc}
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {c.offer.hookBenefit}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#e8ff5c]/40 bg-[#e8ff5c]/5 space-y-3 relative">
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-[#e8ff5c] text-black text-[10px] font-mono font-extrabold uppercase">
                      {c.offer.coreBadge}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#e8ff5c] font-bold">{c.offer.coreTag}</span>
                      <span className="text-base font-mono font-extrabold text-[#e8ff5c]">{c.offer.corePrice}</span>
                    </div>
                    <div className="font-bold text-sm text-white">{c.offer.coreTitle}</div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {c.offer.coreDesc}
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {c.offer.coreBenefit}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-purple-400 font-bold">{c.offer.retainerTag}</span>
                      <span className="text-base font-mono font-extrabold text-white">{c.offer.retainerPrice}</span>
                    </div>
                    <div className="font-bold text-sm text-white">{c.offer.retainerTitle}</div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {c.offer.retainerDesc}
                    </p>
                    <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> {c.offer.retainerBenefit}
                    </div>
                  </div>
                </div>

                {/* Auto-Generated Brand Palette and WhatsApp Link */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-white/40">{c.offer.paletteLabel}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#0284c7] border border-white/40" title="Primary #0284c7" />
                      <div className="w-5 h-5 rounded-full bg-[#38bdf8] border border-white/40" title="Accent #38bdf8" />
                      <div className="w-5 h-5 rounded-full bg-[#0f172a] border border-white/40" title="Dark #0f172a" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60">{c.offer.bundleTotal} <strong className="text-[#e8ff5c] text-sm">$400 USD</strong></span>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-1.5 h-8 cursor-pointer">
                      <Send className="w-3.5 h-3.5" />
                      <span>{c.offer.sendBtn}</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "audits" && (
              <motion.div
                key="audits"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{c.audits.title}</h3>
                    <p className="text-xs font-mono text-muted-foreground">{c.audits.sub}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#e8ff5c]/10 text-[#e8ff5c] font-mono text-xs font-bold border border-[#e8ff5c]/30">
                    {c.audits.evaluated}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Vertical 1 */}
                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{c.audits.card1Title}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">{c.audits.card1Score}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-rose-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{c.audits.card1Bad1}</span>
                      </div>
                      <div className="text-rose-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>{c.audits.card1Bad2}</span>
                      </div>
                      <div className="text-emerald-300 text-[11px] flex items-start gap-1.5 pt-1">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{c.audits.card1Fix}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical 2 */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{c.audits.card2Title}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">{c.audits.card2Score}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-amber-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">✕</span>
                        <span>{c.audits.card2Bad1}</span>
                      </div>
                      <div className="text-amber-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">✕</span>
                        <span>{c.audits.card2Bad2}</span>
                      </div>
                      <div className="text-emerald-300 text-[11px] flex items-start gap-1.5 pt-1">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{c.audits.card2Fix}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "hunt" && (
              <motion.div
                key="hunt"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 font-mono">
                  <div>
                    <h3 className="text-lg font-bold text-white">{c.hunt.title}</h3>
                    <p className="text-xs text-muted-foreground">{c.hunt.sub}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#e8ff5c] text-black text-xs font-bold">
                      {c.hunt.targetBadge}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{c.hunt.niche1}</div>
                      <div className="text-[11px] text-white/50">{c.hunt.niche1Desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{c.hunt.readyBadge}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{c.hunt.niche2}</div>
                      <div className="text-[11px] text-white/50">{c.hunt.niche2Desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{c.hunt.readyBadge}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{c.hunt.niche3}</div>
                      <div className="text-[11px] text-white/50">{c.hunt.niche3Desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{c.hunt.readyBadge}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white/70 flex items-center justify-between">
                  <span>{c.hunt.batchText} <strong>{c.hunt.batchSub}</strong></span>
                  <span className="text-[#e8ff5c] font-bold">{c.hunt.estTime}</span>
                </div>
              </motion.div>
            )}

            {activeTab === "sales" && (
              <motion.div
                key="sales"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{c.sales.title}</h3>
                    <p className="text-xs font-mono text-muted-foreground">{c.sales.sub}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                      {c.sales.hotBadge}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="text-white/40 text-[10px] uppercase font-bold">{c.sales.stage1}</div>
                    <div className="text-sm font-bold text-white mt-1">{c.sales.stage1Val}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="text-white/40 text-[10px] uppercase font-bold">{c.sales.stage2}</div>
                    <div className="text-sm font-bold text-[#e8ff5c] mt-1">{c.sales.stage2Val}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="text-white/40 text-[10px] uppercase font-bold">{c.sales.stage3}</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">{c.sales.stage3Val}</div>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <div className="text-emerald-300 text-[10px] uppercase font-bold">{c.sales.stage4}</div>
                    <div className="text-sm font-bold text-emerald-300 mt-1">{c.sales.stage4Val}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
