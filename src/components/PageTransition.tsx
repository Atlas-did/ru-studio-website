import { useEffect, useRef, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import gsap from 'gsap';

export default function PageTransition() {
  const location = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setDisplayLocation(location);
      },
    });

    // Ink wipe: fast scaleX across screen
    tl.set(overlay, { scaleX: 0, transformOrigin: 'left' });
    tl.to(overlay, { scaleX: 1, duration: 0.25, ease: 'power3.in' });
    tl.set(overlay, { transformOrigin: 'right' });
    tl.to(overlay, { scaleX: 0, duration: 0.25, ease: 'power3.out' });

    return () => {
      tl.kill();
    };
  }, [location, displayLocation]);

  return (
    <>
      <div key={displayLocation.pathname} className="animate-page-enter">
        <Outlet />
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
