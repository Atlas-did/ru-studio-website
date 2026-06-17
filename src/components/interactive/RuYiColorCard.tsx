/**
 * RuYiColorCard — 儒意色卡
 * 5种儒家色彩 + 心境词选择 → 组合成色卡
 */
import { useState, useRef } from 'react';
import gsap from 'gsap';

const pigments = [
  { name: '朱砂', nameEn: 'CINNABAR', color: '#8B1A1A', verse: '君子不以绀緅饰', source: '《论语·乡党》' },
  { name: '石青', nameEn: 'AZURITE', color: '#3B4D63', verse: '青，取之于蓝而青于蓝', source: '《荀子·劝学》' },
  { name: '藤黄', nameEn: 'GAMBOGE', color: '#9C8458', verse: '黄中通理，正位居体', source: '《周易·坤卦》' },
  { name: '墨色', nameEn: 'INK', color: '#0A0A0A', verse: '近朱者赤，近墨者黑', source: '《太子少傅箴》' },
  { name: '赭石', nameEn: 'OCHRE', color: '#8B4513', verse: '如切如磋，如琢如磨', source: '《诗经·卫风》' },
];

const moods = ['静', '敬', '诚', '和', '思'];

export default function RuYiColorCard() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectMood = (mood: string) => {
    setSelectedMood(mood);
    // Animate cards flying in
    cardRefs.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(el, { opacity: 0, y: 60, rotateZ: -10 + i * 5 }, { opacity: 1, y: 0, rotateZ: 0, duration: 0.6, delay: i * 0.1, ease: 'back.out(1.7)' });
      }
    });
  };

  const toggleFlip = (name: string) => {
    setFlipped(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="min-h-screen bg-ink pt-20 px-6 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-serif text-display-l text-mist mb-2">儒意色卡</h1>
        <p className="text-body text-stone mb-8">五色入心，字字有典</p>

        {/* Mood selector */}
        {!selectedMood ? (
          <div>
            <p className="text-body text-stone mb-6">选择一个心境词</p>
            <div className="flex justify-center gap-6">
              {moods.map(m => (
                <button key={m} onClick={() => selectMood(m)}
                  className="font-serif text-display-m text-stone hover:text-mist transition-colors group">
                  {m}
                  <div className="h-px bg-cinnabar scale-x-0 group-hover:scale-x-100 transition-transform duration-300 mt-1" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Selected mood */}
            <div className="mb-12">
              <span className="text-overline text-stone">心境</span>
              <p className="font-serif text-display-xl text-gold mt-2">{selectedMood}</p>
              <button onClick={() => setSelectedMood(null)} className="text-caption-s text-stone/50 hover:text-stone mt-4 transition-colors">重新选择</button>
            </div>

            {/* Color cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {pigments.map((p, i) => (
                <div key={p.name} ref={el => { cardRefs.current[i] = el; }}
                  onClick={() => toggleFlip(p.name)}
                  className="relative cursor-pointer perspective-800"
                  style={{ minHeight: 260 }}>
                  <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${flipped[p.name] ? 'rotate-y-180' : ''}`}
                    style={{ transform: flipped[p.name] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 border border-[rgba(245,242,235,0.08)]"
                      style={{ backgroundColor: p.color, backfaceVisibility: 'hidden' }}>
                      <span className="font-serif text-display-m text-mist mb-2">{p.name}</span>
                      <span className="text-caption-s text-mist/60">{p.nameEn}</span>
                      <span className="text-caption-s text-mist/30 mt-4">点击翻转</span>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 border border-[rgba(245,242,235,0.2)] bg-ink"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <p className="font-serif text-body text-mist italic leading-relaxed">"{p.verse}"</p>
                      <p className="text-caption-s text-stone mt-4">{p.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Export hint */}
            <p className="text-caption-s text-stone/30 mt-12">📸 截图保存色卡，分享到小红书</p>
          </>
        )}
      </div>
    </div>
  );
}
