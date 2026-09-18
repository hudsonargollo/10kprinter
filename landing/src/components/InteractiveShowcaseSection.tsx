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
            <span>INTERACTIVE SYSTEM ARTIFACTS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white"
          >
            {lang === "es"
              ? "El Motor de Prospección en Detalle"
              : lang === "pt"
              ? "O Motor de Prospecção em Detalhes"
              : "The Prospecting Engine in Detail"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/60 text-base max-w-2xl mx-auto"
          >
            {lang === "es"
              ? "Explora cada módulo del sistema: cotización automática, diagnósticos técnicos, búsqueda geográfica y embudo de conversión."
              : lang === "pt"
              ? "Explore cada módulo do sistema: precificação automática, diagnósticos técnicos, caça geográfica e funil de vendas."
              : "Explore every system module: automatic pricing, technical diagnostics, geographic hunting, and conversion pipeline."}
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
                      <h3 className="text-lg font-bold text-white">Clínica Dental Santa Cruz</h3>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold border border-rose-500/30">
                        HOT LEAD · Score: 88
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">https://clinicadentalscz.com · Santa Cruz, Bolivia</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white/60">Target Language: <strong>ES (Spanish)</strong></span>
                  </div>
                </div>

                {/* Itemized Service Stack */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#e8ff5c] font-bold">HOOK OFFER</span>
                      <span className="text-base font-mono font-extrabold text-white">$100 USD</span>
                    </div>
                    <div className="font-bold text-sm text-white">Mobile Booking & WhatsApp CTA</div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Implement sticky bottom WhatsApp consultation bar and instant patient intake form.
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High conversion impulse hook
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#e8ff5c]/40 bg-[#e8ff5c]/5 space-y-3 relative">
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-[#e8ff5c] text-black text-[10px] font-mono font-extrabold uppercase">
                      CORE REDESIGN
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#e8ff5c] font-bold">WEBSITE REDESIGN</span>
                      <span className="text-base font-mono font-extrabold text-[#e8ff5c]">$300 USD</span>
                    </div>
                    <div className="font-bold text-sm text-white">Next.js Fast Dental Landing Page</div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Full page rebuild with extracted brand tokens, dynamic treatments grid, and social proof.
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 95+ PageSpeed Mobile Score
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-purple-400 font-bold">MONTHLY RETAINER</span>
                      <span className="text-base font-mono font-extrabold text-white">$250/mo</span>
                    </div>
                    <div className="font-bold text-sm text-white">Review Automation & SEO Engine</div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Google Maps ranking maintenance and post-visit WhatsApp review collection.
                    </p>
                    <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Recurring agency revenue
                    </div>
                  </div>
                </div>

                {/* Auto-Generated Brand Palette and WhatsApp Link */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-white/40">Extracted Brand Palette:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#0284c7] border border-white/40" title="Primary #0284c7" />
                      <div className="w-5 h-5 rounded-full bg-[#38bdf8] border border-white/40" title="Accent #38bdf8" />
                      <div className="w-5 h-5 rounded-full bg-[#0f172a] border border-white/40" title="Dark #0f172a" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60">Proposal Bundle Total: <strong className="text-[#e8ff5c] text-sm">$400 USD</strong></span>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-1.5 h-8">
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Proposal</span>
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
                    <h3 className="text-lg font-bold text-white">Live DOM Conversion Rubric</h3>
                    <p className="text-xs font-mono text-muted-foreground">Inspecting DOM nodes, performance metrics, and responsive CTAs</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#e8ff5c]/10 text-[#e8ff5c] font-mono text-xs font-bold border border-[#e8ff5c]/30">
                    4 Verticals Evaluated
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Vertical 1 */}
                  <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">Website Redesign (UX/UI)</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">SCORE: 35/100</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-rose-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>Viewport loads in 4.8s due to unoptimized 4MB hero image.</span>
                      </div>
                      <div className="text-rose-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>Zero direct booking CTA on mobile view above the fold.</span>
                      </div>
                      <div className="text-emerald-300 text-[11px] flex items-start gap-1.5 pt-1">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Fix: Deploy Tailwind landing page with instant sticky booking bar.</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical 2 */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">Marketing & Lead Automation</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">SCORE: 40/100</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-amber-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">✕</span>
                        <span>No email or SMS lead capture incentive for first-time visitors.</span>
                      </div>
                      <div className="text-amber-200 text-[11px] flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">✕</span>
                        <span>Phone number is static text, not a clickable tel: or wa.me link.</span>
                      </div>
                      <div className="text-emerald-300 text-[11px] flex items-start gap-1.5 pt-1">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Fix: Add automatic appointment lead capture form & SMS reminder flow.</span>
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
                    <h3 className="text-lg font-bold text-white">Global Hunt Session</h3>
                    <p className="text-xs text-muted-foreground">Spatial discovery across Google Places API</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#e8ff5c] text-black text-xs font-bold">
                      Target: Santa Cruz de la Sierra, BO
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Dental Clinics</div>
                      <div className="text-[11px] text-white/50">20 discovered · 18 websites</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">READY</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Law Firms</div>
                      <div className="text-[11px] text-white/50">15 discovered · 14 websites</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">READY</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Real Estate Agencies</div>
                      <div className="text-[11px] text-white/50">25 discovered · 22 websites</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">READY</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-white/70 flex items-center justify-between">
                  <span>Batch Capacity: <strong>60 leads ready for automated DOM scrape & audit</strong></span>
                  <span className="text-[#e8ff5c] font-bold">Estimated Audit Time: ~45 seconds</span>
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
                    <h3 className="text-lg font-bold text-white">Lead Thermometer & Deal Stage</h3>
                    <p className="text-xs font-mono text-muted-foreground">Scored automatically based on audit severity</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                      🔥 HOT (Urgent Need)
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="text-white/40 text-[10px] uppercase font-bold">1. Discovered</div>
                    <div className="text-sm font-bold text-white mt-1">42 Leads</div>
                  </div>
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="text-white/40 text-[10px] uppercase font-bold">2. Audited</div>
                    <div className="text-sm font-bold text-[#e8ff5c] mt-1">38 Qualified</div>
                  </div>
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="text-white/40 text-[10px] uppercase font-bold">3. Proposal Sent</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">19 Outreaches</div>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <div className="text-emerald-300 text-[10px] uppercase font-bold">4. Closed / Won</div>
                    <div className="text-sm font-bold text-emerald-300 mt-1">$4,800 USD Closed</div>
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
