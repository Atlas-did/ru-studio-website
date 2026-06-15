import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function QuoteSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="bg-paper py-24 md:py-40 px-6 md:px-12"
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-center">
        {/* Left: Quote */}
        <div className="md:col-span-2">
          <blockquote className="font-serif text-[clamp(24px,3vw,36px)] font-normal text-ink leading-[1.8] tracking-wide">
            向历史借灵感，
            <br />
            为当代造美物。
          </blockquote>
          <p className="mt-8 font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">
            Confucian Culture Creative Studio
          </p>
        </div>

        {/* Right: Image */}
        <div className="md:col-span-3">
          <div className="relative aspect-[4/5] max-w-lg ml-auto overflow-hidden">
            <img
              src="/assets/hero-still-life.jpg"
              alt="毛笔、砚台、宣纸与几何直尺的静物摄影"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Subtle grain overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
