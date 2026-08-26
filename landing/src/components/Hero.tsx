import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThreeHero } from "@/components/ThreeHero";
import offerTab from "@/assets/screenshots/offer-tab.jpg";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <ThreeHero />
      <div className="relative z-10 mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-heading text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]"
          >
            It finds the leads.
            <br />
            It writes the pitch.
            <br />
            You close.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="mt-6 text-lg text-white/60 max-w-lg"
          >
            MoneyMachine hunts local businesses with a weak digital presence, audits them like a
            paid conversion consultant would, and writes a priced, ready-to-send proposal — before
            you've made first contact.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex gap-3"
          >
            <Button asChild size="lg" className="h-11 px-6 text-base rounded-full">
              <a href="#cta">Book a call</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6 text-base rounded-full border-white/15 bg-transparent">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div
            className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ transform: "perspective(1200px) rotateY(-6deg) rotateX(2deg)" }}
          >
            <img src={offerTab} alt="MoneyMachine's Offer tab, showing itemized pricing for a real lead" className="w-full block" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
