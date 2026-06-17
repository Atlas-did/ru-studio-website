import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const raf = { id: 0 };
    const update = () => {
      const pct = Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      bar.style.width = `${pct}%`;
    };

    const onScroll = () => {
      if (raf.id) return;
      raf.id = requestAnimationFrame(() => {
        update();
        raf.id = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[1px] z-[100] pointer-events-none">
      <div
        ref={barRef}
        className="h-full"
        style={{
          width: '0%',
          background: 'linear-gradient(to right, #8B1A1A, #c44a4a)',
          boxShadow: '0 0 6px rgba(139, 26, 26, 0.4)',
        }}
      />
    </div>
  );
}
