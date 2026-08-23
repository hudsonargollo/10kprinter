import { FadeIn } from "@/components/FadeIn";

const ITEMS = [
  { title: "Real businesses, not stale lists", body: "Discovered fresh from Google Places, deduped, filtered to businesses that actually have a website to audit." },
  { title: "The full pipeline, not a mockup", body: "Scrape, audit, PRD, and sales tracking all run end to end on real leads, today." },
  { title: "Priced automatically", body: "Every finding becomes an itemized dollar amount — no blank page when it's time to quote." },
  { title: "Your API keys, your data", body: "Runs on your own Anthropic and Google Places accounts. Nothing shared, nothing resold." },
];

export function ValueStrip() {
  return (
    <section className="py-16 px-6 border-y border-white/10">
      <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {ITEMS.map((item, i) => (
          <FadeIn key={item.title} delay={i * 0.06}>
            <div className="h-1.5 w-8 rounded-full bg-primary mb-4" />
            <h4 className="font-heading font-semibold text-lg">{item.title}</h4>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">{item.body}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
