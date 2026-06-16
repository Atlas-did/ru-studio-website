import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const brand = brandRef.current;
    const scrollIndicator = scrollIndicatorRef.current;
    if (!section || !image || !title || !subtitle || !brand || !scrollIndicator) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(image, { scale: 1.15, opacity: 0 });
      gsap.set(title.querySelectorAll('.char'), { opacity: 0, y: 60, rotateX: -40 });
      gsap.set(subtitle, { opacity: 0, y: 20 });
      gsap.set(brand, { opacity: 0, y: 10 });
      gsap.set(scrollIndicator, { opacity: 0, y: -10 });

      // Master timeline
      const tl = gsap.timeline({ delay: 0.3 });

      // Image fade in with scale
      tl.to(image, {
        scale: 1,
        opacity: 1,
        duration: 2.0,
        ease: 'power2.out',
      });

      // Title character reveal - staggered from center
      const chars = title.querySelectorAll('.char');
      tl.to(
        chars,
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          stagger: { each: 0.06, from: 'center' },
          ease: 'power3.out',
        },
        '-=1.4'
      );

      // Subtitle
      tl.to(
        subtitle,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.6'
      );

      // Brand label
      tl.to(
        brand,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.4'
      );

      // Scroll indicator
      tl.to(
        scrollIndicator,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.2'
      );

      // Parallax on scroll
      gsap.to(image, {
        y: 120,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      // Fade out on scroll
      gsap.to([title, subtitle, brand], {
        opacity: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: '20% top',
          end: '60% top',
          scrub: 0.5,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Split title into character spans
  const titleText = '儒';
  const chars = titleText.split('').map((char, i) => (
    <span key={i} className="char inline-block" style={{ opacity: 0 }}>
      {char}
    </span>
  ));

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100dvh] overflow-hidden bg-ink"
    >
      {/* Background image with parallax */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-[115%]"
        style={{ top: '-7.5%' }}
      >
        <img
          src="/assets/hero-still-life.jpg"
          alt="毛笔、砚台、宣纸与几何直尺的静物摄影，展现传统与现代美学的交融"
          className="w-full h-full object-cover"
          loading="eager"
        />
        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.5) 80%, rgba(10,10,10,1) 100%),
              linear-gradient(to right, rgba(10,10,10,0.4) 0%, transparent 50%, rgba(10,10,10,0.4) 100%)
            `,
          }}
        />
        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        {/* Brand label */}
        <div
          ref={brandRef}
          className="text-overline text-stone mb-8 tracking-overline"
        >
          儒家文化创意工作室
          <span className="mx-3 text-stone/30">|</span>
          RU STUDIO
        </div>

        {/* Main title */}
        <h1
          ref={titleRef}
          className="font-serif text-display-xl text-mist mb-6 perspective-800"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}
        >
          {chars}
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-body-l text-mist/80 max-w-lg text-center leading-relaxed tracking-body font-serif"
          style={{ textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}
        >
          向历史借灵感，为当代造美物
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-caption-s text-stone/50 tracking-overline">SCROLL</span>
        <div className="w-px h-8 bg-stone/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-mist/60 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
