import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const fortunes = [
  { quote: '君子和而不同', source: '《论语·子路》', recs: ['bronze-bookmark', 'sandalwood-holder'] },
  { quote: '温故而知新', source: '《论语·为政》', recs: ['ru-ware-cup', 'handbound-notebook'] },
  { quote: '己所不欲，勿施于人', source: '《论语·颜渊》', recs: ['canvas-tote', 'sandalwood-holder'] },
  { quote: '学而时习之', source: '《论语·学而》', recs: ['handbound-notebook', 'ru-paperweight'] },
  { quote: '德不孤，必有邻', source: '《论语·里仁》', recs: ['sandalwood-holder', 'bronze-bookmark'] },
  { quote: '知之者不如好之者', source: '《论语·雍也》', recs: ['ru-paperweight', 'ru-ware-cup'] },
];

const recProducts: Record<string, { name: string; price: number; image: string }> = {
  'bronze-bookmark': { name: '论语书签', price: 188, image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400' },
  'ru-ware-cup': { name: '汝窑茶盏', price: 128, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400' },
  'sandalwood-holder': { name: '檀香插', price: 88, image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400' },
  'ru-paperweight': { name: '儒意镇纸', price: 268, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  'canvas-tote': { name: '帆布袋', price: 68, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' },
  'handbound-notebook': { name: '手抄笔记本', price: 58, image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400' },
};

export default function FortunePage() {
  const [stage, setStage] = useState<'idle' | 'shaking' | 'result'>('idle');
  const [fortune, setFortune] = useState<typeof fortunes[0] | null>(null);
  const tubeRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);

  const drawFortune = () => {
    if (stage !== 'idle') return;
    setStage('shaking');

    const tl = gsap.timeline({ onComplete: () => {
      const f = fortunes[Math.floor(Math.random() * fortunes.length)];
      setFortune(f);
      setStage('result');
    }});

    // Shake animation
    tl.to(tubeRef.current, { rotation: 5, duration: 0.08, yoyo: true, repeat: 8, ease: 'power1.inOut' })
      .to(tubeRef.current, { rotation: 0, duration: 0.1 });

    // Stick drops
    tl.fromTo(stickRef.current || {}, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'bounce.out' }, '-=0.1');
  };

  const reset = () => { setStage('idle'); setFortune(null); };

  return (
    <div className="min-h-screen bg-ink pt-20 md:pt-28 flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <h1 className="font-serif text-display-l text-mist mb-2">儒意锦囊</h1>
        <p className="text-body text-stone mb-12">求取一份儒意</p>

        {/* Bamboo tube */}
        <div className="relative flex flex-col items-center mb-12">
          <div ref={tubeRef} className="relative cursor-pointer" onClick={drawFortune}>
            <svg width="80" height="220" viewBox="0 0 80 220" fill="none" className={stage === 'shaking' ? '' : 'hover:opacity-80 transition-opacity'}>
              <rect x="15" y="20" width="50" height="180" rx="10" fill="#8B7355" stroke="#6B5335" strokeWidth="2" />
              <rect x="20" y="10" width="40" height="20" rx="5" fill="#6B5335" />
              <line x1="25" y1="60" x2="55" y2="60" stroke="#6B5335" strokeWidth="1" />
              <line x1="25" y1="100" x2="55" y2="100" stroke="#6B5335" strokeWidth="1" />
              <line x1="25" y1="140" x2="55" y2="140" stroke="#6B5335" strokeWidth="1" />
            </svg>
            {stage === 'idle' && (
              <p className="text-caption-s text-stone mt-3 select-none">点击竹筒 · 求取箴言</p>
            )}
          </div>

          {/* Stick */}
          {stage !== 'idle' && (
            <div ref={stickRef} className="absolute top-0 left-1/2 -translate-x-1/2" style={{ zIndex: 10 }}>
              <svg width="12" height="180" viewBox="0 0 12 180">
                <rect x="2" y="0" width="8" height="180" rx="4" fill="#E8D5B0" stroke="#C4A882" strokeWidth="0.5" />
              </svg>
            </div>
          )}
        </div>

        {/* Result */}
        {stage === 'result' && fortune && (
          <div className="animate-page-enter space-y-8">
            <div className="p-8 border border-[rgba(245,242,235,0.1)] bg-ink-light">
              <p className="font-serif text-display-m text-gold mb-2">{fortune.quote}</p>
              <p className="text-caption text-stone">{fortune.source}</p>
            </div>

            <div>
              <p className="text-overline text-stone mb-4">此意可藏</p>
              <div className="grid grid-cols-2 gap-4">
                {fortune.recs.map(slug => {
                  const p = recProducts[slug];
                  return p ? (
                    <Link key={slug} to={`/collection/${slug}`}
                      className="text-left border border-[rgba(245,242,235,0.06)] p-4 hover:border-mist/20 transition-colors group">
                      <img src={p.image} alt={p.name} className="w-full aspect-square object-cover mb-3 border border-[rgba(245,242,235,0.06)]" />
                      <p className="text-caption text-mist group-hover:text-cinnabar transition-colors">{p.name}</p>
                      <p className="text-caption-s text-stone">¥{p.price}</p>
                    </Link>
                  ) : null;
                })}
              </div>
            </div>

            <button onClick={reset} className="font-sans text-caption-s text-stone hover:text-mist transition-colors uppercase">
              再求一次
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
