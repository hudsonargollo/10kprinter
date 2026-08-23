import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SetupSection } from "@/components/SetupSection";
import { StatementSection } from "@/components/StatementSection";
import { FeatureSection } from "@/components/FeatureSection";
import { UseCaseBanner } from "@/components/UseCaseBanner";
import { ValueStrip } from "@/components/ValueStrip";
import { OfferTiers } from "@/components/OfferTiers";
import { Faq } from "@/components/Faq";
import { CTA } from "@/components/CTA";
import offerTab from "@/assets/screenshots/offer-tab.jpg";
import auditsTab from "@/assets/screenshots/audits-tab.jpg";
import salesTab from "@/assets/screenshots/sales-tab.jpg";
import huntWizard from "@/assets/screenshots/hunt-wizard.jpg";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <HowItWorks />
      <SetupSection />
      <StatementSection />
      <div id="features">
        <FeatureSection
          title="Real audits, not generic advice"
          body="Every finding is specific to the actual business — what's good, what's leaking revenue, and exactly how to fix it. No boilerplate checklists."
          image={auditsTab}
          imageAlt="A real audit for a dental clinic, showing good/bad/fix findings"
        />
        <FeatureSection
          title="Pricing that's already done for you"
          body="Findings become an itemized, priced offer automatically — lead with the cheapest line item, then stack toward the full bundle."
          image={offerTab}
          imageAlt="An itemized offer with pricing per service and a bundle total"
          reverse
        />
        <FeatureSection
          title="A thermometer for every lead"
          body="Hot, warm, cold — scored from the audit itself. Track notes, message on WhatsApp, and move every deal through a real pipeline."
          image={salesTab}
          imageAlt="A lead's sales tab showing its hot/warm/cold score and WhatsApp contact button"
        />
        <FeatureSection
          title="Self-serve discovery, one city at a time"
          body="Pick a place, pick niches, run the hunt. Live progress per niche, no manual API calls."
          image={huntWizard}
          imageAlt="The Hunt Wizard's niche-selection step"
          reverse
        />
      </div>
      <UseCaseBanner />
      <ValueStrip />
      <OfferTiers />
      <Faq />
      <CTA />
    </div>
  );
}

export default App;
