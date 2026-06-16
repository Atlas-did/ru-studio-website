import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getSiteConfig } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

export function AboutPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const config = getSiteConfig();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const items = section.querySelectorAll('.reveal-item');
      items.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.1 + i * 0.08,
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
  }, []);

  return (
    <section ref={sectionRef} className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <span className="reveal-item block text-overline text-stone mb-4">
            ABOUT
          </span>
          <h1 className="reveal-item font-serif text-display-l text-mist max-w-2xl" style={{ textWrap: 'balance' }}>
            关于儒意
          </h1>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          {/* Left Column */}
          <div className="md:col-span-5">
            <div className="reveal-item mb-12">
              <h2 className="font-serif text-h1 text-mist mb-4">品牌名称</h2>
              <p className="text-body text-stone leading-relaxed">
                {config.brandName}（{config.brandNameEn}），取自"儒家之意"，寓意以儒家文化为核心，提取其精神内核融入现代设计。
              </p>
            </div>

            <div className="reveal-item mb-12">
              <h2 className="font-serif text-h1 text-mist mb-4">核心理念</h2>
              <p className="text-body text-stone leading-relaxed">
                "向历史借灵感，为当代造美物"——我们致力于将儒家文化的深厚底蕴转化为当代人可以感知、使用和喜爱的文创产品，让传统文化在现代生活中焕发新的生命力。
              </p>
            </div>

            <div className="reveal-item">
              <h2 className="font-serif text-h1 text-mist mb-4">所在地</h2>
              <p className="text-body text-stone leading-relaxed">
                山东曲阜——孔子故里，儒家文化发源地。曲阜的孔庙、孔府、孔林，为儒意提供了源源不断的创作灵感。
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-6 md:col-start-7">
            <div className="reveal-item mb-12">
              <h2 className="font-serif text-h1 text-mist mb-4">品牌故事</h2>
              <div className="space-y-4 text-body text-mist/70 leading-relaxed">
                <p>
                  儒意诞生于曲阜师范大学校园内，一群热爱传统文化的青年设计师，在一次孔庙写生中被古建筑上的纹样深深触动。
                </p>
                <p>
                  他们开始思考：如何让更多人感受到儒家文化的美？如何让传统符号走进现代生活？带着这些问题，儒意应运而生。
                </p>
                <p>
                  从最初的书签设计到如今的完整产品体系，儒意始终坚持"以古为新，借古开今"的设计理念，在尊重传统的基础上进行创新表达。
                </p>
              </div>
            </div>

            <div className="reveal-item">
              <h2 className="font-serif text-h1 text-mist mb-4">品牌定位</h2>
              <p className="text-body text-stone leading-relaxed mb-6">
                构建儒家文化阐释第一品牌，用设计语言讲述中国故事。
              </p>
              <div className="flex flex-wrap gap-3">
                {['经典复刻', '生活美学', '互动体验', '定制服务'].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 border border-border-subtle text-caption text-stone"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hr-ink my-16 md:my-24" />

        {/* Contact */}
        <div className="reveal-item">
          <h2 className="font-serif text-h1 text-mist mb-4">联系我们</h2>
          <p className="text-body text-stone mb-2">
            邮箱：{config.contactEmail}
          </p>
          <p className="text-body text-stone">
            地址：山东省曲阜市曲阜师范大学
          </p>
        </div>
      </div>
    </section>
  );
}
