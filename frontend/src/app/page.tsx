import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { InteractiveDemo } from "@/components/sections/interactive-demo";
import { CTASection } from "@/components/sections/cta-section";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "AI Resume Intelligence — Next-Gen ATS & Skill Gap Matcher",
  description:
    "Analyze candidate resumes against job descriptions, uncover missing skill gaps, and optimize bullet points automatically with precision AI.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-purple-500 selection:text-white relative">
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <InteractiveDemo />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
