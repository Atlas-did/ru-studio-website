import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import SEO from '@/components/SEO';
import Seal from '@/components/Seal';

interface PressItem {
  id: string;
  type: string;
  title: string;
  url: string;
  file_url: string;
  logo_url: string;
  source: string;
  date: string;
}

/** 媒体中心 /press — press kit, news releases, coverage wall */
export default function PressPage() {
  const { data } = useSiteData(() => api.getPress(), { initialData: [] });
  const items = (data as PressItem[]) || [];
  const coverage = items.filter((i) => i.type === 'coverage');
  const kit = items.filter((i) => i.type === 'kit');
  const releases = items.filter((i) => i.type === 'release');

  return (
    <div className="bg-base min-h-screen pt-20 md:pt-28" data-theme="paper">
      <SEO
        title="媒体中心"
        description="儒意 RU STUDIO 媒体资料：品牌资料包下载、新闻稿、媒体报道——供媒体与合作伙伴取用。"
        path="/press"
      />

      {/* Hero */}
      <header className="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
        <span aria-hidden="true" className="giant-char right-[3vw] -top-[4vw] text-[24vw]">
          宣
        </span>
        <div className="max-w-[1440px] mx-auto relative z-10">
          <p className="text-overline text-fg-muted mb-6">PRESS · MEDIA</p>
          <h1 className="font-serif text-display-l text-fg tracking-wide max-w-2xl">
            媒体中心
          </h1>
          <p className="text-body-l text-fg-secondary mt-6 max-w-xl leading-relaxed">
            欢迎媒体朋友与合作伙伴取用品牌资料。报道或转载请邮件告知，我们会第一时间提供支持。
          </p>
        </div>
      </header>

      {/* Press Kit */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-[1440px] mx-auto border border-line-strong bg-raised/60 p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <h2 className="text-overline text-fg-muted mb-4">PRESS KIT · 品牌资料包</h2>
            <p className="text-body text-fg-secondary leading-relaxed mb-6">
              包含品牌标志（SVG/PNG）、标准色卡、高清代表作品图与品牌介绍 PDF。
              资料可用于媒体报道、活动宣传与合作提案（非商用请注明出处）。
            </p>
            <ul className="space-y-2 text-caption text-fg-muted">
              <li>· 品牌标志与印章规范</li>
              <li>· 朱砂 / 宣纸 / 墨黑标准色值</li>
              <li>· 代表作品高清图集</li>
              <li>· 品牌故事 PDF（中英双语）</li>
            </ul>
          </div>
          <div className="md:col-span-4 md:col-start-9 flex flex-col gap-3">
            {kit.length > 0 ? (
              kit.map((k) => (
                <a
                  key={k.id}
                  href={k.file_url}
                  download
                  className="group flex items-center justify-between border border-line-strong px-5 py-4 hover:border-accent hover:bg-accent-soft transition-all duration-300"
                >
                  <span className="text-caption text-fg">{k.title}</span>
                  <span className="text-overline text-accent">下载 ↓</span>
                </a>
              ))
            ) : (
              <>
                <a
                  href={`mailto:wu27@qfnu.edu.cn?subject=${encodeURIComponent('索取品牌资料包 Press Kit')}`}
                  className="flex items-center justify-center gap-3 bg-cinnabar hover:bg-cinnabar-light text-paper px-5 py-4 text-overline transition-colors"
                >
                  邮件索取完整资料包
                </a>
                <Seal text="资料" size={40} variant="zhu" className="self-end opacity-80" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Releases */}
      {releases.length > 0 && (
        <section className="px-6 md:px-12 pb-16">
          <div className="max-w-[1440px] mx-auto">
            <h2 className="text-overline text-fg-muted mb-8">NEWS RELEASES · 新闻稿</h2>
            <div className="divide-y divide-line border-t border-line">
              {releases.map((r) => (
                <article key={r.id} className="py-6 group">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <span className="text-caption-s text-fg-muted shrink-0">{r.date}</span>
                    <h3 className="font-serif text-h2 text-fg group-hover:text-accent transition-colors flex-1">
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="brush-underline">
                          {r.title}
                        </a>
                      ) : (
                        r.title
                      )}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coverage wall */}
      <section className="px-6 md:px-12 pb-24 md:pb-32">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-overline text-fg-muted mb-8">IN THE MEDIA · 媒体报道</h2>
          {coverage.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {coverage.map((c) => (
                <a
                  key={c.id}
                  href={c.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-lift group block border border-line bg-raised/60 p-6 hover:border-accent transition-colors duration-300"
                >
                  <span className="block text-overline text-fg-muted mb-4">{c.source}</span>
                  <h3 className="font-serif text-h2 text-fg leading-snug mb-4">{c.title}</h3>
                  <span className="inline-flex items-center gap-2 text-caption-s text-fg-muted group-hover:text-accent transition-colors mt-auto">
                    阅读全文 →
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-line-strong p-10 text-center">
              <p className="text-body text-fg-secondary">
                报道征集中 —— 若你发布了关于「儒意」的报道，欢迎来信，我们将收录于此。
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
