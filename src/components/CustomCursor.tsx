import { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'hover' | 'view' | 'drag';

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isTouch, setIsTouch] = useState(false);
  // Use refs for animation state to avoid re-renders
  const mouse = useRef({ x: -9999, y: -9999 });
  const ring = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouch(true);
      return;
    }

    document.body.classList.add('custom-cursor-enabled');

    const ringEl = ringRef.current;
    const dotEl = dotRef.current;
    if (!ringEl || !dotEl) return;

    // ─── Mouse tracking: store mouse pos, fast dot follow ───
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      // Dot: instant via CSS transform (no GSAP needed)
      dotEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    // ─── Hover detection ───
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest('a, button, [role="button"]')) setCursorState('hover');
      else if (target.closest('[data-cursor="view"]')) setCursorState('view');
      else if (target.closest('[data-cursor="drag"]')) setCursorState('drag');
      else setCursorState('default');
    };

    // ─── Animation loop: lerp ring towards mouse ───
    const animate = () => {
      // Lerp factor: higher = snappier but heavier; 0.12 is smooth & light
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      ringEl.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      cancelAnimationFrame(raf.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  if (isTouch) return null;

  const ringSize: Record<CursorState, number> = { default: 28, hover: 48, view: 72, drag: 56 };
  const size = ringSize[cursorState];

  return (
    <>
      {/* Outer ring — pure CSS transition for size changes */}
      <div
        ref={ringRef}
        className="pointer-events-none rounded-full"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9997,
          width: `${size}px`,
          height: `${size}px`,
          marginLeft: `${-size / 2}px`,
          marginTop: `${-size / 2}px`,
          border: `1px solid rgba(255,255,255,0.4)`,
          backgroundColor: cursorState === 'view' ? 'rgba(139,26,26,0.15)' : 'transparent',
          transition: 'width 0.25s ease, height 0.25s ease, margin 0.25s ease, background-color 0.25s ease',
          mixBlendMode: 'difference',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {cursorState === 'view' && (
          <span className="text-[10px] text-white/80 font-sans select-none">
            查看
          </span>
        )}
      </div>
      {/* Center dot — instant position */}
      <div
        ref={dotRef}
        className="pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9997,
          width: 4,
          height: 4,
          marginLeft: -2,
          marginTop: -2,
          borderRadius: '50%',
          backgroundColor: '#fff',
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
    </>
  );
}
