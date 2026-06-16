import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getConcepts } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

export default function ConceptsSection() {
  const { data: concepts } = useSiteData(
    () => api.getConcepts(),
    { initialData: getConcepts() }
  );

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    if (!section || !header) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(header.querySelectorAll('.reveal-item'), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // Each concept card — scroll triggered narrative
      itemRefs.current.forEach((item, index) => {
        if (!item) return;

        const numeral = item.querySelector('.numeral');
        const title = item.querySelector('.title');
        const titleEn = item.querySelector('.title-en');
        const desc = item.querySelector('.desc');
        const line = item.querySelector('.line');

        const isEven = index % 2 === 0;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 75%',
            end: 'bottom 25%',
            toggleActions: 'play none none none',
          },
        });

        // Initial states
        gsap.set(numeral, { opacity: 0, y: 20 });
        gsap.set(title, { opacity: 0, y: 30 });
        gsap.set(titleEn, { opacity: 0, y: 20 });
        gsap.set(desc, { opacity: 0, y: 20 });
        gsap.set(line, { scaleX: 0, transformOrigin: isEven ? 'left' : 'right' });

        tl.to(line, { scaleX: 1, duration: 0.8, ease: 'power3.out' }, 0);
        tl.to(numeral, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.1);
        tl.to(title, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.2);
        tl.to(titleEn, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.3);
        tl.to(desc, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4);

        // Parallax on numerals
        gsap.to(numeral, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [concepts]);

  const list = concepts || [];

  return (
    <section ref={sectionRef} className="relative bg-ink py-24 md:py-32 lg:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Section Header */}
        <div ref={headerRef} className="mb-20 md:mb-32">
          <span className="reveal-item block text-overline text-stone mb-4">
            CORE CONCEPTS
          </span>
          <h2 className="reveal-item font-serif text-display-l text-mist max-w-2xl" style={{ textWrap: 'balance' }}>
            核心概念
          </h2>
          <div className="reveal-item hr-ink mt-8 max-w-xs" />
        </div>

        {/* Concepts List — alternating layout */}
        <div className="space-y-24 md:space-y-40">
          {list.map((concept: any, index: number) => {
            const isEven = index % 2 === 0;
            const numeral = concept.numeral;
            const titleText = concept.title;
            const titleEnText = concept.title_en || concept.titleEn || '';
            const descText = concept.description;

            return (
              <div
                key={concept.id}
                ref={(el) => { itemRefs.current[index] = el; }}
                className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center`}
              >
                {/* Text Column */}
                <div
                  className={`md:col-span-6 ${isEven ? 'md:col-start-1' : 'md:col-start-7'} ${
                    isEven ? '' : 'md:text-right'
                  }`}
                >
                  {/* Numeral */}
                  <div className="numeral font-display text-gold text-display-xl mb-4 opacity-10 select-none leading-none">
                    {numeral}
                  </div>

                  {/* Decorative line */}
                  <div
                    className={`line h-px bg-cinnabar/40 mb-6 ${
                      isEven ? 'md:w-24' : 'md:w-24 md:ml-auto'
                    }`}
                  />

                  {/* Title */}
                  <h3 className="title font-serif text-h1 text-mist mb-2">
                    {titleText}
                  </h3>

                  {/* English title */}
                  {titleEnText && (
                    <p className="title-en text-overline text-stone mb-6">
                      {titleEnText}
                    </p>
                  )}

                  {/* Description */}
                  <p className="desc text-body text-mist/70 max-w-md leading-relaxed" style={{ textWrap: 'pretty' }}>
                    {descText}
                  </p>
                </div>

                {/* Visual Column — abstract ink wash */}
                <div
                  className={`md:col-span-5 ${isEven ? 'md:col-start-8' : 'md:col-start-1 md:row-start-1'}`}
                >
                  <div
                    className="relative aspect-[4/5] overflow-hidden"
                    data-cursor="view"
                  >
                    {/* Abstract ink wash visual */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `
                          radial-gradient(ellipse 70% 60% at ${isEven ? '30%' : '70%'} 40%, rgba(139,26,26,0.15) 0%, transparent 70%),
                          radial-gradient(ellipse 50% 40% at ${isEven ? '70%' : '30%'} 70%, rgba(156,132,88,0.1) 0%, transparent 70%),
                          linear-gradient(135deg, var(--color-ink-light) 0%, var(--color-ink) 100%)
                        `,
                      }}
                    />
                    {/* Numeral watermark */}
                    <div
                      className="absolute inset-0 flex items-center justify-center font-display text-gold/5 select-none"
                      style={{ fontSize: 'clamp(200px, 30vw, 400px)' }}
                    >
                      {numeral}
                    </div>
                    {/* Border */}
                    <div className="absolute inset-0 border border-[rgba(245,242,235,0.08)]" />
                    {/* Noise */}
                    <div className="noise-overlay absolute inset-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
