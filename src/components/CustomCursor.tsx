import { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'hover' | 'view' | 'drag';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) { setIsTouch(true); return; }

    document.body.classList.add('custom-cursor-enabled');
    const dot = dotRef.current;
    if (!dot) return;

    let lastX = -9999, lastY = -9999;
    const repaint = () => { dot.style.transform = `translate(${lastX - 4}px, ${lastY - 4}px)`; };
    const onMove = (e: MouseEvent) => { lastX = e.clientX; lastY = e.clientY; repaint(); };

    const deduceState = (t: Element): CursorState => {
      if (t.closest('a, button, [role="button"]')) return 'hover';
      if (t.closest('[data-cursor="view"]')) return 'view';
      if (t.closest('[data-cursor="drag"]')) return 'drag';
      return 'default';
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t) return;
      setCursorState(deduceState(t));
    };

    // mouseout: when leaving an element, re-check what is now under the cursor
    const onOut = (e: MouseEvent) => {
      const related = (e as any).relatedTarget as HTMLElement | null;
      // relatedTarget is the element the mouse is moving TO (or null if leaving window)
      if (!related || related === document.documentElement) {
        setCursorState('default');
        return;
      }
      setCursorState(deduceState(related));
    };

    // Re-sync on scroll/wheel: re-detect element under stationary mouse
    const onScroll = () => {
      repaint();
      const el = document.elementFromPoint(lastX, lastY);
      if (el) setCursorState(deduceState(el));
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mouseout', onOut, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('wheel', onScroll, { passive: true });

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onOut);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onScroll);
    };
  }, []);

  if (isTouch) return null;

  const sizes: Record<CursorState, number> = { default: 8, hover: 40, view: 64, drag: 48 };
  const size = sizes[cursorState];

  return (
    <div
      ref={dotRef}
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 9999,
        width: `${size}px`, height: `${size}px`,
        borderRadius: '50%',
        border: cursorState === 'default' ? 'none' : '1px solid rgba(0,0,0,0.3)',
        backgroundColor: cursorState === 'default' ? '#fff' : 'rgba(255,255,255,0.15)',
        boxShadow: cursorState === 'default' ? '0 0 0 1px rgba(0,0,0,0.3)' : '0 0 0 1px rgba(0,0,0,0.15)',
        transition: 'width 0.2s ease, height 0.2s ease, border 0.2s ease, background-color 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {cursorState === 'view' && (
        <span className="text-[10px] text-white/80 font-sans select-none">查看</span>
      )}
    </div>
  );
}
