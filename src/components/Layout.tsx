import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { initLenis, destroyLenis } from '@/hooks/useLenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollProgress from './ScrollProgress';
import CustomCursor from './CustomCursor';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    initLenis();
    window.scrollTo(0, 0);

    return () => {
      destroyLenis();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Enable paper grain texture globally
  useEffect(() => {
    document.body.classList.add('paper-grain');
    return () => {
      document.body.classList.remove('paper-grain');
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh]">
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
