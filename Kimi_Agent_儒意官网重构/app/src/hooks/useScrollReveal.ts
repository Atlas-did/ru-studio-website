import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  y?: number;
  x?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  childSelector?: string;
  ease?: string;
  start?: string;
  rotateX?: number;
}

export function useScrollReveal<T extends HTMLElement>(options?: ScrollRevealOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = options?.childSelector
      ? el.querySelectorAll(options.childSelector)
      : el;

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      y: options?.y ?? 30,
    };

    if (options?.rotateX) {
      fromVars.rotateX = options.rotateX;
    }

    gsap.set(targets, fromVars);

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: options?.duration ?? 1.0,
      delay: options?.delay ?? 0,
      stagger: options?.stagger ?? 0,
      ease: options?.ease ?? 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: options?.start ?? 'top 85%',
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
