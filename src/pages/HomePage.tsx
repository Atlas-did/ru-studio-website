import HeroSection from '@/sections/HeroSection';
import QuoteSection from '@/sections/QuoteSection';
import ConceptsSection from '@/sections/ConceptsSection';
import WorksSection from '@/sections/WorksSection';
import ParallaxStrip from '@/sections/ParallaxStrip';
import JournalPreview from '@/sections/JournalPreview';
import CTASection from '@/sections/CTASection';
import CultureDataSection from '@/sections/CultureDataSection';
import SEO from '@/components/SEO';
import SectionTransition from '@/components/SectionTransition';
import MarqueeBand from '@/components/MarqueeBand';
import MediaPlaceholder from '@/components/MediaPlaceholder';
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
      {/* 编辑部式倾斜文字带，打破横平竖直 */}
      <MarqueeBand text="儒意 RU STUDIO · 孔子故里 · 向历史借灵感，为当代造美物" tone="ink" />
      <TimelineSection />
      <ConceptsSection />
      <WorksSection />
      <ParallaxStrip />

      {/* 品牌影像占位区 —— 将来放品牌影片 / 幕后花絮 */}
      <section className="relative bg-ink-lighter py-24 md:py-32 overflow-hidden">
        <span aria-hidden="true" className="giant-char left-[2vw] top-0 text-[16vw]">映</span>
        <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <span className="block text-overline text-stone mb-4">BRAND FILM · 影像志</span>
              <h2 className="font-serif text-display-m text-mist">让器物动起来</h2>
            </div>
            <p className="hidden md:block text-caption text-stone max-w-[220px] text-right leading-loose">
              工艺影像 · 幕后纪实 · 三孔采风
              <br />
              影片正在摄制中
            </p>
          </div>
          <MediaPlaceholder
            variant="film"
            caption="品牌影片与幕后花絮将在此呈现"
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      <CultureDataSection />
      <JournalPreview />
      <MarqueeBand text="见古 · 知新 · 传承 · 再造" tone="cinnabar" />
      <CTASection />
    </>
  );
}
