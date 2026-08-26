import HeroSection from '@/sections/HeroSection';
import QuoteSection from '@/sections/QuoteSection';
import ConceptsSection from '@/sections/ConceptsSection';
import WorksSection from '@/sections/WorksSection';
import ParallaxStrip from '@/sections/ParallaxStrip';
import JournalPreview from '@/sections/JournalPreview';
import CTASection from '@/sections/CTASection';
import SEO from '@/components/SEO';
import SectionTransition from '@/components/SectionTransition';
import TimelineSection from '@/components/interactive/TimelineSection';

export default function HomePage() {
  return (
    <>
      <SEO
        title="儒意 RU STUDIO — 向历史借灵感，为当代造美物"
        description="儒意 RU STUDIO，儒家文化创意工作室：以孔府档案与孔庙建筑为蓝本，将千年文脉转化为可触可感的当代器物。经典复刻 · 生活美学 · 互动体验 · 定制服务。"
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: '儒意 RU STUDIO',
          alternateName: '儒意',
          url: '/',
          description: '儒家文化创意工作室',
          foundingLocation: '山东省曲阜市',
          email: 'wu27@qfnu.edu.cn',
        }}
      />

      <HeroSection />
      <SectionTransition from="#0A0A0A" to="#ECE8E0" height={100} />
      <QuoteSection />
      <SectionTransition from="#ECE8E0" to="#0A0A0A" height={100} />
      <TimelineSection />
      <ConceptsSection />
      <WorksSection />
      <ParallaxStrip />
      <JournalPreview />
      <CTASection />
    </>
  );
}
