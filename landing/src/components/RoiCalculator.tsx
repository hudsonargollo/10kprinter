import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { useLanguage } from "@/i18n/LanguageContext";

export function RoiCalculator() {
  const { t, lang } = useLanguage();
  const [leadsPerMonth, setLeadsPerMonth] = useState(40);
  const [closeRate, setCloseRate] = useState(12);
  const [dealSize, setDealSize] = useState(750);

  const closedDeals = Math.round((leadsPerMonth * closeRate) / 100);
  const monthlyRevenue = Math.max(closedDeals * dealSize, 0);
  const annualRevenue = monthlyRevenue * 12;
  const hoursSaved = Math.round(leadsPerMonth * 1.2); // ~1.2 hrs saved per manual audit/proposal

  const r = t.roiCalculator;

  const closeRateLegend = {
    es: ["5% (Frío)", "15% (Objetivo)", "35% (Referidos/Tibio)"],
    pt: ["5% (Frio)", "15% (Alvo)", "35% (Indicação/Morno)"],
    en: ["5% (Cold)", "15% (Target)", "35% (Warm/Referral)"],
  }[lang] || ["5% (Cold)", "15% (Target)", "35% (Warm/Referral)"];

  const dealSizeLegend = {
    es: ["$200 (Gancho Rápido)", "$800 (Paquete)", "$3,000 (Retainer Completo)"],
    pt: ["$200 (Entrada Rápida)", "$800 (Pacote)", "$3,000 (Retainer Completo)"],
    en: ["$200 (Quick Win)", "$800 (Stack)", "$3,000 (Full Retainer)"],
  }[lang] || ["$200 (Quick Win)", "$800 (Stack)", "$3,000 (Full Retainer)"];

  const units = {
    es: {
      leads: "leads",
      perMo: "/ mes",
      yearRate: "/ año ritmo anual",
      clients: "clientes",
      hrsMo: "hrs/mes",
      cta: "Entrar a la App y Rastrear Gratis",
      noCc: "Sin tarjeta de crédito requerida • Resultados inmediatos",
    },
    pt: {
      leads: "leads",
      perMo: "/ mês",
      yearRate: "/ ano taxa anual",
      clients: "clientes",
      hrsMo: "hrs/mês",
      cta: "Acessar o Painel e Buscar Grátis",
      noCc: "Sem cartão de crédito necessário • Resultados imediatos",
    },
    en: {
      leads: "leads",
      perMo: "/ mo",
      yearRate: "/ year run rate",
      clients: "clients",
      hrsMo: "hrs/mo",
      cta: "Launch App & Run Free Hunt",
      noCc: "No credit card required • Instant live results",
    },
  }[lang] || {
    leads: "leads",
    perMo: "/ mo",
    yearRate: "/ year run rate",
    clients: "clients",
    hrsMo: "hrs/mo",
    cta: "Launch App & Run Free Hunt",
    noCc: "No credit card required • Instant live results",
  };

  return (
    <section id="roi-calculator" className="py-24 px-6 border-t border-white/10 relative overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8ff5c]/10 border border-[#e8ff5c]/20 text-[#e8ff5c] text-xs font-mono font-semibold mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>{r.badge}</span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white">
            {r.heading}
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/60 max-w-2xl mx-auto">
            {r.sub}
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Box */}
          <div className="lg:col-span-7 bg-[#17111d]/90 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            {/* Slider 1: Leads */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80 font-medium">{r.leadsLabel}</span>
                <span className="text-[#e8ff5c] font-mono font-bold text-base">{leadsPerMonth} {units.leads}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={leadsPerMonth}
                onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                className="w-full accent-[#e8ff5c] bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono">
                <span>10 {units.leads}</span>
                <span>100 {units.leads}</span>
                <span>200 {units.leads}</span>
              </div>
            </div>

            {/* Slider 2: Close Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80 font-medium">{r.closeRateLabel}</span>
                <span className="text-[#e8ff5c] font-mono font-bold text-base">{closeRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={closeRate}
                onChange={(e) => setCloseRate(Number(e.target.value))}
                className="w-full accent-[#e8ff5c] bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono">
                <span>{closeRateLegend[0]}</span>
                <span>{closeRateLegend[1]}</span>
                <span>{closeRateLegend[2]}</span>
              </div>
            </div>

            {/* Slider 3: Deal Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80 font-medium">{r.dealSizeLabel}</span>
                <span className="text-[#e8ff5c] font-mono font-bold text-base">${dealSize}</span>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="50"
                value={dealSize}
                onChange={(e) => setDealSize(Number(e.target.value))}
                className="w-full accent-[#e8ff5c] bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono">
                <span>{dealSizeLegend[0]}</span>
                <span>{dealSizeLegend[1]}</span>
                <span>{dealSizeLegend[2]}</span>
              </div>
            </div>
          </div>

          {/* Output Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#22172f] to-[#120d18] border border-[#e8ff5c]/30 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8ff5c]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#e8ff5c] block mb-1">
                  {r.monthlyProjected}
                </span>
                <motion.div
                  key={monthlyRevenue}
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-1"
                >
                  <span>${monthlyRevenue.toLocaleString()}</span>
                  <span className="text-sm font-sans font-normal text-white/40">{units.perMo}</span>
                </motion.div>
                <p className="text-xs font-mono text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>${annualRevenue.toLocaleString()} {units.yearRate}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-left">
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                  <span className="text-[11px] font-mono text-white/40 block flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#e8ff5c]" /> {r.closedPerMonth}
                  </span>
                  <span className="text-lg font-mono font-bold text-white mt-1 block">
                    {closedDeals} <span className="text-xs font-normal text-white/40">{units.clients}</span>
                  </span>
                </div>
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                  <span className="text-[11px] font-mono text-white/40 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#e8ff5c]" /> {r.hoursSaved}
                  </span>
                  <span className="text-lg font-mono font-bold text-white mt-1 block">
                    ~{hoursSaved} <span className="text-xs font-normal text-white/40">{units.hrsMo}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/app"
                className="w-full py-3 px-5 rounded-xl bg-[#e8ff5c] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#d8ef4c] transition-all shadow-lg hover:shadow-[#e8ff5c]/25 cursor-pointer"
              >
                <span>{units.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-[11px] text-white/40 text-center block mt-2">
                {units.noCc}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
