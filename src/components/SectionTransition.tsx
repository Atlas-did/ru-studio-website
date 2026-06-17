interface SectionTransitionProps {
  from: string;
  to: string;
  height?: number;
  className?: string;
}

/**
 * Lightweight gradient blend between sections. Fades in via CSS only (no JS observer).
 */
export default function SectionTransition({
  from,
  to,
  height = 80,
  className = '',
}: SectionTransitionProps) {
  return (
    <div
      className={`relative overflow-hidden animate-fade-rise ${className}`}
      style={{
        height: `${height}px`,
        background: `linear-gradient(to bottom, ${from}, ${to})`,
      }}
    >
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
