import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getJournalPosts } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

export default function JournalPreview() {
  const { data: allPosts } = useSiteData(
    () => api.getJournalPosts(),
    { initialData: getJournalPosts() }
  );
  const posts = (allPosts || []).slice(0, 3);

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const list = listRef.current;
    if (!section || !header || !list) return;

    // Run-once guard
    if (posts.length === 0) return;
    if (header.dataset.animated === '1') {
      ScrollTrigger.refresh();
      return;
    }
    header.dataset.animated = '1';

    const ctx = gsap.context(() => {
      gsap.from(header.querySelectorAll('.reveal-item'), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      const items = list.querySelectorAll('.journal-item');
      items.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          x: -30,
          duration: 0.7,
          delay: i * 0.1,
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
  }, [posts]);

  return (
    <section ref={sectionRef} data-theme="paper" className="relative bg-base py-24 md:py-32 lg:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="flex items-end justify-between mb-16">
          <div>
            <span className="reveal-item block text-overline text-fg-muted mb-4">
              JOURNAL · 动态
            </span>
            <h2 className="reveal-item font-serif text-display-l text-fg">
              品牌日志
            </h2>
          </div>
          <Link
            to="/journal"
            className="reveal-item hidden md:flex items-center gap-2 text-overline text-fg-muted hover:text-fg transition-colors duration-300 group"
          >
            <span>ALL ENTRIES</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Journal List */}
        <div ref={listRef} className="space-y-0">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/journal/${post.slug}`}
              className="journal-item group block py-8 md:py-10 border-t border-line hover:bg-raised/60 transition-colors duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                <div className="md:col-span-2 flex md:flex-col gap-3 md:gap-1">
                  <span className="text-caption text-fg-muted">{post.date}</span>
                  <span className="text-caption-s text-cinnabar tracking-overline">{post.category}</span>
                </div>
                <div className="md:col-span-8">
                  <h3 className="font-serif text-h2 text-fg group-hover:text-accent transition-colors duration-300 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-body text-fg-secondary line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center justify-end">
                  <div className="w-10 h-10 rounded-full border border-line-strong flex items-center justify-center group-hover:border-accent group-hover:bg-accent-soft transition-all duration-300">
                    <svg className="w-4 h-4 text-fg-muted group-hover:text-accent transform group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <div className="border-t border-line" />
        </div>

        {/* Mobile View All */}
        <div className="mt-12 text-center md:hidden">
          <Link to="/journal" className="inline-flex items-center gap-2 text-overline text-fg-muted hover:text-fg transition-colors duration-300">
            <span>ALL ENTRIES</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
