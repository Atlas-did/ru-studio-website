import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TextRevealOptions {
  splitType?: 'chars' | 'words' | 'lines';
  stagger?: number;
  duration?: number;
  delay?: number;
  y?: number;
  ease?: string;
  scrollTrigger?: boolean;
  start?: string;
  once?: boolean;
}

export function useTextReveal<T extends HTMLElement>(options?: TextRevealOptions) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const text = el.textContent || '';
    const splitType = options?.splitType ?? 'chars';

    // Split text into spans
    let html = '';
    if (splitType === 'chars') {
      const chars = text.split('');
      html = chars
        .map((char) => {
          if (char === ' ') return '<span class="inline-block">&nbsp;</span>';
          return `<span class="inline-block opacity-0">${char}</span>`;
        })
        .join('');
    } else if (splitType === 'words') {
      const words = text.split(/(\s+)/);
      html = words
        .map((word) => {
          if (word.trim() === '') return word;
          return `<span class="inline-block overflow-hidden"><span class="inline-block opacity-0">${word}</span></span>`;
        })
        .join('');
    }

    el.innerHTML = html;

    const spans = el.querySelectorAll('.opacity-0');

    const tween = gsap.to(spans, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: options?.duration ?? 0.8,
      delay: options?.delay ?? 0,
      stagger: options?.stagger ?? 0.03,
      ease: options?.ease ?? 'power3.out',
      ...(options?.scrollTrigger !== false
        ? {
            scrollTrigger: {
              trigger: el,
              start: options?.start ?? 'top 80%',
              toggleActions: options?.once !== false ? 'play none none none' : 'play none none reverse',
            },
          }
        : {}),
    });

    return () => {
      tween.kill();
    };
  }, []);

  return ref;
}
