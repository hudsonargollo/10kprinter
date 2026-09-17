import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Clock, DollarSign, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

export function RoiCalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(40);
  const [closeRate, setCloseRate] = useState(12);
  const [dealSize, setDealSize] = useState(750);

  const closedDeals = Math.round((leadsPerMonth * closeRate) / 100);
  const monthlyRevenue = Math.max(closedDeals * dealSize, 0);
  const annualRevenue = monthlyRevenue * 12;
  const hoursSaved = Math.round(leadsPerMonth * 1.2); // ~1.2 hrs saved per manual audit/proposal

  return (
    <section id="roi-calculator" className="py-24 px-6 border-t border-white/10 relative overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8ff5c]/10 border border-[#e8ff5c]/20 text-[#e8ff5c] text-xs font-mono font-semibold mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>ROI ESTIMATOR</span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white">
            How much revenue is leaking in your city?
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/60 max-w-2xl mx-auto">
            Calculate your projected agency pipeline when you replace manual prospecting with automated audits and instant pricing.
          </p>
        </FadeIn>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Box */}
          <div className="lg:col-span-7 bg-[#17111d]/90 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            {/* Slider 1: Leads */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80 font-medium">Businesses Audited per Month</span>
                <span className="text-[#e8ff5c] font-mono font-bold text-base">{leadsPerMonth} leads</span>
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
                <span>10 leads</span>
                <span>100 leads</span>
                <span>200 leads</span>
              </div>
            </div>

            {/* Slider 2: Close Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80 font-medium">Estimated Outreach Close Rate</span>
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
                <span>5% (Cold)</span>
                <span>15% (Target)</span>
                <span>35% (Warm/Referral)</span>
              </div>
            </div>

            {/* Slider 3: Deal Size */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80 font-medium">Average Proposal / Fix Bundle Size</span>
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
                <span>$200 (Quick Win)</span>
                <span>$800 (Stack)</span>
                <span>$3,000 (Full Retainer)</span>
              </div>
            </div>
          </div>

          {/* Output Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#22172f] to-[#120d18] border border-[#e8ff5c]/30 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8ff5c]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-[#e8ff5c] block mb-1">
                  Projected Monthly Pipeline
                </span>
                <motion.div
                  key={monthlyRevenue}
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tight flex items-baseline gap-1"
                >
                  <span>${monthlyRevenue.toLocaleString()}</span>
                  <span className="text-sm font-sans font-normal text-white/40">/ mo</span>
                </motion.div>
                <p className="text-xs font-mono text-emerald-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>${annualRevenue.toLocaleString()} / year run rate</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-left">
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                  <span className="text-[11px] font-mono text-white/40 block flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#e8ff5c]" /> Closed Deals
                  </span>
                  <span className="text-lg font-mono font-bold text-white mt-1 block">
                    {closedDeals} <span className="text-xs font-normal text-white/40">clients</span>
                  </span>
                </div>
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                  <span className="text-[11px] font-mono text-white/40 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#e8ff5c]" /> Time Saved
                  </span>
                  <span className="text-lg font-mono font-bold text-white mt-1 block">
                    ~{hoursSaved} <span className="text-xs font-normal text-white/40">hrs/mo</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/app"
                className="w-full py-3 px-5 rounded-xl bg-[#e8ff5c] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#d8ef4c] transition-all shadow-lg hover:shadow-[#e8ff5c]/25 cursor-pointer"
              >
                <span>Launch App & Run Free Hunt</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="text-[11px] text-white/40 text-center block mt-2">
                No credit card required • Instant live results
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
