import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CustomCursor } from './CustomCursor';
import { ScrollProgress } from './ScrollProgress';
import { useLenis } from '@/hooks/useLenis';

export function Layout({ children }: { children: React.ReactNode }) {
  useLenis();

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
      <main className="relative">{children}</main>
      <Footer />
    </div>
  );
}
