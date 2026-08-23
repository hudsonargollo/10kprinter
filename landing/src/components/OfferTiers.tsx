import { FadeIn } from "@/components/FadeIn";

const TIERS = [
  {
    name: "Quick Win",
    price: "$200",
    body: "One line item — a single audited fix, priced and ready to pitch on its own.",
    tone: "bg-white/[0.03]",
  },
  {
    name: "Stack & Save",
    price: "$200 × N",
    body: "Qualify for more than one vertical? Stack them — each one still priced independently.",
    tone: "bg-white/[0.03]",
  },
  {
    name: "Consult Add-on",
    price: "+$100",
    body: "A standing 1-hour strategy consultation with Hudson, offered on every lead.",
    tone: "bg-white/[0.03]",
  },
  {
    name: "Full Bundle",
    price: "The total",
    body: "Every qualifying line item plus the consult add-on, summed automatically on the Offer tab.",
    tone: "bg-primary text-primary-foreground",
  },
];

export function OfferTiers() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
            Priced the way it actually sells
          </h2>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">
            No flat multi-thousand-dollar quote. Itemized line items, stacked into a bundle only
            when the audit says they should be.
          </p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 0.06}>
              <div className={`rounded-2xl p-6 h-full flex flex-col ${tier.tone}`}>
                <div className="text-sm font-medium opacity-70">{tier.name}</div>
                <div className="mt-2 font-heading text-3xl font-bold">{tier.price}</div>
                <p className="mt-3 text-sm opacity-70 leading-relaxed flex-1">{tier.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
