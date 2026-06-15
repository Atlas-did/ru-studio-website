import { useEffect, useRef } from 'react';

/**
 * Styled cursor dot that follows the mouse.
 * Scales up on interactive elements. Hidden on touch devices.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-cursor-hover]')
      ) {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
        cursor.style.borderColor = 'rgba(139, 26, 26, 0.8)';
      }
    };

    const onMouseOut = () => {
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.borderColor = 'rgba(139, 26, 26, 0.3)';
    };

    const animate = () => {
      // Smooth follow
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;

      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });
    const animId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Outer ring (smooth follow) */}
      <div
        ref={cursorRef}
        className="hidden md:block fixed pointer-events-none z-[9999]"
        style={{
          width: '24px',
          height: '24px',
          border: '1px solid rgba(139, 26, 26, 0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
          willChange: 'left, top',
        }}
      />
      {/* Inner dot (instant follow) */}
      <div
        ref={dotRef}
        className="hidden md:block fixed pointer-events-none z-[9999]"
        style={{
          width: '4px',
          height: '4px',
          backgroundColor: '#8B1A1A',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
}
