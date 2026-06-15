import { Link } from 'react-router-dom';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getSiteConfig } from '@/lib/data';

export default function Footer() {
  const { data: config } = useSiteData(
    () => api.getSiteConfig(),
    { initialData: getSiteConfig() }
  );

  return (
    <footer className="bg-ink border-t border-[rgba(168,164,154,0.18)] relative">
      {/* Bottom fade gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.5) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="font-display text-2xl text-mist hover:text-cinnabar transition-colors duration-300"
            >
              儒
            </Link>
            <p className="mt-4 font-serif text-sm text-text-secondary leading-relaxed">
              {config?.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-6">
              Navigation
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'About', to: '/about' },
                { label: 'Collection', to: '/collection' },
                { label: 'Journal', to: '/journal' },
                { label: 'Cooperation', to: '/cooperation' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="font-sans text-sm text-mist/60 hover:text-cinnabar transition-colors duration-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-6">
              Contact
            </h4>
            <p className="font-sans text-sm text-mist/60">
              {config?.contactEmail}
            </p>
            <p className="mt-4 font-serif text-sm text-text-secondary">
              曲阜师范大学 · 网络空间安全学院
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-[rgba(168,164,154,0.18)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[11px] text-text-secondary tracking-wide">
            &copy; {new Date().getFullYear()} {config?.brandNameEn}. All rights reserved.
          </p>
          <p className="font-sans text-[11px] text-text-secondary tracking-wide">
            千年文脉 · 一脉创链
          </p>
        </div>
      </div>
    </footer>
  );
}
