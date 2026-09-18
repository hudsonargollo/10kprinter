import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThreeHero } from "@/components/ThreeHero";
import { LiveAuditSimulator } from "@/components/LiveAuditSimulator";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

export function Hero() {
  const { t, lang } = useLanguage();

  const heroLabels = {
    es: {
      badge: "MOTOR DE AUDITORÍA Y PROPUESTAS CON IA",
      trial: "Comenzar Prueba Gratis",
      calc: "Calcular ROI",
      badge1: "Cero listas genéricas",
      badge2: "Basado en auditorías DOM en vivo",
    },
    pt: {
      badge: "MOTOR DE AUDITORIA E PROPOSTAS COM IA",
      trial: "Começar Teste Grátis",
      calc: "Calcular ROI",
      badge1: "Zero checklists genéricos",
      badge2: "Baseado em auditorias DOM ao vivo",
    },
    en: {
      badge: "AI AUDIT & PROPOSAL ENGINE",
      trial: "Start Free Trial",
      calc: "Calculate ROI",
      badge1: "Zero boilerplate checklists",
      badge2: "Grounded in live DOM audits",
    },
  }[lang] || {
    badge: "AI AUDIT & PROPOSAL ENGINE",
    trial: "Start Free Trial",
    calc: "Calculate ROI",
    badge1: "Zero boilerplate checklists",
    badge2: "Grounded in live DOM audits",
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
      <ThreeHero />
      <div className="relative z-10 mx-auto max-w-6xl px-6 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Sharp SaaS Pitch & Direct Action */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8ff5c]/10 border border-[#e8ff5c]/25 text-[#e8ff5c] text-xs font-mono font-semibold shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{heroLabels.badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-white"
          >
            {t.hero.headline[0]}
            <br />
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              {t.hero.headline[1]}
            </span>
            <br />
            <span className="text-[#e8ff5c]">{t.hero.headline[2]}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg text-white/70 max-w-xl leading-relaxed"
          >
            {t.hero.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Button
              asChild
              size="lg"
              className="h-12 px-7 text-base rounded-full bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c] shadow-lg shadow-[#e8ff5c]/20 hover:scale-[1.02] transition-all"
            >
              <a href="/app" className="flex items-center gap-2">
                <span>{heroLabels.trial}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 text-base rounded-full border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
            >
              <a href="#roi-calculator" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#e8ff5c]" />
                <span>{heroLabels.calc}</span>
              </a>
            </Button>
          </motion.div>

          {/* Social Proof Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/50 pt-3 border-t border-white/10"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{heroLabels.badge1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#e8ff5c]" />
              <span>{heroLabels.badge2}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Live Interactive Audit Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="lg:col-span-6 w-full"
        >
          <LiveAuditSimulator />
        </motion.div>
      </div>
    </section>
  );
}
