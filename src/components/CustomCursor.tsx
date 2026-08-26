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

    // quickTo reuses a single tween per property — no GC churn on mousemove
    const ringX = gsap.quickTo(cursor, 'x', { duration: 0.12, ease: 'power2.out' });
    const ringY = gsap.quickTo(cursor, 'y', { duration: 0.12, ease: 'power2.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.02, ease: 'none' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.02, ease: 'none' });

    let rafPending = false;
    let lastEvent: MouseEvent | null = null;

    const flush = () => {
      rafPending = false;
      if (!lastEvent) return;
      ringX(lastEvent.clientX);
      ringY(lastEvent.clientY);
      dotX(lastEvent.clientX);
      dotY(lastEvent.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      lastEvent = e;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(flush);
      }
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
      {/* Outer ring */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-200 ${
          cursorState === 'default'
            ? 'border-mist/50 bg-transparent'
            : cursorState === 'hover'
            ? 'border-mist/30 bg-mist/5'
            : cursorState === 'view'
            ? 'border-cinnabar/40 bg-cinnabar/10'
            : 'border-gold/30 bg-gold/5'
        }`}
        style={{ width: 12, height: 12 }}
      >
        {cursorState === 'view' && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-mist/70 font-sans">
            查看
          </span>
        )}
        {cursorState === 'drag' && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gold/70 font-sans">
            拖拽
          </span>
        )}
      </div>
      {/* Center dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9997] w-0.5 h-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mist"
      />
    </>
  );
}
