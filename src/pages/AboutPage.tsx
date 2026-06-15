import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function AboutPage() {
  const titleRef = useScrollReveal<HTMLDivElement>();
  const contentRef = useScrollReveal<HTMLDivElement>({ stagger: 0.1, childSelector: '.about-block' });

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

      {/* Content */}
      <div ref={contentRef} className="px-6 md:px-12 pb-24 md:pb-40">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
          <div className="about-block">
            <h2 className="font-serif text-xl font-medium text-mist mb-4">品牌使命</h2>
            <p className="font-serif text-[15px] text-text-secondary leading-[1.8]">
              以「向历史借灵感，为当代造美物」为核心理念，通过学术解码、创意转化、体验升级，
              让儒家文化从典籍与古迹中走出，成为可触摸、可使用、可共鸣的生活载体。
            </p>
          </div>

          <div className="about-block">
            <h2 className="font-serif text-xl font-medium text-mist mb-4">品牌愿景</h2>
            <p className="font-serif text-[15px] text-text-secondary leading-[1.8]">
              构建「儒家文化阐释第一品牌」，打造集研究、设计、生产、销售于一体的文旅融合生态，
              成为连接传统文化与现代生活的核心桥梁。
            </p>
          </div>

          <div className="about-block md:col-span-2 pt-8 border-t border-[rgba(168,164,154,0.18)]">
            <h2 className="font-serif text-xl font-medium text-mist mb-6">核心业务板块</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <span className="font-display text-2xl text-gold">01</span>
                <h3 className="mt-3 font-serif text-base font-medium text-mist">产品矩阵构建</h3>
                <p className="mt-2 font-serif text-sm text-text-secondary leading-[1.8]">
                  经典复刻、生活美学、互动体验、定制服务四大系列，覆盖从日常文具到高端收藏的全线产品。
                </p>
              </div>
              <div>
                <span className="font-display text-2xl text-gold">02</span>
                <h3 className="mt-3 font-serif text-base font-medium text-mist">体验场景打造</h3>
                <p className="mt-2 font-serif text-sm text-text-secondary leading-[1.8]">
                  线下体验空间、MR数字文创、校园传播三位一体的沉浸式文化消费场景。
                </p>
              </div>
              <div>
                <span className="font-display text-2xl text-gold">03</span>
                <h3 className="mt-3 font-serif text-base font-medium text-mist">文化传播运营</h3>
                <p className="mt-2 font-serif text-sm text-text-secondary leading-[1.8]">
                  内容引流、渠道渗透、公益联动，构建多维度的儒家文化传播体系。
                </p>
              </div>
            </div>
          </div>

          <div className="about-block md:col-span-2 pt-8 border-t border-[rgba(168,164,154,0.18)]">
            <h2 className="font-serif text-xl font-medium text-mist mb-6">发展规划</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-l-2 border-cinnabar pl-6">
                <span className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">
                  短期 1-2 年
                </span>
                <p className="mt-2 font-serif text-sm text-text-secondary leading-[1.8]">
                  完善核心产品矩阵，打造3-5款年度爆款，实现年营收突破80万元。
                </p>
              </div>
              <div className="border-l-2 border-gold pl-6">
                <span className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">
                  中期 3-5 年
                </span>
                <p className="mt-2 font-serif text-sm text-text-secondary leading-[1.8]">
                  建立儒家文创设计标准体系，开展IP授权业务，拓展省外合作渠道。
                </p>
              </div>
              <div className="border-l-2 border-indigo pl-6">
                <span className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">
                  长期 5-10 年
                </span>
                <p className="mt-2 font-serif text-sm text-text-secondary leading-[1.8]">
                  推动文创产品成为儒学海外传播载体，构建国际化文化品牌。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
