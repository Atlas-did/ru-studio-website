import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLQuoteElement>(null);
  const attrRef = useRef<HTMLParagraphElement>(null);
  const lineLeftRef = useRef<HTMLDivElement>(null);
  const lineRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const attr = attrRef.current;
    const lineLeft = lineLeftRef.current;
    const lineRight = lineRightRef.current;
    if (!section || !text || !attr || !lineLeft || !lineRight) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(text, { opacity: 0, y: 30 });
      gsap.set(attr, { opacity: 0, y: 15 });
      gsap.set(lineLeft, { scaleX: 0, transformOrigin: 'right' });
      gsap.set(lineRight, { scaleX: 0, transformOrigin: 'left' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      // Decorative lines
      tl.to(lineLeft, { scaleX: 1, duration: 0.8, ease: 'power3.out' }, 0);
      tl.to(lineRight, { scaleX: 1, duration: 0.8, ease: 'power3.out' }, 0);

      // Quote text
      tl.to(text, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0.2);
      tl.to(attr, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.5);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink py-24 md:py-40 overflow-hidden"
    >
      {/* Decorative vertical lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={lineLeftRef}
          className="absolute left-6 md:left-16 lg:left-24 top-1/4 bottom-1/4 w-px bg-border-subtle"
        />
        <div
          ref={lineRightRef}
          className="absolute right-6 md:right-16 lg:right-24 top-1/4 bottom-1/4 w-px bg-border-subtle"
        />
      </div>

      <div className="max-w-4xl mx-auto px-8 md:px-16 relative z-10">
        <blockquote
          ref={textRef}
          className="text-center"
        >
          <p
            className="font-serif text-display-m text-mist leading-relaxed tracking-heading"
            style={{ textWrap: 'balance' }}
          >
            "以古为新，借古开今"
          </p>
        </blockquote>
        <p
          ref={attrRef}
          className="text-caption text-stone mt-6 text-center tracking-caption"
        >
          设计理念 / DESIGN PHILOSOPHY
        </p>
      </div>
    </section>
  );
}
