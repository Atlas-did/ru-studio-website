import { useParams, Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getCollectionItems } from '@/lib/data';

export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: allItems } = useSiteData(
    () => api.getCollectionItems(),
    { initialData: getCollectionItems() }
  );
  const item = (allItems || []).find((i) => i.slug === slug);

  const headerRef = useScrollReveal<HTMLDivElement>();
  const bodyRef = useScrollReveal<HTMLDivElement>();

  if (!item) {
    return (
      <div className="min-h-screen bg-ink pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-2xl text-mist">作品未找到</h1>
          <Link to="/collection" className="mt-6 inline-block font-sans text-xs text-mist/60 hover:text-cinnabar transition-colors uppercase">
            ← 返回作品收藏
          </Link>
        </div>
      </div>
    );
  }

  const content = (item as any).content || '';
  const paragraphs = content ? content.split('\n').filter((p: string) => p.trim()) : [];

  return (
    <div className="min-h-screen bg-ink pt-20 md:pt-28">
      {/* Header */}
      <div ref={headerRef} className="px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/collection"
            className="font-sans text-[11px] tracking-[0.15em] text-text-secondary hover:text-cinnabar transition-colors uppercase"
          >
            ← COLLECTION
          </Link>

          <div className="flex flex-col md:flex-row md:items-start gap-6 mt-8">
            {/* Cover image */}
            <div className="md:w-1/2 shrink-0">
              <div className="relative aspect-[3/4] overflow-hidden border border-[rgba(168,164,154,0.15)]">
                <img
                  src={item.cover.url}
                  alt={item.cover.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase border border-[rgba(168,164,154,0.2)] px-2 py-0.5">
                  {item.category}
                </span>
                <span className="font-sans text-xs text-text-secondary">{item.year}</span>
              </div>

              <h1 className="font-display text-[clamp(24px,4vw,40px)] font-light text-mist tracking-wide leading-tight">
                {item.title}
              </h1>
              {item.subtitle && (
                <p className="mt-2 font-serif text-sm text-text-secondary italic">
                  {item.subtitle}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {item.tags.map((tag: string) => (
                  <span key={tag} className="font-sans text-[10px] text-text-secondary/60 border border-[rgba(168,164,154,0.18)] px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      {paragraphs.length > 0 && (
        <div ref={bodyRef} className="px-6 md:px-12 pb-24 md:pb-40">
          <div className="max-w-2xl mx-auto">
            <div className="border-t border-[rgba(168,164,154,0.12)] pt-12">
              {paragraphs.map((text: string, i: number) => (
                <p key={i} className="font-serif text-[16px] leading-[2] text-text-secondary mb-6">
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer nav */}
      <div className="px-6 md:px-12 pb-20">
        <div className="max-w-5xl mx-auto border-t border-[rgba(168,164,154,0.12)] pt-8">
          <Link
            to="/collection"
            className="font-sans text-[11px] tracking-[0.15em] text-text-secondary hover:text-cinnabar transition-colors uppercase"
          >
            ← 返回作品列表
          </Link>
        </div>
      </div>
    </div>
  );
}
