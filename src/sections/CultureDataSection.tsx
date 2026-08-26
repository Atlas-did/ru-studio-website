import { useEffect, useRef } from 'react';

/**
 * CultureDataSection — 文化数据墙
 * 用真实、可溯源的数据讲"儒家文脉的当代表达"。
 * 进入视口时数字滚动计数（reduced-motion 下直接显示终值）。
 * 排版故意不对称：数字大小不一、纵向错落，呼应"不要横平竖直"。
 */

interface Stat {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  note: string;
  source: string;
  sourceUrl: string;
  big?: boolean;
  offset?: string;
}

const STATS: Stat[] = [
  {
    value: 28,
    decimals: 0,
    suffix: '根',
    label: '大成殿前檐·深浮雕双龙石柱',
    note: '曲阜孔庙大成殿四周共 28 根雕龙石柱，前檐 10 根为高约 6 米的双龙深浮雕柱，其余 18 根每柱雕 72 条龙。',
    source: '三孔旅游指南',
    sourceUrl: 'https://shandong.chinapost.com.cn/sd/report/2108/802279-1.html',
    big: true,
  },
  {
    value: 30,
    decimals: 0,
    suffix: '万件',
    label: '孔府档案·近三十万件',
    note: '自明嘉靖 1534 年至 1948 年，孔府档案约 9000 余卷、近 30 万件，2016 年入选世界记忆亚太地区名录，现藏于孔子博物馆。',
    source: '孔子博物馆',
    sourceUrl: 'https://www.kzbwg.cn/news/my/589.html',
    offset: 'md:mt-16',
  },
  {
    value: 47.3,
    decimals: 1,
    suffix: '万人次',
    label: '2024 国庆·三孔景区接待游客',
    note: '孔庙、孔府、孔林三景区 2024 年国庆假期接待游客 47.3 万人次，同比增长 4.3%。',
    source: '齐鲁网·济宁频道',
    sourceUrl: 'http://jining.iqilu.com/jnminsheng/2024/1008/5725553.shtml',
    big: true,
  },
  {
    value: 34.28,
    decimals: 2,
    suffix: '亿元',
    label: '2024 全国博物馆文创销售收入',
    note: '按国家文物局口径，2024 年全国博物馆文创销售收入约 34.28 亿元，同比增长 63.7%。',
    source: '国家文物局数据报道',
    sourceUrl: 'https://view.inews.qq.com/k/20260518A02ZZV00',
    offset: 'md:mt-10',
  },
];

function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.textContent = value.toFixed(decimals);
      return;
    }

    let raf = 0;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const t0 = performance.now();
        const dur = 1600;
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (value * eased).toFixed(decimals);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, decimals]);

  return <span ref={ref}>0</span>;
}

export default function CultureDataSection() {
  return (
    <section className="relative bg-ink py-24 md:py-36 overflow-hidden">
      {/* 巨型竖排侧题字 */}
      <span
        aria-hidden="true"
        className="hidden lg:block absolute right-[2vw] top-10 text-[9vw] font-serif vertical-text select-none pointer-events-none"
        style={{ color: 'rgba(245,242,235,0.045)' }}
      >
        文脉数据
      </span>

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="mb-16 md:mb-24 max-w-xl">
          <span className="block text-overline text-stone mb-5">CULTURE IN NUMBERS · 文化数据</span>
          <h2 className="font-serif text-display-l text-mist leading-[1.15]">
            千年文脉，<br />
            有数可循
          </h2>
          <p className="text-body text-stone mt-6 leading-loose max-w-md">
            我们相信，文化不是一句口号。这些数字来自官方发布与权威报道，标注来源，欢迎查证。
          </p>
        </div>

        {/* 不对称数据墙：数字大小不一、纵向错落 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-14 md:gap-y-16">
          {STATS.map((s, i) => (
            <div
              key={i}
              className={`relative border-t border-line-medium pt-6 md:pt-8 ${
                s.big ? 'md:col-span-7' : 'md:col-span-5'
              } ${s.offset || ''}`}
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-serif text-mist leading-none ${
                    s.big ? 'text-display-l md:text-[clamp(56px,6vw,96px)]' : 'text-display-m'
                  }`}
                >
                  <CountUp value={s.value} decimals={s.decimals} />
                  <span className="text-cinnabar text-[0.35em] align-baseline">{s.suffix}</span>
                </span>
              </div>
              <p className="font-serif text-body text-mist mt-4 tracking-wide">{s.label}</p>
              <p className="text-caption text-stone mt-3 leading-relaxed max-w-sm">{s.note}</p>
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-caption-s text-fg-muted hover:text-accent transition-colors duration-300"
              >
                来源 · {s.source}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5h5v5m0-5L9 15M19 5l-8 8" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
