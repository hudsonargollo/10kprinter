import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, Zap, Copy, Check, Sparkles, MessageCircle } from "lucide-react";

interface SampleAudit {
  id: string;
  niche: string;
  businessName: string;
  city: string;
  website: string;
  tempScore: "HOT" | "WARM" | "COLD";
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

const SAMPLE_DATA: SampleAudit[] = [
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
    city: "São Paulo, SP",
    website: "vanguardlaw-demo.br",
    tempScore: "HOT",
    tempColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    leakEstimate: "R$ 18.000 / mês",
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
    samplePitch: "Olá Dr. Roberto! Notamos que o formulário do Vanguard tem 9 campos no celular, o que derruba mais de 50% dos contatos urgentes. Preparamos uma proposta enxuta de triagem em 2 passos para triplicar seus leads...",
  },
  {
    id: "realestate",
    niche: "Luxury Real Estate",
    businessName: "Aura Prime Properties",
    city: "London / Santa Cruz",
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
];

export function LiveAuditSimulator() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const audit = SAMPLE_DATA[selectedIdx];

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
          <span>REAL-TIME AUDIT</span>
        </div>
      </div>

      {/* Niche Selector Pills */}
      <div className="p-3 border-b border-white/10 flex gap-2 overflow-x-auto no-scrollbar bg-black/20">
        {SAMPLE_DATA.map((item, idx) => (
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
                  {audit.tempScore} LEAD
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 font-mono">
                {audit.city} • <span className="underline decoration-white/20">{audit.website}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">Revenue Leaking</span>
              <span className="text-sm font-mono font-bold text-rose-400">{audit.leakEstimate}</span>
            </div>
          </div>

          {/* Audit Findings */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-2 block">
              Audited Conversion Friction
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
                Auto-Generated Proposal
              </span>
              <span className="text-xs font-mono font-bold text-white">
                Total: <span className="text-[#e8ff5c] text-sm">${audit.proposalBundle.total}</span>
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
                <MessageCircle className="w-3 h-3 text-[#e8ff5c]" /> Ready-to-Send WhatsApp Pitch
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-mono text-[#e8ff5c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy Pitch"}
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
              <span>Scan & Hunt Real Leads in Your City</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
