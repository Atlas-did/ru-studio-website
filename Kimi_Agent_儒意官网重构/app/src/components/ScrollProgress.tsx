import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === document.body) st.kill();
      });
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-px z-[100] bg-border-subtle">
      <div
        ref={barRef}
        className="h-full bg-cinnabar origin-left"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
