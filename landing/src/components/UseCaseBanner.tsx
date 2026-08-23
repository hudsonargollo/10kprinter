import { FadeIn } from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import salesTab from "@/assets/screenshots/sales-tab.jpg";

export function UseCaseBanner() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="text-center mb-8">
          <Badge className="rounded-full bg-primary text-primary-foreground font-semibold">LIVE NOW</Badge>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight">
            TheLeadMachine in production
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={salesTab}
              alt="A real lead's Sales tab, showing its hot/warm/cold score and a WhatsApp contact button"
              className="w-full block"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
