import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import FederatedLearning from "@/components/FederatedLearning";
import PrivacyAndTradeoff from "@/components/PrivacyAndTradeoff";
import Personalization from "@/components/Personalization";
import SecureAggregation from "@/components/SecureAggregation";
import MethodologyAndResults from "@/components/MethodologyAndResults";
import ImpactAndConclusion from "@/components/ImpactAndConclusion";
import CreatorSection from "@/components/CreatorSection";
import FloatingAIButton from "@/components/FloatingAIButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <HeroSection />
      <ProblemSection />
      <FederatedLearning />
      <PrivacyAndTradeoff />
      <Personalization />
      <SecureAggregation />
      <MethodologyAndResults />
      <ImpactAndConclusion />
      <CreatorSection />
      <FloatingAIButton />
    </main>
  );
}
