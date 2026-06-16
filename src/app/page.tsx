"use client";

import { PainCalculatorCtaSection } from "@/components/sections/pain-calculator-cta-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";

import { AboutSection } from "./_components/landing/about-section";
import { ContactSection } from "./_components/landing/contact-section";
import { FaqSection } from "./_components/landing/faq-section";
import { FeaturesSection } from "./_components/landing/features-section";
import { HeroSection } from "./_components/landing/hero-section";
import { LandingFooter } from "./_components/landing/landing-footer";
import { LandingHeader } from "./_components/landing/landing-header";
import { PricingSection } from "./_components/landing/pricing-section";
import { SocialProofSection } from "./_components/landing/social-proof-section";

const HomePage = () => {
  return (
    <div className="bg-background min-h-screen overflow-x-clip">
      <LandingHeader />
      <HeroSection />
      <SocialProofSection />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PainCalculatorCtaSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <LandingFooter />
    </div>
  );
};

export default HomePage;
