import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { isAuthenticated } from '@/lib/admin-api';

const navItems = [
  { label: '首页', labelEn: 'HOME', path: '/' },
  { label: '作品', labelEn: 'COLLECTION', path: '/collection' },
  { label: '日志', labelEn: 'JOURNAL', path: '/journal' },
  { label: '合作', labelEn: 'COOPERATION', path: '/cooperation' },
  { label: '关于', labelEn: 'ABOUT', path: '/about' },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const header = headerRef.current;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        if (header) {
          const s = window.scrollY > 80;
          header.classList.toggle('glass-header', s || !isHome);
          header.classList.toggle('bg-transparent', !s && isHome);
        }
        rafId = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Animate underline on route change
  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => item.path === location.pathname);
    const activeLink = linkRefs.current[activeIndex];
    if (activeLink && underlineRef.current && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      gsap.to(underlineRef.current, {
        x: linkRect.left - navRect.left,
        width: linkRect.width,
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out',
      });
    } else if (underlineRef.current) {
      gsap.to(underlineRef.current, { opacity: 0, duration: 0.2 });
    }
    setMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 md:h-20 px-6 md:px-12 lg:px-16">
        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, '/')}
          className="flex items-baseline gap-3 group relative z-10"
        >
          <span className="font-serif text-lg md:text-xl font-medium text-mist tracking-heading">
            儒意
          </span>
          <span
            className="text-overline text-stone group-hover:text-mist transition-colors duration-300 hidden md:inline"
          >
            RU STUDIO
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={navRef} className="hidden md:flex items-center gap-8 relative">
          {navItems.map((item, i) => (
            <a
              key={item.path}
              href={item.path}
              ref={(el) => { linkRefs.current[i] = el; }}
              onClick={(e) => handleNavClick(e, item.path)}
              className={`relative py-2 text-overline transition-colors duration-300 ${
                location.pathname === item.path
                  ? 'text-mist'
                  : 'text-stone hover:text-mist'
              }`}
            >
              <span className="sr-only">{item.label}</span>
              <span aria-hidden="true">{item.labelEn}</span>
            </a>
          ))}
          {/* Animated underline */}
          <div
            ref={underlineRef}
            className="absolute bottom-0 left-0 h-px bg-cinnabar opacity-0"
            style={{ width: 0, transition: 'none' }}
          />

          {/* Admin link */}
          {isAuthenticated() && (
            <Link
              to="/admin"
              className="relative py-2 text-overline text-stone/40 hover:text-cinnabar transition-colors duration-300"
              title="管理后台"
            >
              ◆
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden relative z-10 w-11 h-11 flex flex-col items-center justify-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-px bg-mist transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-1' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-mist transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-0.5' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-ink/95 backdrop-blur-xl z-40 transition-all duration-500 flex flex-col items-center justify-center ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <nav className="flex flex-col items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => handleNavClick(e, item.path)}
              className={`text-display-m font-serif transition-colors duration-300 ${
                location.pathname === item.path ? 'text-mist' : 'text-stone hover:text-mist'
              }`}
            >
              {item.label}
            </a>
          ))}
          {isAuthenticated() && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-overline text-stone/40 hover:text-cinnabar transition-colors"
            >
              ADMIN PANEL
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
