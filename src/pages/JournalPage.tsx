import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getJournalPosts } from '@/lib/data';

export default function JournalPage() {
  const { data: posts } = useSiteData(
    () => api.getJournalPosts(),
    { initialData: getJournalPosts() }
  );
  const titleRef = useScrollReveal<HTMLDivElement>();
  const listRef = useScrollReveal<HTMLDivElement>({ stagger: 0.1, childSelector: '.journal-entry' });

  return (
    <div className="bg-mist min-h-screen pt-20 md:pt-28">
      {/* Hero */}
      <div ref={titleRef} className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-sans text-[11px] tracking-[0.2em] text-ink/40 uppercase mb-6">
            JOURNAL
          </p>
          <h1 className="font-display text-[clamp(36px,5vw,64px)] font-light text-ink tracking-wide">
            宣发日志
          </h1>
        </div>
      </div>

      {/* Editorial Index */}
      <div ref={listRef} className="px-6 md:px-12 pb-24 md:pb-40">
        <div className="max-w-[1440px] mx-auto">
          {(posts || []).map((post, index, arr) => (
            <div
              key={post.slug}
              className={`journal-entry group py-8 md:py-10 ${
                index < arr.length - 1 ? 'border-b border-[rgba(168,164,154,0.3)]' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="flex items-center gap-4 md:w-48 shrink-0">
                  <span className="font-sans text-[11px] tracking-[0.1em] text-ink/40">
                    {post.date}
                  </span>
                  <span className="font-sans text-[10px] tracking-[0.1em] text-indigo uppercase border border-indigo/30 px-2 py-0.5">
                    {post.category}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg md:text-xl font-medium text-ink group-hover:text-cinnabar transition-colors duration-300 leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 font-serif text-sm text-ink/50 leading-relaxed max-w-2xl">
                    {post.excerpt}
                  </p>
                </div>
                <span className="hidden md:block font-sans text-xl text-ink/20 group-hover:text-cinnabar group-hover:translate-x-1 transition-all duration-300">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
