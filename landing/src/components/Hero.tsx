import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThreeHero } from "@/components/ThreeHero";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <ThreeHero />
      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
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
          className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto"
        >
          TheLeadMachine hunts local businesses with a weak digital presence, audits them like a
          paid conversion consultant would, and writes a priced, ready-to-send proposal — before
          you've made first contact.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-10"
        >
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <a href="#cta">Book a call</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
