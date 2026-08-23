import { FadeIn } from "@/components/FadeIn";
import auditsTab from "@/assets/screenshots/audits-tab.jpg";

export function StatementSection() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <FadeIn>
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Everything a conversion consultant does, now automatic.
          </h2>
        </FadeIn>
        <FadeIn delay={0.15} className="mt-12">
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img src={auditsTab} alt="A real audit for a dental clinic, showing good, bad, and fix findings" className="w-full block" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
