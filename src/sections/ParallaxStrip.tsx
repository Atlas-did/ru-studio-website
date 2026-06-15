import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const textRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    const text2 = textRef2.current;
    if (!container || !text || !text2) return;

    const ctx = gsap.context(() => {
      // Layer 1: moves left
      gsap.to(text, {
        x: '-35%',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Layer 2: moves right (opposite direction, slower)
      gsap.to(text2, {
        x: '20%',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const textLine1 = 'A MILLENNIUM\'S HERITAGE · A CHAIN OF CREATION · 千年文脉 · 一脉创链 · ';
  const textLine2 = 'RU STUDIO · 儒意 · 向历史借灵感 · 为当代造美物 · ';

  return (
    <div
      ref={containerRef}
      className="bg-ink py-12 md:py-20 overflow-hidden border-y border-[rgba(168,164,154,0.18)]"
    >
      {/* Layer 1 — primary, moves left */}
      <div
        ref={textRef}
        className="whitespace-nowrap mb-2"
        style={{ width: 'max-content' }}
      >
        <span className="font-display text-[clamp(60px,10vw,140px)] font-light text-text-secondary/20 tracking-wide">
          {textLine1.repeat(3)}
        </span>
      </div>

      {/* Layer 2 — secondary, moves right, smaller */}
      <div
        ref={textRef2}
        className="whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        <span className="font-sans text-[clamp(14px,2vw,24px)] font-light text-cinnabar/10 tracking-[0.2em] uppercase">
          {textLine2.repeat(4)}
        </span>
      </div>
    </div>
  );
}
