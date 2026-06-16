import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getJournalPosts } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const categories = ['全部', '展览', '新品', '合作', '荣誉'];

export function JournalPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState('全部');
  const posts = getJournalPosts();

  const filtered = activeCategory === '全部'
    ? posts
    : posts.filter((post) => post.category === activeCategory);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const items = section.querySelectorAll('.journal-entry');
      items.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          delay: i * 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <section ref={sectionRef} className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-12">
          <span className="block text-overline text-stone mb-4">JOURNAL</span>
          <h1 className="font-serif text-display-l text-mist mb-8">日志</h1>

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

        {/* Entries */}
        <div className="space-y-0">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              to={`/journal/${post.slug}`}
              className="journal-entry group block py-8 md:py-10 border-t border-border-subtle hover:bg-ink-light/30 transition-colors duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                <div className="md:col-span-2 flex md:flex-col gap-3 md:gap-1">
                  <span className="text-caption text-stone">{post.date}</span>
                  <span className="text-caption-s text-cinnabar tracking-overline">{post.category}</span>
                </div>
                <div className="md:col-span-8">
                  <h3 className="font-serif text-h2 text-mist group-hover:text-mist/80 transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-body text-stone line-clamp-2 leading-relaxed">{post.excerpt}</p>
                </div>
                <div className="md:col-span-2 flex items-center justify-end">
                  <div className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center group-hover:border-mist/30 group-hover:bg-mist/5 transition-all">
                    <svg className="w-4 h-4 text-stone group-hover:text-mist transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <div className="border-t border-border-subtle" />
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-body text-stone">该分类暂无日志</p>
          </div>
        )}
      </div>
    </section>
  );
}
