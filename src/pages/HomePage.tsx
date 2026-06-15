import HeroSection from '@/sections/HeroSection';
import QuoteSection from '@/sections/QuoteSection';
import ConceptsSection from '@/sections/ConceptsSection';
import WorksSection from '@/sections/WorksSection';
import ParallaxStrip from '@/sections/ParallaxStrip';
import JournalPreview from '@/sections/JournalPreview';
import CTASection from '@/sections/CTASection';
import SectionTransition from '@/components/SectionTransition';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionTransition from="#111111" to="#E8E4DC" height={100} />
      <QuoteSection />
      <SectionTransition from="#E8E4DC" to="#111111" height={100} />
      <ConceptsSection />
      <SectionTransition from="#111111" to="#2C2C2C" height={80} />
      <WorksSection />
      <SectionTransition from="#2C2C2C" to="#111111" height={60} />
      <ParallaxStrip />
      <SectionTransition from="#111111" to="#F5F2EB" height={80} />
      <JournalPreview />
      <CTASection />
    </>
  );
}
