import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getJournalPosts } from '@/lib/data';

export default function JournalPreview() {
  const { data: allPosts } = useSiteData(
    () => api.getJournalPosts(),
    { initialData: getJournalPosts() }
  );
  const posts = (allPosts || []).slice(0, 3);
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-mist py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16">
          {/* Left: Image */}
          <div className="md:col-span-2">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src="/assets/hero-still-life.jpg"
                alt="日志封面"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-ink/10" />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <h2 className="font-display text-[clamp(24px,3vw,36px)] font-normal text-ink tracking-wide">
                日志
              </h2>
              <Link
                to="/journal"
                className="font-sans text-[11px] tracking-[0.15em] text-ink/60 hover:text-cinnabar transition-colors duration-300 uppercase"
              >
                VIEW ALL
              </Link>
            </div>
          </div>

          {/* Right: Post List */}
          <div className="md:col-span-3 flex flex-col">
            {posts.map((post, index) => (
              <Link
                to={`/journal/${post.slug}`}
                key={post.slug}
                className={`group py-6 md:py-8 block cursor-pointer ${
                  index < posts.length - 1
                    ? 'border-b border-[rgba(168,164,154,0.3)]'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-sans text-[10px] tracking-[0.15em] text-ink/40 uppercase">
                        {post.date}
                      </span>
                      <span className="font-sans text-[10px] tracking-[0.1em] text-indigo uppercase">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg md:text-xl font-medium text-ink group-hover:text-cinnabar transition-colors duration-300 leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2 font-serif text-sm text-ink/50 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="font-sans text-xl text-ink/20 group-hover:text-cinnabar group-hover:translate-x-1 transition-all duration-300">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
