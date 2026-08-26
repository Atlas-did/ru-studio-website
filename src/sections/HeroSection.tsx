import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Seal from '@/components/Seal';
import InkParticleCanvas from '@/components/interactive/InkParticleCanvas';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getSiteConfig } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const { data: config } = useSiteData(() => api.getSiteConfig(), { initialData: getSiteConfig() });

  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);

  // Structural animation only — data arrives synchronously via initialData,
  // so this effect intentionally runs once.
  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const brand = brandRef.current;
    const sealEl = sealRef.current;
    const scrollIndicator = scrollIndicatorRef.current;
    if (!section || !image || !title || !subtitle || !brand || !scrollIndicator) return;

    const ctx = gsap.context(() => {
      gsap.set(image, { scale: 1.12, opacity: 0 });
      gsap.set(title.querySelectorAll('.char'), { opacity: 0, y: 60, rotateX: -40 });
      gsap.set(subtitle, { opacity: 0, y: 20 });
      gsap.set(brand, { opacity: 0, y: 10 });
      gsap.set(scrollIndicator, { opacity: 0, y: -10 });

      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(image, { scale: 1, opacity: 1, duration: 2.0, ease: 'power2.out' });
      tl.to(
        title.querySelectorAll('.char'),
        {
          opacity: 1, y: 0, rotateX: 0, duration: 1.2,
          stagger: { each: 0.08, from: 'center' }, ease: 'power3.out',
        },
        '-=1.4'
      );
      tl.to(sealEl, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, '-=0.5');
      tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3');
      tl.to(brand, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
      tl.to(scrollIndicator, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2');

      // Parallax on scroll
      gsap.to(image, {
        y: 120, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.5 },
      });
      gsap.to([title, subtitle, brand], {
        opacity: 0, y: -40, ease: 'none',
        scrollTrigger: { trigger: section, start: '20% top', end: '60% top', scrub: 0.5 },
      });
      // Watermark drifts slower than content
      gsap.to(watermarkRef.current, {
        yPercent: 18, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 1 },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const chars = '儒意'.split('').map((char, i) => (
    <span key={i} className="char inline-block" style={{ opacity: 0 }}>
      {char}
    </span>
  ));

  return (
    <section ref={sectionRef} className="relative w-full h-[100dvh] overflow-hidden bg-base">
      {/* Background image with parallax */}
      <div ref={imageRef} className="absolute inset-0 w-full h-[115%]" style={{ top: '-7.5%' }}>
        <img
          src="/assets/hero-ink-still.jpg"
          alt="毛笔、砚台与宣纸的水墨静物"
          className="w-full h-full object-cover img-rubbing"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.15) 40%, rgba(10,10,10,0.55) 80%, #0A0A0A 100%),
              linear-gradient(to right, rgba(10,10,10,0.45) 0%, transparent 50%, rgba(10,10,10,0.45) 100%)
            `,
          }}
        />
      </div>

      {/* Ink particle interaction layer */}
      <InkParticleCanvas />

      {/* Giant outlined watermark 儒 */}
      <span
        ref={watermarkRef}
        aria-hidden="true"
        className="giant-char vertical-text right-[4vw] top-1/2 -translate-y-1/2 text-[38vh] hidden md:block"
      >
        儒
      </span>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <div ref={brandRef} className="text-overline text-fg-muted mb-8 tracking-overline">
          儒家文化创意工作室
          <span className="mx-3 text-fg-ghost">|</span>
          {config?.brandNameEn || 'RU STUDIO'}
        </div>

        <h1
          ref={titleRef}
          className="font-serif text-display-xl text-mist mb-4 perspective-800"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}
        >
          {chars}
        </h1>

        <div ref={sealRef} style={{ opacity: 0, transform: 'scale(1.6) rotate(-8deg)' }}>
          <Seal text="儒意" size={44} variant="zhu" />
        </div>

        <p
          ref={subtitleRef}
          className="text-body-l text-mist/80 max-w-lg mt-6 text-center leading-relaxed tracking-body font-serif"
          style={{ textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}
        >
          {config?.tagline || '向历史借灵感，为当代造美物'}
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-caption-s text-stone/50 tracking-overline">SCROLL</span>
        <div className="w-px h-8 bg-line-strong relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-mist/60 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
