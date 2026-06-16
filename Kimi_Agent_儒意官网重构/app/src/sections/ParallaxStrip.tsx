import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ParallaxStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        xPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const tags = [
    '文化品牌', 'CULTURE', '文创产品', '文创 DESIGN',
    '传统符号', 'TRADITION', '当代美学', 'AESTHETICS',
    '孔府档案', 'ARCHIVE', '儒家哲学', 'PHILOSOPHY',
    '互动体验', 'EXPERIENCE', '定制服务', 'BESPOKE',
  ];

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink py-16 md:py-20 overflow-hidden border-y border-border-subtle"
    >
      <div
        ref={trackRef}
        className="flex items-center gap-8 md:gap-12 whitespace-nowrap will-change-transform"
      >
        {[...tags, ...tags].map((tag, i) => (
          <span
            key={i}
            className={`flex-shrink-0 ${
              i % 2 === 0
                ? 'font-serif text-display-m text-mist/20'
                : 'text-overline text-stone/30'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
