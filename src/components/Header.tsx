import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { isAuthenticated } from '@/lib/admin-api';
import { useI18n } from '@/lib/i18n';

const navItems = [
  { label: '首页', labelEn: 'HOME', path: '/' },
  { label: '作品', labelEn: 'COLLECTION', path: '/collection' },
  { label: '日志', labelEn: 'JOURNAL', path: '/journal' },
  { label: '媒体', labelEn: 'PRESS', path: '/press' },
  { label: '合作', labelEn: 'COOPERATION', path: '/cooperation' },
  { label: '关于', labelEn: 'ABOUT', path: '/about' },
];

function isActive(pathname: string, path: string) {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(path + '/');
}

export default function Header() {
  const location = useLocation();
  const { lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Transparent over hero (home top), glass afterwards
  const transparent = location.pathname === '/' && !scrolled;

  // Close mobile menu on route change (adjust-during-render pattern, no effect needed)
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => isActive(location.pathname, item.path));
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
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent ? 'bg-transparent' : 'glass-header'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 md:h-20 px-6 md:px-12 lg:px-16">
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-3 group relative z-10" aria-label="儒意 RU STUDIO 首页">
          <span className="font-serif text-lg md:text-xl font-medium text-fg tracking-heading">
            儒意
          </span>
          <span className="text-overline text-fg-muted group-hover:text-fg transition-colors duration-300 hidden md:inline">
            RU STUDIO
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={navRef} aria-label="主导航" className="hidden md:flex items-center gap-7 lg:gap-8 relative">
          {navItems.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              ref={(el) => { linkRefs.current[i] = el; }}
              className={`relative py-2 text-overline transition-colors duration-300 ${
                isActive(location.pathname, item.path)
                  ? 'text-fg'
                  : 'text-fg-muted hover:text-fg'
              }`}
              aria-current={isActive(location.pathname, item.path) ? 'page' : undefined}
            >
              <span className="sr-only">{item.label}</span>
              <span aria-hidden="true">{item.labelEn}</span>
            </Link>
          ))}

          {/* Animated underline */}
          <div
            ref={underlineRef}
            className="absolute bottom-0 left-0 h-px bg-accent opacity-0"
            style={{ width: 0 }}
          />

          {isAuthenticated() && (
            <Link
              to="/admin"
              className="relative py-2 text-overline text-fg-ghost hover:text-accent transition-colors duration-300"
              title="管理后台"
              aria-label="管理后台"
            >
              ◆
            </Link>
          )}

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="relative py-2 text-overline text-fg-muted hover:text-fg transition-colors duration-300"
            aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden relative z-10 w-11 h-11 flex flex-col items-center justify-center gap-1.5"
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={`block w-5 h-px bg-fg transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-[3px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-fg transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-[1px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`md:hidden fixed inset-0 bg-base/95 backdrop-blur-xl z-40 transition-all duration-500 flex flex-col items-center justify-center ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <nav aria-label="移动端导航" className="flex flex-col items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className={`text-display-m font-serif transition-colors duration-300 ${
                isActive(location.pathname, item.path) ? 'text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated() && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className="text-overline text-fg-ghost hover:text-accent transition-colors"
            >
              ADMIN PANEL
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
