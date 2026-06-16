import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    // Entrance timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayLocation(location);
        setDisplayChildren(children);
      },
    });

    // Ink wipe in
    tl.fromTo(
      overlay,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }
    );

    // Ink wipe out (after content swap)
    tl.set(overlay, { transformOrigin: 'right' });
    tl.to(overlay, { scaleX: 0, duration: 0.5, ease: 'power3.inOut', delay: 0.05 });

    return () => {
      tl.kill();
    };
  }, [location, children, displayLocation]);

  return (
    <>
      <div key={displayLocation.pathname} className="animate-page-enter">
        {displayChildren}
      </div>
      {/* Ink wipe overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[60] bg-ink pointer-events-none"
        style={{ transform: 'scaleX(0)' }}
      />
    </>
  );
}
