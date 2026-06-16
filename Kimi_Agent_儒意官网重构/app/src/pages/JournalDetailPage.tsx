import { useParams, Link } from 'react-router-dom';
import { getJournalPosts } from '@/lib/data';

export function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = getJournalPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <section className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 text-center">
          <h1 className="font-serif text-display-l text-mist mb-6">日志未找到</h1>
          <Link to="/journal" className="text-overline text-stone hover:text-mist transition-colors">
            返回日志列表
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
      <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Breadcrumb */}
        <div className="mb-12">
          <Link
            to="/journal"
            className="text-overline text-stone hover:text-mist transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            JOURNAL
          </Link>
        </div>

        {/* Meta */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-caption text-stone">{post.date}</span>
            <span className="text-stone/40">|</span>
            <span className="text-caption-s text-cinnabar tracking-overline">{post.category}</span>
          </div>
          <h1 className="font-serif text-display-m text-mist" style={{ textWrap: 'balance' }}>
            {post.title}
          </h1>
        </div>

        {/* Divider */}
        <div className="hr-ink mb-12" />

        {/* Content */}
        <div className="text-body text-mist/70 leading-relaxed whitespace-pre-line">
          {post.content || post.excerpt}
        </div>

        {/* Back */}
        <div className="mt-16 pt-8 border-t border-border-subtle">
          <Link
            to="/journal"
            className="text-overline text-stone hover:text-mist transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回日志列表
          </Link>
        </div>
      </div>
    </section>
  );
}
