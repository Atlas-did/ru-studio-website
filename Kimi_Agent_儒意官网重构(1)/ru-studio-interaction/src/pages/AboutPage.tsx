import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';

interface AboutSection {
  id: string;
  title: string;
  content: string;
}

export default function AboutPage() {
  const titleRef = useScrollReveal<HTMLDivElement>();
  const contentRef = useScrollReveal<HTMLDivElement>({ stagger: 0.1, childSelector: '.about-block' });

  const { data: sections } = useSiteData(
    () => api.getAbout(),
    { initialData: [] }
  );

  const aboutSections: AboutSection[] = (sections && sections.length > 0) ? sections : [
    { id: 'mission', title: '品牌使命', content: '以「向历史借灵感，为当代造美物」为核心理念，通过学术解码、创意转化、体验升级，让儒家文化从典籍与古迹中走出，成为可触摸、可使用、可共鸣的生活载体。' },
    { id: 'vision', title: '品牌愿景', content: '构建「儒家文化阐释第一品牌」，打造集研究、设计、生产、销售于一体的文旅融合生态，成为连接传统文化与现代生活的核心桥梁。' },
    { id: 'business', title: '核心业务板块', content: '01. 产品矩阵构建\n经典复刻、生活美学、互动体验、定制服务四大系列，覆盖从日常文具到高端收藏的全线产品。\n\n02. 体验场景打造\n线下体验空间、MR数字文创、校园传播三位一体的沉浸式文化消费场景。\n\n03. 文化传播运营\n内容引流、渠道渗透、公益联动，构建多维度的儒家文化传播体系。' },
    { id: 'roadmap', title: '发展规划', content: '短期 1-2 年\n完善核心产品矩阵，打造3-5款年度爆款，实现年营收突破80万元。\n\n中期 3-5 年\n建立儒家文创设计标准体系，开展IP授权业务，拓展省外合作渠道。\n\n长期 5-10 年\n推动文创产品成为儒学海外传播载体，构建国际化文化品牌。' },
  ];

  const renderContent = (content: string) =>
    content.split('\n').filter(p => p.trim()).map((line, i) => (
      <p key={i} className="font-serif text-[15px] text-text-secondary leading-[1.8]">{line}</p>
    ));

  return (
    <div className="bg-ink min-h-screen pt-20 md:pt-28">
      {/* Hero */}
      <div ref={titleRef} className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-sans text-[11px] tracking-[0.2em] text-text-secondary uppercase mb-6">
            ABOUT US
          </p>
          <h1 className="font-display text-[clamp(36px,5vw,64px)] font-light text-mist tracking-wide leading-tight max-w-3xl">
            千年文脉，
            <br />
            一脉创链
          </h1>
        </div>
      </div>

      {/* Dynamic Content Sections */}
      <div ref={contentRef} className="px-6 md:px-12 pb-24 md:pb-40">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
          {aboutSections.map((section) => {
            if (section.id === 'mission' || section.id === 'vision') {
              return (
                <div key={section.id} className="about-block">
                  <h2 className="font-serif text-xl font-medium text-mist mb-4">{section.title}</h2>
                  <div className="space-y-3">{renderContent(section.content)}</div>
                </div>
              );
            }

            if (section.id === 'business') {
              return (
                <div key={section.id} className="about-block md:col-span-2 pt-8 border-t border-[rgba(168,164,154,0.18)]">
                  <h2 className="font-serif text-xl font-medium text-mist mb-6">{section.title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {section.content.split('\n\n').filter(Boolean).map((block, idx) => (
                      <div key={idx}>
                        <span className="font-display text-2xl text-gold">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="mt-3 space-y-1">
                          {block.split('\n').filter(Boolean).map((line, i) => {
                            if (i === 0) {
                              return <h3 key={i} className="font-serif text-base font-medium text-mist">{line.replace(/^\d+\.\s*/, '')}</h3>;
                            }
                            return <p key={i} className="font-serif text-sm text-text-secondary leading-[1.8]">{line}</p>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (section.id === 'roadmap') {
              const borderColors = ['border-l-cinnabar', 'border-l-gold', 'border-l-indigo'];
              return (
                <div key={section.id} className="about-block md:col-span-2 pt-8 border-t border-[rgba(168,164,154,0.18)]">
                  <h2 className="font-serif text-xl font-medium text-mist mb-6">{section.title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {section.content.split('\n\n').filter(Boolean).map((block, idx) => {
                      const lines = block.split('\n').filter(Boolean);
                      const period = lines[0] || '';
                      const desc = lines.slice(1).join('\n');
                      return (
                        <div key={idx} className={`border-l-2 ${borderColors[idx] || 'border-l-cinnabar'} pl-6`}>
                          <span className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">{period}</span>
                          <p className="mt-2 font-serif text-sm text-text-secondary leading-[1.8]">{desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}
