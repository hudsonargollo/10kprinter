import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

export function CTA() {
  return (
    <section id="cta" className="relative pt-32 pb-16 px-6 border-t border-white/10">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
            Built by Hudson. Running live right now.
          </h2>
          <p className="mt-4 text-lg text-white/60">
            See TheLeadMachine work on a real city and niche of your choosing.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-11 px-6 text-base rounded-full">
              <a href="mailto:hudson@tektone.com.br">Book a call</a>
            </Button>
          </div>
        </FadeIn>
      </div>

      <div className="mt-28 select-none">
        <p className="font-heading text-center font-extrabold tracking-tight leading-[0.9] text-[10vw] md:text-[7vw] bg-clip-text text-transparent bg-gradient-to-b from-white/20 to-white/0">
          THE MACHINE THAT
          <br />
          FINDS YOUR NEXT CLIENT.
        </p>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40 border-t border-white/10 pt-8 max-w-6xl mx-auto">
        <span>TheLeadMachine</span>
        <div className="flex gap-6">
          <a href="#how-it-works" className="hover:text-white/70">How it works</a>
          <a href="#pricing" className="hover:text-white/70">Pricing</a>
          <a href="#faq" className="hover:text-white/70">FAQ</a>
          <a href="/app" className="hover:text-white/70">Dashboard</a>
        </div>
      </div>
    </section>
  );
}
