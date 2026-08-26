import { useEffect, useRef } from 'react';

/**
 * Fixed scroll progress bar at top of the page.
 * 直接用 ref + rAF 写宽度，不走 React setState，避免每帧滚动都重渲染（卡顿来源）。
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const p = Math.min(100, (scrollTop / docHeight) * 100);
      bar.style.width = `${p}%`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[1px] z-[100] pointer-events-none">
      <div
        ref={barRef}
        className="h-full"
        style={{
          width: '0%',
          background: 'linear-gradient(to right, var(--color-cinnabar), #c44a4a)',
          boxShadow: '0 0 6px rgba(139, 26, 26, 0.4)',
        }}
      />
    </div>
  );
}
