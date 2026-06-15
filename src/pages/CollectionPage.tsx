import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getCollectionItems } from '@/lib/data';

const categories = ['全部', '影像', '摄影', '装置', '纪录'];

export default function CollectionPage() {
  const { data: allItems } = useSiteData(
    () => api.getCollectionItems(),
    { initialData: getCollectionItems() }
  );
  const [activeFilter, setActiveFilter] = useState('全部');
  const titleRef = useScrollReveal<HTMLDivElement>();
  const gridRef = useScrollReveal<HTMLDivElement>({ stagger: 0.1, childSelector: '.collection-card' });

  const filteredItems = activeFilter === '全部'
    ? (allItems || [])
    : (allItems || []).filter((item) => item.category === activeFilter);

  return (
    <div className="bg-ink min-h-screen pt-20 md:pt-28">
      {/* Hero */}
      <div ref={titleRef} className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-sans text-[11px] tracking-[0.2em] text-text-secondary uppercase mb-6">
            COLLECTION
          </p>
          <h1 className="font-display text-[clamp(36px,5vw,64px)] font-light text-mist tracking-wide">
            作品收藏
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 md:px-12 pb-8">
        <div className="max-w-[1440px] mx-auto flex gap-6 md:gap-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`font-sans text-[11px] tracking-[0.15em] uppercase pb-2 border-b transition-all duration-300 ${
                activeFilter === cat
                  ? 'text-mist border-mist'
                  : 'text-text-secondary border-transparent hover:text-mist hover:border-text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="px-6 md:px-12 pb-24 md:pb-40">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.slug} className="collection-card group">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.cover.url}
                  alt={item.cover.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 border border-mist/0 group-hover:border-mist/60 transition-all duration-500 pointer-events-none" />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-all duration-500 flex items-center justify-center">
                  <span className="font-sans text-[11px] tracking-[0.2em] text-mist border border-mist/60 px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    VIEW
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-base font-medium text-mist group-hover:text-cinnabar transition-colors duration-300">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="mt-1 font-sans text-[11px] text-text-secondary tracking-wide">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <span className="font-sans text-[10px] tracking-[0.1em] text-text-secondary">
                  {item.category}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans text-[10px] tracking-wide text-text-secondary/60 border border-[rgba(168,164,154,0.18)] px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
