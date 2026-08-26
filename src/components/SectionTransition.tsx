import { useEffect, useRef } from 'react';

interface SectionTransitionProps {
  /** Top color (hex without #) */
  from: string;
  /** Bottom color (hex without #) */
  to: string;
  /** Height in px */
  height?: number;
  /** Optional className */
  className?: string;
}

/**
 * Renders a smooth gradient blend between two section background colors.
 * Creates an ink-wash dissolve effect when placed between sections of different colors.
 */
export default function SectionTransition({
  from,
  to,
  height = 100,
  className = '',
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
        }
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden transition-opacity duration-700 ${className}`}
      style={{
        height: `${height}px`,
        background: `linear-gradient(to bottom, ${from}, ${to})`,
        opacity: 0,
      }}
    >
      {/* Subtle noise overlay for texture during transition */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
