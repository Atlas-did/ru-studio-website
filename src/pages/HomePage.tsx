import { Link } from 'react-router-dom';
import HeroSection from '@/sections/HeroSection';
import QuoteSection from '@/sections/QuoteSection';
import ConceptsSection from '@/sections/ConceptsSection';
import WorksSection from '@/sections/WorksSection';
import ParallaxStrip from '@/sections/ParallaxStrip';
import JournalPreview from '@/sections/JournalPreview';
import CTASection from '@/sections/CTASection';
import SectionTransition from '@/components/SectionTransition';
import TimelineSection from '@/components/interactive/TimelineSection';
import VideoSection from '@/sections/VideoSection';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';

export default function HomePage() {
  const { data: config } = useSiteData(() => api.getSiteConfig(), { initialData: {} as any });
  return (
    <>
      <HeroSection />
      <SectionTransition from="#111111" to="#E8E4DC" height={100} />
      <QuoteSection />
      <SectionTransition from="#E8E4DC" to="#111111" height={100} />
      {/* Sales entry */}
      <div className="bg-ink py-6 text-center">
        <Link to="/collection" className="inline-block text-overline text-cinnabar brush-underline hover:text-cinnabar-light transition-colors">
          将此意带走 →
        </Link>
      </div>
      <TimelineSection />
      <SectionTransition from="#111111" to="#111111" height={60} />
      <ConceptsSection />
      <SectionTransition from="#111111" to="#2C2C2C" height={80} />
      <WorksSection />
      <SectionTransition from="#2C2C2C" to="#111111" height={60} />
      <ParallaxStrip />
      <SectionTransition from="#111111" to="#111111" height={60} />
      <VideoSection
        videoUrl={(config as any)?.homepageVideoUrl || '/assets/showreel.mp4'}
        posterUrl="/assets/hero-still-life.jpg"
        title={(config as any)?.homepageVideoTitle || '影像作品'}
        subtitle="以当代视角，捕捉千年文脉的光影流转"
      />
      <SectionTransition from="#111111" to="#F5F2EB" height={80} />
      <JournalPreview />
      <CTASection />
    </>
  );
}
