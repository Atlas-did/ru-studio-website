import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seal from './Seal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getSiteConfig } from '@/lib/data';

export default function Footer() {
  const { data: config } = useSiteData(() => api.getSiteConfig(), { initialData: getSiteConfig() });
  const [email, setEmail] = useState('');
  const [subState, setSubState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || subState === 'sending') return;
    setSubState('sending');
    try {
      await api.subscribe(email);
      setSubState('ok');
      setEmail('');
    } catch {
      setSubState('err');
    }
  };

  return (
    <footer className="relative bg-base text-fg border-t border-line overflow-hidden">
      {/* Giant watermark char */}
      <span aria-hidden="true" className="giant-char -bottom-[6vw] -right-[2vw] text-[22vw] opacity-60">
        儒
      </span>

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 pt-16 md:pt-24 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-4 mb-6" aria-label="返回首页">
              <Seal text="儒意" size={52} stamp />
              <span>
                <span className="block font-serif text-2xl md:text-3xl font-medium tracking-heading">
                  {config?.brandName || '儒意'}
                </span>
                <span className="block text-overline text-fg-muted mt-1">
                  {config?.brandNameEn || 'RU STUDIO'}
                </span>
              </span>
            </Link>
            <p className="text-body text-fg-secondary max-w-xs leading-relaxed mb-8">
              {config?.tagline || '向历史借灵感，为当代造美物'}
            </p>

            {/* Newsletter */}
            <div>
              <h4 className="text-overline text-fg-muted mb-4">订阅动态 · NEWSLETTER</h4>
              {subState === 'ok' ? (
                <p className="text-caption text-accent" role="status">
                  已收到你的订阅，新作品与展讯将第一时间送达。
                </p>
              ) : (
                <form onSubmit={onSubscribe} className="flex max-w-sm" aria-label="订阅品牌动态">
                  <label htmlFor="footer-email" className="sr-only">邮箱地址</label>
                  <input
                    id="footer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 min-w-0 bg-transparent border border-line-strong px-4 py-3 text-caption text-fg placeholder:text-fg-muted focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={subState === 'sending'}
                    className="shrink-0 bg-cinnabar hover:bg-cinnabar-light disabled:opacity-60 text-paper px-5 py-3 text-overline transition-colors"
                  >
                    {subState === 'sending' ? '···' : '订阅'}
                  </button>
                </form>
              )}
              {subState === 'err' && (
                <p className="text-caption text-accent mt-2" role="alert">订阅失败，请稍后重试。</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h4 className="text-overline text-fg-muted mb-6">导航</h4>
            <ul className="space-y-3">
              {[
                { label: '首页', path: '/' },
                { label: '作品', path: '/collection' },
                { label: '日志', path: '/journal' },
                { label: '媒体中心', path: '/press' },
                { label: '合作', path: '/cooperation' },
                { label: '关于', path: '/about' },
              ].map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="brush-underline text-caption text-fg-secondary hover:text-fg transition-colors duration-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2">
            <h4 className="text-overline text-fg-muted mb-6">关注</h4>
            <ul className="space-y-3">
              {[
                { label: '微信公众号', path: '#' },
                { label: '小红书', path: '#' },
                { label: 'Instagram', path: '#' },
                { label: 'Bilibili', path: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.path} className="brush-underline text-caption text-fg-secondary hover:text-fg transition-colors duration-300">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-overline text-fg-muted mb-6">联络</h4>
            <ul className="space-y-3 text-caption text-fg-secondary">
              <li>
                <a href={`mailto:${config?.contactEmail || 'wu27@qfnu.edu.cn'}`} className="brush-underline hover:text-fg transition-colors">
                  {config?.contactEmail || 'wu27@qfnu.edu.cn'}
                </a>
              </li>
              <li>山东省曲阜市</li>
              <li>曲阜师范大学 · 网络空间安全学院</li>
            </ul>
            <Link
              to="/press"
              className="inline-flex items-center gap-2 mt-8 text-overline text-accent brush-underline"
            >
              媒体资料下载 →
            </Link>
          </div>
        </div>

        <div className="hr-ink mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption-s text-fg-muted">
            &copy; {new Date().getFullYear()} {config?.brandName || '儒意'} RU STUDIO. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/admin" className="text-caption-s text-fg-ghost hover:text-fg-muted transition-colors duration-300">
              管理后台
            </Link>
            <span className="font-serif text-caption-s text-fg-muted tracking-wide">
              千年文脉 · 一脉创链
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
