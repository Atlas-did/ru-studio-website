/**
 * LiYiStarMap — 六艺星图
 * 暗色圆形图谱，六艺分布圆周，中心"仁"字发光
 * 悬停展开扇形，点击展开详情
 */
import { useState, useRef } from 'react';
import gsap from 'gsap';

const sixArts = [
  { id: 'li', name: '礼', nameEn: 'RITES', angle: 0, desc: '礼者，天地之序也。揖让进退，皆有其道。', color: '#8B1A1A', icon: '🙏' },
  { id: 'yue', name: '乐', nameEn: 'MUSIC', angle: 60, desc: '乐者，天地之和也。五音调心，琴瑟在御。', color: '#9C8458', icon: '🎵' },
  { id: 'she', name: '射', nameEn: 'ARCHERY', angle: 120, desc: '射者，进退周还必中礼。内志正，外体直。', color: '#3B4D63', icon: '🏹' },
  { id: 'yu', name: '御', nameEn: 'CHARIOT', angle: 180, desc: '御者，六辔在手，一尘不惊。行止有度。', color: '#5a4a3a', icon: '🐎' },
  { id: 'shu', name: '书', nameEn: 'WRITING', angle: 240, desc: '书者，心画也。笔走龙蛇，墨分五色。', color: '#2c5f2d', icon: '✒️' },
  { id: 'shu2', name: '数', nameEn: 'MATH', angle: 300, desc: '数者，万物之纪。河图洛书，参伍以变。', color: '#4a2c5f', icon: '🔢' },
];

export default function LiYiStarMap() {
  const [active, setActive] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      if (containerRef.current) gsap.to(containerRef.current.querySelector('.detail-panel'), { opacity: 0, y: 20, duration: 0.3 });
    } else {
      setExpanded(id);
      if (containerRef.current) gsap.fromTo(containerRef.current.querySelector('.detail-panel'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
    }
  };

  const activeArt = sixArts.find(a => a.id === expanded);

  const cx = 200, cy = 200, r = 160;

  return (
    <div className="min-h-screen bg-ink pt-20 px-6 py-12 flex flex-col items-center" ref={containerRef}>
      <h1 className="font-serif text-display-l text-mist mb-2">六艺星图</h1>
      <p className="text-body text-stone mb-12">礼乐射御书数，触之见微知著</p>

      <div className="relative" style={{ width: 400, height: 400 }}>
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(245,242,235,0.06)" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="rgba(245,242,235,0.04)" strokeWidth={1} />

          {/* Center "仁" */}
          <circle cx={cx} cy={cy} r={35} fill="rgba(139,26,26,0.15)" stroke="rgba(139,26,26,0.3)" strokeWidth={1} />
          <text x={cx} y={cy + 12} textAnchor="middle" className="font-serif" fill="#F5F2EB" fontSize={32} fontWeight={300}>仁</text>

          {/* Six arts nodes */}
          {sixArts.map(art => {
            const rad = (art.angle - 90) * Math.PI / 180;
            const nx = cx + r * Math.cos(rad);
            const ny = cy + r * Math.sin(rad);
            const isActive = active === art.id || expanded === art.id;
            return (
              <g key={art.id} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActive(art.id)}
                onMouseLeave={() => setActive(null)}
                onClick={() => handleClick(art.id)}>
                {/* Orbit glow */}
                {isActive && (
                  <circle cx={nx} cy={ny} r={45} fill="rgba(139,26,26,0.08)" stroke={art.color} strokeWidth={0.5} opacity={0.4} />
                )}
                {/* Node */}
                <circle cx={nx} cy={ny} r={isActive ? 28 : 20}
                  fill={isActive ? 'rgba(139,26,26,0.2)' : 'rgba(10,10,10,0.8)'}
                  stroke={isActive ? art.color : 'rgba(245,242,235,0.1)'}
                  strokeWidth={1}
                  className="transition-all duration-300" />
                <text x={nx} y={ny + 5} textAnchor="middle" fill={isActive ? '#F5F2EB' : '#8A8580'} fontSize={14}>{art.icon}</text>
                {/* Label */}
                <text x={nx} y={ny + (isActive ? 50 : 38)} textAnchor="middle" fill={isActive ? '#F5F2EB' : '#8A8580'}
                  fontSize={11} fontFamily="Inter, sans-serif" letterSpacing="0.2em">{art.nameEn}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail panel */}
      {expanded && activeArt && (
        <div className="detail-panel mt-8 p-6 border border-[rgba(245,242,235,0.1)] bg-ink-light max-w-md w-full">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">{activeArt.icon}</span>
            <div>
              <h3 className="font-serif text-h1 text-mist">{activeArt.name}</h3>
              <p className="text-caption-s text-stone">{activeArt.nameEn}</p>
            </div>
          </div>
          <p className="text-body text-stone leading-relaxed">{activeArt.desc}</p>
          {activeArt.id === 'shu' && (
            <a href="/#/experience/write" className="inline-block mt-4 text-caption-s text-cinnabar hover:text-cinnabar-light transition-colors">
              进入竹简书写 →
            </a>
          )}
          <button onClick={() => setExpanded(null)} className="block mt-4 text-caption-s text-stone/50 hover:text-stone transition-colors">收起</button>
        </div>
      )}
    </div>
  );
}
