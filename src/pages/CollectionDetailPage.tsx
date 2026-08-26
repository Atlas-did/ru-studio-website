import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getCollectionItems } from '@/lib/data';
import type { CollectionItem } from '@/lib/data';
import SEO from '@/components/SEO';
import Seal from '@/components/Seal';
import ImageZoomViewer from '@/components/interactive/ImageZoomViewer';
import DraggableGallery from '@/components/interactive/DraggableGallery';
import { useI18n, pick } from '@/lib/i18n';

function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll('.reveal-block');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((i) => observer.observe(i));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useI18n();
  const { data: allItems } = useSiteData(() => api.getCollectionItems(), {
    initialData: getCollectionItems(),
  });
  const [copied, setCopied] = useState(false);

  const storyRef = useRevealOnScroll<HTMLDivElement>();

  const items = allItems || [];
  const index = items.findIndex((i) => i.slug === slug);
  const item = index >= 0 ? items[index] : undefined;
  const nextItem = item ? items[(index + 1) % items.length] : undefined;

  if (!item) {
    return (
      <div className="min-h-screen bg-base pt-32 pb-24 px-6 md:px-12" data-theme="ink">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-display-m text-fg">作品未找到</h1>
          <Link to="/collection" className="mt-6 inline-block text-overline text-fg-muted hover:text-accent transition-colors">
            ← 返回作品收藏
          </Link>
        </div>
      </div>
    );
  }

  const extended = item as CollectionItem & {
    gallery?: string[];
    video_url?: string;
    content_en?: string;
    subtitle_en?: string;
  };
  const galleryList: string[] = Array.isArray(extended.gallery)
    ? extended.gallery
    : typeof extended.gallery === 'string' && extended.gallery
    ? (() => { try { return JSON.parse(extended.gallery) as string[]; } catch { return []; } })()
    : [];
  const videoUrl: string | undefined = extended.video_url || undefined;

  const content: string = extended.content || '';
  const paragraphs = content ? content.split('\n').filter((p: string) => p.trim()) : [];

  // Immersive gallery: cover + curated extras
  const galleryImages = [
    { src: item.cover.url, alt: item.cover.alt, caption: '封面' },
    ...galleryList.map((src, i) => ({ src, alt: `${item.title} 细节 ${i + 1}`, caption: `细节 ${['I', 'II', 'III', 'IV'][i] || i + 1}` })),
    ...(galleryList.length === 0
      ? [
          { src: '/assets/hero-still-life.jpg', alt: '细节展示一', caption: '细节 I' },
          { src: '/assets/crt-temple-texture.jpg', alt: '细节展示二', caption: '细节 II' },
        ]
      : []),
  ];

  const shareUrl = window.location.href;

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${item.title} — 儒意 RU STUDIO`, url: shareUrl });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <article className="bg-base text-fg" data-theme="ink">
      <SEO
        title={`${item.title} ${item.subtitle || ''}`}
        description={paragraphs[0]?.slice(0, 150) || `${item.title} — 儒意作品集 · ${item.category} · ${item.year}`}
        path={`/collection/${item.slug}`}
        type="article"
        image={item.cover.url}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: item.title,
          alternateName: item.subtitle,
          genre: item.category,
          dateCreated: String(item.year),
          keywords: item.tags.join(','),
          image: item.cover.url,
          description: item.cover.alt,
          creator: { '@type': 'Organization', name: '儒意 RU STUDIO' },
        }}
      />

      {/* ─── Full-bleed immersive hero ─── */}
      <header className="relative h-[92dvh] overflow-hidden">
        <img
          src={item.cover.url}
          alt={item.cover.alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, #0A0A0A 4%, rgba(10,10,10,0.25) 45%, rgba(10,10,10,0.55) 100%)',
          }}
        />

        <div className="absolute bottom-14 left-0 right-0 px-6 md:px-12 lg:px-16">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Link
                to="/collection"
                className="text-overline text-mist/50 hover:text-mist transition-colors inline-block mb-5"
              >
                ← COLLECTION
              </Link>
              <h1 className="font-serif text-display-l text-mist mb-2 leading-tight">{pick(item, 'title', lang)}</h1>
              {item.subtitle && (
                <p className="text-caption text-mist/60 italic font-serif tracking-wide">
                  {lang === 'en' && extended.subtitle_en ? extended.subtitle_en : item.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Seal text={String(item.year).slice(-2)} size={40} variant="zhu" stamp />
              <div className="flex gap-3">
                <span className="border border-mist/25 px-2 py-1 text-caption-s text-mist/80">{item.category}</span>
                <span className="border border-mist/25 px-2 py-1 text-caption-s text-mist/80">{item.year}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Zoom viewer ─── */}
      <section className="px-6 md:px-12 lg:px-16 pt-16 md:pt-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 relative aspect-[16/10] overflow-hidden border border-line">
            <ImageZoomViewer src={item.cover.url} alt={item.cover.alt} zoomScale={3} className="w-full h-full" />
          </div>
          <div className="md:col-span-4 md:col-start-9 flex flex-col justify-between">
            <div>
              <h2 className="text-overline text-fg-muted mb-4">DETAILS · 细节</h2>
              <p className="text-body text-fg-secondary leading-relaxed">{item.cover.alt}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {item.tags.map((tag: string) => (
                  <span key={tag} className="text-caption-s text-fg-muted border border-line px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-10">
              <h2 className="text-overline text-fg-muted mb-3">SHARE · 分享</h2>
              <button
                onClick={onShare}
                className="group inline-flex items-center gap-3 border border-line-strong px-5 py-3 text-overline text-fg hover:border-accent hover:bg-accent-soft transition-all duration-300"
              >
                {copied ? t('share_copied') : t('share_copy')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Draggable gallery ─── */}
      <section className="px-6 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <span className="text-overline text-fg-muted mb-6 block">GALLERY — 拖拽浏览</span>
          <DraggableGallery images={galleryImages} itemWidth={62} gap={16} />
        </div>
      </section>

      {/* ─── Video ─── */}
      {videoUrl && (
        <section className="px-6 md:px-12 lg:px-16 pb-16 md:pb-24">
          <div className="max-w-[1100px] mx-auto">
            <span className="text-overline text-fg-muted mb-6 block">FILM — 影像</span>
            <video
              src={videoUrl}
              controls
              preload="metadata"
              poster={item.cover.url}
              className="w-full aspect-video bg-black border border-line"
            />
          </div>
        </section>
      )}

      {/* ─── Story scroll-narrative ─── */}
      {paragraphs.length > 0 && (
        <div ref={storyRef}>
          <style>{`
            .reveal-block { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
            .reveal-block.revealed { opacity: 1; transform: translateY(0); }
          `}</style>
          <section className="px-6 md:px-12 lg:px-16 pb-24 md:pb-32">
            <div className="max-w-2xl mx-auto border-t border-line pt-14">
              <span className="text-overline text-fg-muted">STORY · 作品故事</span>
              {paragraphs.map((text: string, i: number) =>
                i === 0 ? (
                  <p key={i} className="reveal-block font-serif text-body-l text-fg mt-8 mb-8 leading-loose first-letter:text-display-l first-letter:font-serif first-letter:text-accent first-letter:mr-1 first-letter:float-left first-letter:leading-none">
                    {text.slice(0, 60)}
                    {text.length > 60 && <span className="text-fg-secondary text-body"> {text.slice(60)}</span>}
                  </p>
                ) : (
                  <p key={i} className={`reveal-block font-serif text-body text-fg-secondary mb-6 ${i % 3 === 2 ? 'md:ml-10' : ''}`}>
                    {text}
                  </p>
                )
              )}
              <div className="reveal-block ink-divider mt-12 text-fg-ghost">
                <Seal text="儒意" size={36} variant="bai" />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ─── Next work ─── */}
      {nextItem && (
        <Link
          to={`/collection/${nextItem.slug}`}
          className="group relative block border-t border-line overflow-hidden"
          data-cursor="view"
        >
          <div className="relative h-[46dvh] min-h-[320px]">
            <img
              src={nextItem.cover.url}
              alt={nextItem.cover.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-65 group-hover:scale-[1.03] transition-all duration-700 ease-out img-rubbing"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-base via-transparent to-black/40" />
            <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 flex flex-col items-center justify-center text-center">
              <span className="text-overline text-mist/50 mb-4">{t('next_work')}</span>
              <h2 className="font-serif text-display-m text-mist">{pick(nextItem, 'title', lang)}</h2>
              <span className="mt-6 inline-flex items-center gap-2 text-overline text-mist/70 group-hover:text-mist transition-colors">
                {t('view_works')}
              </span>
            </div>
          </div>
        </Link>
      )}
    </article>
  );
}
