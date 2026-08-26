import { useId } from 'react';

interface SealProps {
  /** Seal text, 1-4 characters, e.g. 儒意 */
  text: string;
  /** Pixel size of the square seal */
  size?: number;
  /** zhu = 朱文(red bg, carved chars); bai = 白文(outline style) */
  variant?: 'zhu' | 'bai';
  className?: string;
  /** Animate stamp-in on mount */
  stamp?: boolean;
}

/** Character layout positions per count, in traditional seal order (columns right→left). */
const LAYOUTS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [50, 29],
    [50, 71],
  ],
  3: [
    [50, 26],
    [50, 52],
    [50, 78],
  ],
  4: [
    [72, 28],
    [72, 72],
    [28, 28],
    [28, 72],
  ],
};

/**
 * 印章 Seal — cinnabar square seal with organically roughened edge.
 * The site's signature mark: CTAs, section endings, watermarks.
 */
export default function Seal({ text, size = 44, variant = 'zhu', className = '', stamp = false }: SealProps) {
  const uid = useId().replace(/:/g, '');
  const chars = text.slice(0, 4).split('');
  const positions = LAYOUTS[chars.length] || LAYOUTS[4];
  const fontSize = chars.length === 1 ? 54 : chars.length === 2 ? 42 : chars.length === 3 ? 32 : 34;

  return (
    <span
      className={`inline-block select-none align-middle ${stamp ? 'animate-seal-stamp' : ''} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`印章：${text}`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <defs>
          {/* Roughen edges for a hand-carved look */}
          <filter id={`rough-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
          </filter>
        </defs>

        <g filter={`url(#rough-${uid})`}>
          {variant === 'zhu' ? (
            <>
              <rect x="5" y="5" width="90" height="90" rx="8" fill="#8B1A1A" />
              <rect x="11" y="11" width="78" height="78" rx="4" fill="none" stroke="#E8E4DC" strokeWidth="2.5" opacity="0.55" />
            </>
          ) : (
            <>
              <rect x="7" y="7" width="86" height="86" rx="7" fill="none" stroke="#8B1A1A" strokeWidth="5.5" />
              {chars.map((c, i) => (
                <text
                  key={i}
                  x={positions[i][0]}
                  y={positions[i][1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="'Noto Serif SC', serif"
                  fontWeight="600"
                  fontSize={fontSize}
                  fill="#8B1A1A"
                >
                  {c}
                </text>
              ))}
            </>
          )}
          {variant === 'zhu' &&
            chars.map((c, i) => (
              <text
                key={i}
                x={positions[i][0]}
                y={positions[i][1]}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'Noto Serif SC', serif"
                fontWeight="600"
                fontSize={fontSize}
                fill="#E8E4DC"
              >
                {c}
              </text>
            ))}
        </g>
      </svg>
    </span>
  );
}
