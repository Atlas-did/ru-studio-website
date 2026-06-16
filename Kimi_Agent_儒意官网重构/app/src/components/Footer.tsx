import { Link } from 'react-router-dom';
import { getSiteConfig } from '@/lib/data';

export function Footer() {
  const config = getSiteConfig();

  const linkGroups = [
    {
      title: '导航',
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
      title: '社交',
      titleEn: 'SOCIAL',
      links: [
        { label: '微信公众号', path: '#' },
        { label: '小红书', path: '#' },
        { label: 'Instagram', path: '#' },
      ],
    },
    {
      title: '联系',
      titleEn: 'CONTACT',
      links: [
        { label: config.contactEmail, path: `mailto:${config.contactEmail}` },
        { label: '山东省曲阜市', path: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-ink border-t border-border-subtle">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 pt-16 md:pt-24 pb-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-block mb-6">
              <span className="font-serif text-2xl md:text-3xl text-mist tracking-heading">
                {config.brandName}
              </span>
              <span className="block text-overline text-stone mt-2">
                {config.brandNameEn}
              </span>
            </Link>
            <p className="text-body text-stone max-w-xs leading-relaxed">
              {config.tagline}
            </p>
          </div>

          {/* Link Columns */}
          {linkGroups.map((group) => (
            <div key={group.titleEn} className="md:col-span-2 md:col-start-auto">
              <h4 className="text-overline text-stone mb-6">
                {group.titleEn}
              </h4>
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
        </div>

        {/* Divider */}
        <div className="hr-ink mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption-s text-stone/50">
            &copy; {new Date().getFullYear()} {config.brandName} RU STUDIO. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/admin/dashboard"
              className="text-caption-s text-stone/30 hover:text-stone/60 transition-colors duration-300"
            >
              管理后台
            </Link>
            <span className="text-caption-s text-stone/30">
              鲁ICP备XXXXXXXX号
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
