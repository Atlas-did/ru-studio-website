import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal<T extends HTMLElement>(
  options?: {
    y?: number;
    duration?: number;
    delay?: number;
    stagger?: number;
    childSelector?: string;
  }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = options?.childSelector
      ? el.querySelectorAll(options.childSelector)
      : el;

    gsap.set(targets, { opacity: 0, y: options?.y ?? 20 });

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: options?.duration ?? 1.2,
      delay: options?.delay ?? 0,
      stagger: options?.stagger ?? 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill();
      });
    };
  }, []);

  return ref;
}
