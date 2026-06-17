import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type CursorState = 'default' | 'hover' | 'view' | 'drag';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouch(window.matchMedia('(hover: none)').matches);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);

    if (window.matchMedia('(hover: none)').matches) return;

    // Enable custom cursor
    document.body.classList.add('custom-cursor-enabled');

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: 'power2.out',
      });
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.02,
        ease: 'none',
      });
    };

    // Detect hover targets
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (target.closest('a, button, [role="button"]')) {
        setCursorState('hover');
      } else if (target.closest('[data-cursor="view"]')) {
        setCursorState('view');
      } else if (target.closest('[data-cursor="drag"]')) {
        setCursorState('drag');
      } else {
        setCursorState('default');
      }
    };

    const onMouseDown = () => {
      gsap.to(cursor, { scale: 0.85, duration: 0.1, ease: 'power2.out' });
    };

    const onMouseUp = () => {
      gsap.to(cursor, { scale: 1, duration: 0.15, ease: 'power2.out' });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', checkTouch);
    };
  }, []);

  // Animate cursor state changes
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const sizes: Record<CursorState, number> = {
      default: 12,
      hover: 48,
      view: 72,
      drag: 56,
    };

    gsap.to(cursor, {
      width: sizes[cursorState],
      height: sizes[cursorState],
      duration: 0.3,
      ease: 'power3.out',
    });
  }, [cursorState]);

  if (isTouch) return null;

  return (
    <>
      {/* Outer ring — mix-blend-mode ensures visibility on any background */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
          cursorState === 'default'
            ? 'border border-white/60 bg-transparent'
            : cursorState === 'hover'
            ? 'border border-white/40 bg-white/10'
            : cursorState === 'view'
            ? 'border border-white/60 bg-white/15'
            : 'border border-white/40 bg-white/10'
        }`}
        style={{
          width: 12,
          height: 12,
          mixBlendMode: 'difference',
          willChange: 'width, height',
        }}
      >
        {cursorState === 'view' && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80 font-sans"
            style={{ mixBlendMode: 'difference' }}
          >
            查看
          </span>
        )}
        {cursorState === 'drag' && (
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80 font-sans"
            style={{ mixBlendMode: 'difference' }}
          >
            拖拽
          </span>
        )}
      </div>
      {/* Center dot — mix-blend-mode for contrast */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997] w-[3px] h-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          backgroundColor: '#fff',
          mixBlendMode: 'difference',
        }}
      />
    </>
  );
}
