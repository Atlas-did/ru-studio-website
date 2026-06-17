import { useEffect, useState } from 'react';

/**
 * Fixed scroll progress bar at top of the page.
 * Reads from Lenis velocity for smooth tracking.
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      setProgress(Math.min(100, (scrollTop / docHeight) * 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[1px] z-[100] pointer-events-none">
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(to right, #8B1A1A, #c44a4a)',
          boxShadow: '0 0 6px rgba(139, 26, 26, 0.4)',
        }}
      />
    </div>
  );
}
