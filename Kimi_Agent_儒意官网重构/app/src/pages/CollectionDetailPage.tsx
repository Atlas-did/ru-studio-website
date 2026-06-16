import { useParams, Link } from 'react-router-dom';
import { getCollectionItems } from '@/lib/data';

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const items = getCollectionItems();
  const item = items.find((i) => i.slug === slug);

  if (!item) {
    return (
      <section className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 text-center">
          <h1 className="font-serif text-display-l text-mist mb-6">作品未找到</h1>
          <Link to="/collection" className="text-overline text-stone hover:text-mist transition-colors">
            返回作品集
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Breadcrumb */}
        <div className="mb-12">
          <Link
            to="/collection"
            className="text-overline text-stone hover:text-mist transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            COLLECTION
          </Link>
        </div>

        {/* Hero Image */}
        <div className="mb-12 md:mb-16">
          <div className="relative aspect-[16/9] overflow-hidden border border-border-subtle">
            <img
              src={item.cover.url}
              alt={item.cover.alt}
              className="w-full h-full object-cover"
            />
            <div className="noise-overlay absolute inset-0" />
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <span className="text-overline text-stone mb-4 block">
              {item.category} · {item.year}
            </span>
            <h1 className="font-serif text-display-m text-mist mb-4">
              {item.title}
            </h1>
            {item.subtitle && (
              <p className="text-caption text-stone mb-8">{item.subtitle}</p>
            )}
            {item.content && (
              <div className="text-body text-mist/70 leading-relaxed whitespace-pre-line">
                {item.content}
              </div>
            )}
          </div>

          <div className="md:col-span-3 md:col-start-10">
            <div className="border-t border-border-subtle pt-6">
              <h3 className="text-overline text-stone mb-4">TAGS</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 border border-border-subtle text-caption-s text-stone">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
