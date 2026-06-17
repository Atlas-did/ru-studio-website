import { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'hover' | 'view' | 'drag';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) {
      setIsTouch(true);
      return;
    }

    document.body.classList.add('custom-cursor-enabled');
    const dot = dotRef.current;
    if (!dot) return;

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t) return;
      if (t.closest('a, button, [role="button"]')) setCursorState('hover');
      else if (t.closest('[data-cursor="view"]')) setCursorState('view');
      else if (t.closest('[data-cursor="drag"]')) setCursorState('drag');
      else setCursorState('default');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
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
        top: 0,
        left: 0,
        zIndex: 9997,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: cursorState === 'default' ? 'none' : '1px solid rgba(255,255,255,0.4)',
        backgroundColor: cursorState === 'default' ? '#fff' : 'transparent',
        transition: 'width 0.2s ease, height 0.2s ease, border 0.2s ease, background-color 0.2s ease',
        mixBlendMode: 'difference',
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {cursorState === 'view' && (
        <span className="text-[10px] text-white/80 font-sans select-none">查看</span>
      )}
    </div>
  );
}
