import { useParams, Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getJournalPosts } from '@/lib/data';

export default function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: allPosts } = useSiteData(
    () => api.getJournalPosts(),
    { initialData: getJournalPosts() }
  );
  const post = (allPosts || []).find((p) => p.slug === slug);

  const headerRef = useScrollReveal<HTMLDivElement>();
  const bodyRef = useScrollReveal<HTMLDivElement>();

  if (!post) {
    return (
      <div className="min-h-screen bg-mist pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-2xl text-ink">文章未找到</h1>
          <Link to="/journal" className="mt-6 inline-block font-sans text-xs text-ink/60 hover:text-cinnabar transition-colors uppercase">
            ← 返回日志列表
          </Link>
        </div>
      </div>
    );
  }

  // Parse content by newlines
  const paragraphs = (post as any).content
    ? (post as any).content.split('\n').filter((p: string) => p.trim())
    : [post.excerpt];

  return (
    <div className="min-h-screen bg-mist pt-20 md:pt-28">
      {/* Header */}
      <div ref={headerRef} className="px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/journal"
            className="font-sans text-[11px] tracking-[0.15em] text-ink/40 hover:text-cinnabar transition-colors uppercase"
          >
            ← JOURNAL
          </Link>

          <div className="flex items-center gap-4 mt-8 mb-4">
            <span className="font-sans text-[11px] tracking-[0.1em] text-ink/40">
              {post.date}
            </span>
            <span className="font-sans text-[10px] tracking-[0.1em] text-indigo uppercase border border-indigo/30 px-2 py-0.5">
              {post.category}
            </span>
          </div>

          <h1 className="font-serif text-[clamp(24px,4vw,40px)] font-medium text-ink leading-tight tracking-wide">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 font-serif text-[15px] text-ink/50 leading-relaxed italic">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Featured image */}
      {(post as any).image_url && (
        <div className="px-6 md:px-12 pb-8">
          <div className="max-w-3xl mx-auto">
            <img
              src={(post as any).image_url}
              alt={post.title}
              className="w-full object-cover border border-[rgba(168,164,154,0.2)]"
              style={{ maxHeight: '480px' }}
            />
          </div>
        </div>
      )}

      {/* Article body */}
      <div ref={bodyRef} className="px-6 md:px-12 pb-24 md:pb-40">
        <div className="max-w-2xl mx-auto">
          <article className="prose-custom">
            {paragraphs.map((text: string, i: number) => (
              <p
                key={i}
                className="font-serif text-[16px] leading-[2] text-ink/80 mb-6"
              >
                {text}
              </p>
            ))}
          </article>

          {/* Divider */}
          <div className="mt-16 pt-8 border-t border-[rgba(168,164,154,0.3)]">
            <Link
              to="/journal"
              className="font-sans text-[11px] tracking-[0.15em] text-ink/40 hover:text-cinnabar transition-colors uppercase"
            >
              ← 返回日志列表
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
