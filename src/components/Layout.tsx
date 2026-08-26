import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { initLenis, destroyLenis } from '@/hooks/useLenis';
import { useChapterTheme } from '@/hooks/useChapterTheme';
import { trackPageview } from '@/lib/api';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollProgress from './ScrollProgress';
import CustomCursor from './CustomCursor';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  useChapterTheme();

  // Smooth scroll lifecycle
  useEffect(() => {
    initLenis();
    return () => {
      destroyLenis();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  // Reset scroll + fire analytics beacon per navigation (SPA route change)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!location.pathname.startsWith('/admin')) {
      trackPageview(location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-[100dvh] bg-base text-fg">
      <ScrollProgress />
      <Header />
      <CustomCursor />
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
