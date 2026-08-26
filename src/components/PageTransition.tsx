import { useEffect, useRef, useState } from 'react';
import { useLocation, useOutlet, Outlet } from 'react-router-dom';
import gsap from 'gsap';

/**
 * Ink-bloom page transition: an ink veil blooms over the viewport while the
 * route swaps, then dissolves. The outgoing page stays frozen underneath
 * (freeze pattern) so the swap truly happens hidden behind the veil.
 */
export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Frozen snapshot of (path, outlet) currently shown
  const [displayed, setDisplayed] = useState({ pathname: location.pathname, outlet });
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (location.pathname === displayed.pathname) return;

    const overlay = overlayRef.current;
    if (!overlay) {
      setDisplayed({ pathname: location.pathname, outlet });
      return;
    }

    // Bloom from center of current viewport
    const cx = window.innerWidth / 2;
    const cy = window.scrollY > 0 ? Math.min(window.innerHeight / 2, 400) : window.innerHeight / 3;

    gsap.set(overlay, {
      '--x': `${cx}px`,
      '--y': `${cy}px`,
      '--r': '0%',
      autoAlpha: 1,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        // Swap content while fully covered, then dissolve
        setDisplayed({ pathname: location.pathname, outlet });
        gsap.set(overlay, { autoAlpha: 0, '--r': '0%' });
      },
    });

    // Ink floods outward
    tl.to(overlay, { '--r': '140%', duration: 0.55, ease: 'power2.in' });
    // Dissolve like wet ink on paper
    tl.to(overlay, { '--r': '190%', opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.08 });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- outlet intentionally captured at navigation time
  }, [location]);

  return (
    <>
      <div key={displayed.pathname}>{displayed.outlet ?? <Outlet />}</div>
      {/* Ink bloom veil */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[70] invisible opacity-0"
        style={{
          background: 'radial-gradient(circle at var(--x, 50%) var(--y, 40%), #141414 0%, #0A0A0A 62%)',
          WebkitMaskImage:
            'radial-gradient(circle at var(--x, 50%) var(--y, 40%), black var(--r, 0%), transparent calc(var(--r, 0%) + 34%))',
          maskImage:
            'radial-gradient(circle at var(--x, 50%) var(--y, 40%), black var(--r, 0%), transparent calc(var(--r, 0%) + 34%))',
        }}
      />
    </>
  );
}
