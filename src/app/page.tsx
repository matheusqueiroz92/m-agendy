"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useThemeDetection } from "@/hooks/use-theme-detection";

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
  const pageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { isDark } = useThemeDetection();

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  const closingBackground = useTransform(
    scrollYProgress,
    [0.55, 0.75, 1],
    reducedMotion || isDark
      ? ["var(--background)", "var(--background)", "var(--background)"]
      : [
          "oklch(0.988 0.002 90)",
          "oklch(0.94 0.02 245)",
          "oklch(0.16 0.045 250)",
        ],
  );

  return (
    <motion.div
      ref={pageRef}
      className="min-h-screen overflow-x-clip"
      style={
        reducedMotion
          ? { backgroundColor: "var(--background)" }
          : { backgroundColor: closingBackground }
      }
    >
      <LandingHeader />
      <HeroSection />
      <SocialProofSection />
      <AboutSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <LandingFooter />
    </motion.div>
  );
};

export default HomePage;
