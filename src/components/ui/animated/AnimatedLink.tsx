import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AnimatedLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  /** Color of the underline */
  underlineColor?: string;
}

/**
 * Link with an animated underline that draws from left to right on hover.
 */
export default function AnimatedLink({
  to,
  children,
  className = '',
  underlineColor = '#8B1A1A',
}: AnimatedLinkProps) {
  return (
    <Link
      to={to}
      className={`relative inline-block group ${className}`}
      style={{ textDecoration: 'none' }}
    >
      {children}
      <span
        className="absolute bottom-0 left-0 w-full h-px transition-transform duration-300 ease-out origin-left"
        style={{
          backgroundColor: underlineColor,
          transform: 'scaleX(0)',
        }}
      />
      <style>{`
        .group:hover span {
          transform: scaleX(1) !important;
        }
      `}</style>
    </Link>
  );
}
