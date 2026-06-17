import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getCollectionItems } from '@/lib/data';
import TiltCard from '@/components/ui/animated/TiltCard';

gsap.registerPlugin(ScrollTrigger);

export default function WorksSection() {
  const { data: allItems } = useSiteData(
    () => api.getCollectionItems(),
    { initialData: getCollectionItems() }
  );
  const items = (allItems || []).slice(0, 6);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const grid = gridRef.current;
    if (!section || !header || !grid) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(header.querySelectorAll('.reveal-item'), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // Grid items — staggered reveal
      const cards = grid.querySelectorAll('.work-card');
      cards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 50,
          scale: 0.97,
          duration: 0.8,
          delay: (i % 3) * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [items]);

  // Curatorial layout: first and third items get larger grid spans
  const getGridClass = (index: number) => {
    if (index === 0) return 'md:col-span-8 md:row-span-2';
    if (index === 2) return 'md:col-span-4 md:row-span-2';
    return 'md:col-span-4';
  };

  const getAspectClass = (index: number) => {
    if (index === 0) return 'aspect-[16/10]';
    if (index === 2) return 'aspect-[3/4]';
    return 'aspect-[4/3]';
  };

  return (
    <section ref={sectionRef} className="relative bg-ink-lighter py-24 md:py-32 lg:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Section Header */}
        <div ref={headerRef} className="flex items-end justify-between mb-16 md:mb-24">
          <div>
            <span className="reveal-item block text-overline text-stone mb-4">
              SELECTED WORKS
            </span>
            <h2 className="reveal-item font-serif text-display-l text-mist">
              作品选集
            </h2>
          </div>
          <Link
            to="/collection"
            className="reveal-item hidden md:flex items-center gap-2 text-overline text-stone hover:text-mist transition-colors duration-300 group"
          >
            <span>VIEW ALL</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Curatorial Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5"
        >
          {items.map((item, index) => (
            <div
              key={item.slug}
              className={`work-card ${getGridClass(index)}`}
            >
              <TiltCard maxTilt={6} scale={1.01}>
                <Link
                  to={`/collection/${item.slug}`}
                  className="group relative block overflow-hidden bg-ink border border-[rgba(245,242,235,0.08)]"
                  data-cursor="view"
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${getAspectClass(index)}`}>
                    <img
                      src={item.cover.url}
                      alt={item.cover.alt}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors duration-500" />
                    {/* Noise */}
                    <div className="noise-overlay absolute inset-0" />
                  </div>

                  {/* Info overlay on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-caption-s text-cinnabar tracking-overline">
                          {item.category}
                        </span>
                        <span className="text-stone/40">|</span>
                        <span className="text-caption-s text-stone">
                          {item.year}
                        </span>
                      </div>
                      <h3 className="font-serif text-h2 text-mist mb-1">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-caption text-stone">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Always-visible info */}
                  <div className="p-4 md:p-5 group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="font-serif text-body text-mist mb-1">
                      {item.title}
                    </h3>
                    <p className="text-caption-s text-stone">
                      {item.category} · {item.year}
                    </p>
                  </div>
                </Link>
              </TiltCard>
            </div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-12 text-center md:hidden">
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 text-overline text-stone hover:text-mist transition-colors duration-300"
          >
            <span>VIEW ALL WORKS</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
