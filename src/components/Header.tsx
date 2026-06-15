import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/admin-api';

const navItems = [
  { label: 'ABOUT', to: '/about' },
  { label: 'COLLECTION', to: '/collection' },
  { label: 'JOURNAL', to: '/journal' },
  { label: 'COOPERATION', to: '/cooperation' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ink/80 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-12 h-16 md:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl md:text-2xl tracking-wide text-mist hover:text-cinnabar transition-colors duration-300"
        >
          儒
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-sans text-[11px] tracking-[0.15em] text-mist/70 hover:text-cinnabar transition-colors duration-300 uppercase"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Admin link — only shown when logged in */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated() ? (
            <Link
              to="/admin"
              className="font-sans text-[11px] tracking-[0.1em] text-text-secondary/50 hover:text-cinnabar transition-colors duration-300 uppercase"
              title="Admin Panel"
            >
              ◆
            </Link>
          ) : null}
          {/* Contact Button - Desktop */}
          <Link
            to="/cooperation"
            className="font-sans text-[11px] tracking-[0.1em] text-mist border border-mist px-4 py-2 hover:bg-cinnabar hover:border-cinnabar hover:text-mist transition-all duration-300 uppercase"
          >
            CONTACT
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-px bg-mist transition-transform duration-300 ${
              menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-mist transition-opacity duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-mist transition-transform duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-ink/95 backdrop-blur-md overflow-hidden transition-all duration-500 ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col px-6 py-6 gap-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="font-sans text-xs tracking-[0.15em] text-mist/70 hover:text-cinnabar transition-colors duration-300 uppercase"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/cooperation"
            className="font-sans text-xs tracking-[0.1em] text-mist border border-mist px-4 py-2 text-center hover:bg-cinnabar hover:border-cinnabar transition-all duration-300 uppercase mt-2"
          >
            CONTACT
          </Link>
        </nav>
      </div>
    </header>
  );
}
