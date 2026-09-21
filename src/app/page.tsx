import { Nav, Footer } from "@/components/chrome";
import {
  Hero,
  HeroTicker,
  ProblemSection,
  SystemSection,
  CapabilitiesSection,
  ArchSection,
  SampleRunSection,
  BenchSection,
  ImpactSection,
  RoadmapSection,
  CtaBand,
} from "@/components/landing";

export default function Home() {
  return (
    <main>
      <Nav />
      <div className="pt-[57px]">
        <HeroTicker />
      </div>
      <Hero />
      <ProblemSection />
      <SystemSection />
      <CapabilitiesSection />
      <ArchSection />
      <SampleRunSection />
      <BenchSection />
      <ImpactSection />
      <RoadmapSection />
      <CtaBand />
      <Footer />
    </main>
  );
}
