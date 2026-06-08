"use client";

import { CredixNavbar } from "@/components/credix-navbar";
import { HeroSection, TickerSection, AboutSection, VideoSection, ServicesCardsSection } from "@/components/landing-sections-top";
import { TabbedSection, WhyChooseUsSection, ApproachSection, StatsSection, CTASection, FAQSection, FooterSection } from "@/components/landing-sections-bottom";

export function LandingPage() {
  return (
    <div className="font-sans bg-[#eef3f7] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <CredixNavbar />
      <HeroSection />
      <TickerSection />
      <AboutSection />
      <VideoSection />
      <ServicesCardsSection />
      <TabbedSection />
      <WhyChooseUsSection />
      <ApproachSection />
      <StatsSection />
      <CTASection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
