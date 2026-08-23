import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";

export function CTA() {
  return (
    <section id="cta" className="relative py-32 px-6 border-t border-white/10">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Built by Hudson. Running live right now.
          </h2>
          <p className="mt-4 text-lg text-white/60">
            See TheLeadMachine work on a real city and niche of your choosing.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-11 px-6 text-base">
              <a href="mailto:hudson@tektone.com.br">Book a call</a>
            </Button>
          </div>
        </FadeIn>
      </div>
      <p className="mt-24 text-center text-sm text-white/30">TheLeadMachine</p>
    </section>
  );
}
