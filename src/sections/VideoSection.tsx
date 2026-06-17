import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface VideoSectionProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Video section for homepage — autoplays with scroll scrub control.
 * Place between other sections for a cinematic break.
 */
export default function VideoSection({
  videoUrl,
  posterUrl,
  title,
  subtitle,
}: VideoSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const content = contentRef.current;
    if (!section || !video) return;

    const ctx = gsap.context(() => {
      // Fade in content
      if (content) {
        gsap.from(content.querySelectorAll('.reveal-item'), {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Pause video when scrolled past
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => { video.play().catch(() => {}); },
        onLeave: () => { video.pause(); },
        onEnterBack: () => { video.play().catch(() => {}); },
        onLeaveBack: () => { video.pause(); },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-ink overflow-hidden"
      style={{ minHeight: '70vh' }}
    >
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-ink/50" />
        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0" />
      </div>

      {/* Content overlay */}
      {(title || subtitle) && (
        <div
          ref={contentRef}
          className="relative z-10 flex flex-col items-center justify-center h-full min-h-[70vh] px-6 text-center"
        >
          {title && (
            <h2 className="reveal-item font-serif text-display-l text-mist mb-4" style={{ textWrap: 'balance' }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="reveal-item text-body-l text-mist/60 max-w-lg" style={{ textWrap: 'pretty' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
