import { AuditWithoutExposure } from "@/components/landing/audit-without-exposure";
import { AwardValidationShowcase } from "@/components/landing/award-validation-showcase";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { ProblemSection } from "@/components/landing/problem-section";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";
import { TrustStrip } from "@/components/landing/trust-strip";
import { UseCases } from "@/components/landing/use-cases";

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <main className="min-h-screen overflow-hidden bg-ofora-canvas text-ofora-ink">
        <LandingNav />
        <HeroSection />
        <TrustStrip />
        <ProblemSection />
        <HowItWorks />
        <AwardValidationShowcase />
        <AuditWithoutExposure />
        <UseCases />
        <FinalCta />
        <LandingFooter />
      </main>
    </SmoothScrollProvider>
  );
}
