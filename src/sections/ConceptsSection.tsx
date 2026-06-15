import { useRef, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getConcepts } from '@/lib/data';

export default function ConceptsSection() {
  const { data: concepts } = useSiteData(
    () => api.getConcepts(),
    { initialData: getConcepts() }
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef = useScrollReveal<HTMLElement>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      container.style.setProperty('--x', `${x}%`);
      container.style.setProperty('--y', `${y}%`);
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={revealRef} className="bg-ink py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Title */}
        <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-normal text-mist tracking-wide mb-16 md:mb-24">
          核心概念
          <span className="ml-4 font-sans text-[11px] tracking-[0.2em] text-text-secondary uppercase align-middle">
            (CORE CONCEPTS)
          </span>
        </h2>

        {/* Concepts Grid with Spotlight */}
        <div
          ref={containerRef}
          id="spotlight-container"
          className="grid grid-cols-1 md:grid-cols-4 relative"
        >
          {(concepts || []).map((concept, index, arr) => (
            <div
              key={concept.id}
              className={`concept-card group relative py-10 md:py-16 px-4 md:px-6 transition-colors duration-500 ${
                index < arr.length - 1
                  ? 'md:border-r border-[rgba(168,164,154,0.18)]'
                  : ''
              }`}
              data-spotlight
            >
              {/* Spotlight overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(245,242,235,0.06), transparent 60%)`,
                  backgroundAttachment: 'fixed',
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                <span className="font-display text-[clamp(40px,5vw,64px)] font-light text-mist/20 group-hover:text-gold/40 transition-colors duration-500">
                  {concept.numeral}
                </span>
                <h3 className="mt-4 font-serif text-[clamp(18px,2vw,22px)] font-medium text-mist group-hover:text-mist transition-colors duration-300">
                  {concept.title}
                </h3>
                <p className="mt-2 font-sans text-[10px] tracking-[0.15em] text-text-secondary uppercase">
                  {concept.titleEn}
                </p>
                <p className="mt-6 font-serif text-sm text-text-secondary leading-[1.8] group-hover:text-mist/70 transition-colors duration-300">
                  {concept.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        #spotlight-container:hover .concept-card {
          color: rgba(168, 164, 154, 0.4);
        }
        #spotlight-container:hover .concept-card:hover {
          color: var(--color-mist);
        }
        #spotlight-container:hover .concept-card:not(:hover) h3,
        #spotlight-container:hover .concept-card:not(:hover) p {
          color: rgba(168, 164, 154, 0.4);
        }
      `}</style>
    </section>
  );
}
