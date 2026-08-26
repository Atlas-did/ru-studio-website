import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Seal from '@/components/Seal';

gsap.registerPlugin(ScrollTrigger);

/**
 * 「宣」paper-chapter quote: vertical Analects excerpt on rice-paper white,
 * framed by hairlines and closed with a cinnabar seal.
 */
export default function QuoteSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLQuoteElement>(null);
  const attrRef = useRef<HTMLParagraphElement>(null);
  const sealWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.set(textRef.current, { opacity: 0, y: 30 });
      gsap.set(attrRef.current, { opacity: 0, y: 15 });
      gsap.set(sealWrapRef.current, { opacity: 0, scale: 1.5, rotate: -8 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      tl.to(textRef.current, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0);
      tl.to(attrRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.4);
      tl.to(sealWrapRef.current, { opacity: 1, scale: 1, rotate: -3, duration: 0.45, ease: 'back.out(2)' }, 0.6);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-theme="paper" className="relative bg-base py-28 md:py-44 overflow-hidden">
      {/* Giant watermark quote char */}
      <span aria-hidden="true" className="giant-char left-[2vw] top-1/2 -translate-y-1/2 text-[30vw] hidden lg:block">
        古
      </span>

      <div className="max-w-4xl mx-auto px-8 md:px-16 relative z-10 flex flex-col items-center">
        <blockquote ref={textRef} className="text-center">
          <p className="vertical-text font-serif text-fg leading-none mx-auto py-2" style={{ fontSize: 'clamp(28px, 4.5vh, 44px)' }}>
            以古为新借古开今
          </p>
        </blockquote>

        <div ref={sealWrapRef} className="mt-10" style={{ opacity: 0 }}>
          <Seal text="儒意" size={40} variant="zhu" />
        </div>

        <p ref={attrRef} className="text-caption text-fg-muted mt-6 text-center tracking-caption">
          设计理念 / DESIGN PHILOSOPHY
        </p>
      </div>
    </section>
  );
}
