import { FadeIn } from "@/components/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Which regions and niches are supported?",
    a: "Any region Google Places covers. There's a predefined package of 8 niches (dental clinics, real estate, law firms, restaurants, gyms, auto repair, beauty salons, general contractors) — chain-prone categories like hotel franchises are deliberately excluded. Custom niches work too.",
  },
  {
    q: "Do you contact leads for me?",
    a: "No — TheLeadMachine finds and audits businesses and drafts the pitch. Outreach (WhatsApp, calls, email) is still you, though a hot/warm/cold score and a suggested weekly cadence come with every batch.",
  },
  {
    q: "What does the audit actually check?",
    a: "Real conversion friction on the live site — decision fatigue, missing lead capture, no email or social follow-up path, unprofessional assets — scored per service line, with specific findings tied to the actual page, not a generic checklist.",
  },
  {
    q: "Is my data private?",
    a: "It runs on your own Anthropic and Google Places API keys. Nothing is shared across accounts or resold.",
  },
  {
    q: "What LLM/API keys does this use?",
    a: "Anthropic Claude for audits, PRDs, and outreach timelines; Google Places for discovery and autocomplete. Bring your own keys for both.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="mx-auto max-w-2xl">
        <FadeIn className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">FAQ</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="border-white/10">
                <AccordionTrigger className="text-left font-heading font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-white/60">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}
