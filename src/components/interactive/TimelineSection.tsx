/**
 * TimelineSection — 交互式儒家文化时间线
 * 参考: Nike storytelling timeline / 故宫数字展览时间线
 * 行为: 水平滚动时间线，点击节点展开详情，GSAP动画驱动
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  tag?: string;
}

const timelineData: TimelineEvent[] = [
  {
    year: '551 BC',
    title: '孔子诞生',
    description: '孔子出生于鲁国陬邑，名丘，字仲尼。儒家思想的源头，影响中华文明两千余年。',
    tag: '起源',
  },
  {
    year: '479 BC',
    title: '孔子逝世',
    description: '孔子逝世后，弟子整理其言行编成《论语》，成为儒家经典之首。',
    tag: '经典',
  },
  {
    year: '汉武帝',
    title: '罢黜百家，独尊儒术',
    description: '汉武帝采纳董仲舒建议，确立儒学为国家正统思想，影响中国政治两千余年。',
    tag: '国策',
  },
  {
    year: '宋代',
    title: '程朱理学',
    description: '朱熹集大成，构建以"理"为核心的哲学体系，《四书章句集注》成为科举标准。',
    tag: '哲学',
  },
  {
    year: '明代',
    title: '曲阜孔庙大成',
    description: '孔庙经历代扩建，成为规模最大的祭祀建筑群，体现儒家礼制文化的巅峰。',
    tag: '建筑',
  },
  {
    year: '2014',
    title: '孔子学院全球布局',
    description: '全球孔子学院数量达到500余所，儒家文化走向世界，成为跨文明对话的桥梁。',
    tag: '传播',
  },
  {
    year: '2024',
    title: '儒意 RU STUDIO 创立',
    description: '以"向历史借灵感，为当代造美物"为理念，开始探索儒家文化的当代设计转译。',
    tag: '当代',
  },
];

export default function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      // 标题入场
      gsap.from(section.querySelectorAll('.timeline-reveal'), {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // 节点依次入场
      gsap.from(track.querySelectorAll('.timeline-node'), {
        opacity: 0,
        scale: 0.5,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: track,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      // 连线绘制动画
      gsap.from(track.querySelector('.timeline-line'), {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: track,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-ink py-24 md:py-32 lg:py-40 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <span className="timeline-reveal block text-overline text-stone mb-4">
            TIMELINE
          </span>
          <h2 className="timeline-reveal font-serif text-display-l text-mist max-w-xl" style={{ textWrap: 'balance' }}>
            儒脉传承
          </h2>
          <p className="timeline-reveal text-body text-stone mt-4 max-w-lg">
            从孔子诞生到当代文创，两千五百年的文化长河。点击节点，探索每个时代的儒家印记。
          </p>
        </div>

        {/* Timeline Track */}
        <div ref={trackRef} className="relative">
          {/* 水平连线 */}
          <div
            className="timeline-line absolute top-[19px] left-0 right-0 h-px bg-cinnabar/20 md:block hidden"
          />

          {/* 节点网格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-4">
            {timelineData.map((event, i) => (
              <div key={i} className="relative">
                {/* 节点圆点 */}
                <button
                  onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                  className="timeline-node relative z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 group"
                  style={{
                    borderColor: activeIndex === i
                      ? 'rgba(139,26,26,0.8)'
                      : 'rgba(245,242,235,0.15)',
                    backgroundColor: activeIndex === i
                      ? 'rgba(139,26,26,0.2)'
                      : 'rgba(10,10,10,0.8)',
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: activeIndex === i
                        ? '#8B1A1A'
                        : 'rgba(138,133,128,0.5)',
                      transform: activeIndex === i ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                </button>

                {/* 年份 */}
                <div className="mt-4">
                  <span
                    className={`font-display text-sm tracking-wide transition-colors duration-300 ${
                      activeIndex === i ? 'text-cinnabar' : 'text-stone'
                    }`}
                  >
                    {event.year}
                  </span>
                  <h4 className="font-serif text-body text-mist mt-1 leading-snug">
                    {event.title}
                  </h4>
                  {event.tag && (
                    <span className="inline-block mt-1 text-caption-s text-stone/50 border border-[rgba(245,242,235,0.08)] px-2 py-0.5">
                      {event.tag}
                    </span>
                  )}
                </div>

                {/* 展开详情 */}
                <div
                  className="overflow-hidden transition-all duration-500 ease-out"
                  style={{
                    maxHeight: activeIndex === i ? 200 : 0,
                    opacity: activeIndex === i ? 1 : 0,
                  }}
                >
                  <p className="text-caption text-stone mt-3 leading-relaxed pr-2">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-16 md:mt-24 flex items-center gap-4">
          <div className="h-px flex-1 bg-[rgba(245,242,235,0.06)]" />
          <span className="text-caption-s text-stone/30 font-sans tracking-overline">
            儒家文化创意工作室
          </span>
          <div className="h-px flex-1 bg-[rgba(245,242,235,0.06)]" />
        </div>
      </div>
    </section>
  );
}
