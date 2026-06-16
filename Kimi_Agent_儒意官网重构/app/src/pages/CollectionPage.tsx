import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCollectionItems } from '@/lib/data';
import type { CollectionItem } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const categories = ['全部', '摄影', '装置', '影像'];

export function CollectionPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState('全部');
  const items = getCollectionItems();

  const filtered = activeCategory === '全部'
    ? items
    : items.filter((item) => item.category === activeCategory);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll('.collection-card');
      gsap.from(cards, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section.querySelector('.collection-grid'),
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, section);

    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <section ref={sectionRef} className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-12">
          <span className="block text-overline text-stone mb-4">COLLECTION</span>
          <h1 className="font-serif text-display-l text-mist mb-8">作品集</h1>

          {/* Category Filter */}
          <div className="flex gap-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-overline transition-colors duration-300 ${
                  activeCategory === cat ? 'text-mist' : 'text-stone hover:text-mist/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="collection-grid grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <CollectionCard key={item.slug} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-body text-stone">该分类暂无作品</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CollectionCard({ item }: { item: CollectionItem }) {
  return (
    <Link
      to={`/collection/${item.slug}`}
      className="collection-card group block border border-border-subtle bg-ink-light overflow-hidden"
      data-cursor="view"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.cover.url}
          alt={item.cover.alt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-500" />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-caption-s text-cinnabar tracking-overline">{item.category}</span>
          <span className="text-stone/40">|</span>
          <span className="text-caption-s text-stone">{item.year}</span>
        </div>
        <h3 className="font-serif text-body text-mist group-hover:text-mist/80 transition-colors">
          {item.title}
        </h3>
      </div>
    </Link>
  );
}
