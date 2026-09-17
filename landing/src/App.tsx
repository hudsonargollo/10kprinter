import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { RoiCalculator } from "@/components/RoiCalculator";
import { SetupSection } from "@/components/SetupSection";
import { StatementSection } from "@/components/StatementSection";
import { FeatureSection } from "@/components/FeatureSection";
import { UseCaseBanner } from "@/components/UseCaseBanner";
import { ValueStrip } from "@/components/ValueStrip";
import { OfferTiers } from "@/components/OfferTiers";
import { Faq } from "@/components/Faq";
import { CTA } from "@/components/CTA";
import { useLanguage } from "@/i18n/LanguageContext";
import offerTab from "@/assets/screenshots/offer-tab.jpg";
import auditsTab from "@/assets/screenshots/audits-tab.jpg";
import salesTab from "@/assets/screenshots/sales-tab.jpg";
import huntWizard from "@/assets/screenshots/hunt-wizard.jpg";

function App() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#e8ff5c] selection:text-black">
      <Nav />
      <Hero />
      <RoiCalculator />
      <HowItWorks />
      <SetupSection />
      <StatementSection />
      <div id="features">
        <FeatureSection
          title={t.features.audits.title}
          body={t.features.audits.body}
          image={auditsTab}
          imageAlt={t.features.audits.alt}
        />
        <FeatureSection
          title={t.features.pricing.title}
          body={t.features.pricing.body}
          image={offerTab}
          imageAlt={t.features.pricing.alt}
          reverse
        />
        <FeatureSection
          title={t.features.sales.title}
          body={t.features.sales.body}
          image={salesTab}
          imageAlt={t.features.sales.alt}
        />
        <FeatureSection
          title={t.features.hunt.title}
          body={t.features.hunt.body}
          image={huntWizard}
          imageAlt={t.features.hunt.alt}
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
