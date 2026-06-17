import { Link } from 'react-router-dom';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getSiteConfig } from '@/lib/data';

export default function Footer() {
  const { data: config } = useSiteData(
    () => api.getSiteConfig(),
    { initialData: getSiteConfig() }
  );

  const linkGroups = [
    {
      titleEn: 'NAVIGATION',
      links: [
        { label: '首页', path: '/' },
        { label: '作品', path: '/collection' },
        { label: '日志', path: '/journal' },
        { label: '合作', path: '/cooperation' },
        { label: '关于', path: '/about' },
      ],
    },
    {
      titleEn: 'SOCIAL',
      links: [
        { label: '微信公众号', path: '#' },
        { label: '小红书', path: '#' },
        { label: 'Instagram', path: '#' },
      ],
    },
    {
      titleEn: 'CONTACT',
      links: [
        { label: config?.contactEmail || 'wu27@qfnu.edu.cn', path: `mailto:${config?.contactEmail || 'wu27@qfnu.edu.cn'}` },
        { label: '山东省曲阜市', path: '#' },
        { label: '曲阜师范大学 · 数学科学学院', path: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-ink border-t border-[rgba(245,242,235,0.08)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 pt-16 md:pt-24 pb-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-block mb-6">
              <span className="font-serif text-2xl md:text-3xl text-mist tracking-heading">
                {config?.brandName || '儒意'}
              </span>
              <span className="block text-overline text-stone mt-2">
                {config?.brandNameEn || 'RU STUDIO'}
              </span>
            </Link>
            <p className="text-body text-stone max-w-xs leading-relaxed">
              {config?.tagline || '向历史借灵感，为当代造美物'}
            </p>
          </div>

          {/* Link Columns */}
          {linkGroups.map((group) => (
            <div key={group.titleEn} className="md:col-span-2 md:col-start-auto">
              <h4 className="text-overline text-stone mb-6">{group.titleEn}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-caption text-mist/60 hover:text-mist transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Remaining col to fill 12-col grid */}
          <div className="md:col-span-1" />
        </div>

        {/* Divider */}
        <div className="hr-ink mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption-s text-stone/50">
            &copy; {new Date().getFullYear()} {config?.brandName || '儒意'} RU STUDIO. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/admin"
              className="text-caption-s text-stone/30 hover:text-stone/60 transition-colors duration-300"
            >
              管理后台
            </Link>
            <span className="font-serif text-caption-s text-stone/50 tracking-wide">
              千年文脉 · 一脉创链
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
