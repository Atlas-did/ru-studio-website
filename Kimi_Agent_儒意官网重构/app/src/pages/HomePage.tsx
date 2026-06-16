import { HeroSection } from '@/sections/HeroSection';
import { QuoteSection } from '@/sections/QuoteSection';
import { ConceptsSection } from '@/sections/ConceptsSection';
import { WorksSection } from '@/sections/WorksSection';
import { ParallaxStrip } from '@/sections/ParallaxStrip';
import { JournalPreview } from '@/sections/JournalPreview';
import { CTASection } from '@/sections/CTASection';
import { SectionTransition } from '@/components/SectionTransition';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <SectionTransition variant="ink-fade" />
      <QuoteSection />
      <SectionTransition variant="ink-fade" />
      <ConceptsSection />
      <SectionTransition variant="ink-fade" />
      <WorksSection />
      <ParallaxStrip />
      <JournalPreview />
      <SectionTransition variant="ink-fade" />
      <CTASection />
    </>
  );
}
