import { FadeIn } from "@/components/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

export function Faq() {
  const { t } = useLanguage();
  return (
    <section id="faq" className="py-24 px-6">
      <div className="mx-auto max-w-2xl">
        <FadeIn className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">{t.faq.heading}</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {t.faq.items.map((item, i) => (
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
