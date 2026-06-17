import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

type Role = '师长' | '友人' | '同侪' | '晚辈' | null;

const giftSets: Record<string, { name: string; items: { name: string; price: number }[]; total: number }> = {
  '师长': { name: '师礼', items: [{ name: '儒意镇纸', price: 268 }, { name: '手抄笔记本', price: 58 }, { name: '锦盒包装', price: 30 }], total: 356 },
  '友人': { name: '友礼', items: [{ name: '汝窑茶盏', price: 128 }, { name: '檀香插', price: 88 }, { name: '素笺包装', price: 0 }], total: 216 },
  '同侪': { name: '同侪礼', items: [{ name: '论语书签', price: 188 }, { name: '帆布袋', price: 68 }], total: 256 },
  '晚辈': { name: '晚辈礼', items: [{ name: '论语书签', price: 188 }, { name: '手抄笔记本', price: 58 }], total: 246 },
};

export default function GiftPage() {
  const [role, setRole] = useState<Role>(null);
  const [cardText, setCardText] = useState('');
  const [step, setStep] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current.querySelectorAll('.gift-reveal'), {
        opacity: 0, y: 20, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      });
    }
  }, [step]);

  const roles: Role[] = ['师长', '友人', '同侪', '晚辈'];

  return (
    <div className="min-h-screen bg-ink pt-20 md:pt-28 px-6 py-16">
      <div ref={containerRef} className="max-w-2xl mx-auto">
        <h1 className="gift-reveal font-serif text-display-l text-mist mb-2">以礼相赠</h1>
        <p className="gift-reveal text-body text-stone mb-12">儒家之礼，不在于物，在于心</p>

        {/* Steps indicator */}
        <div className="gift-reveal flex gap-2 mb-12">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded ${s <= step ? 'bg-cinnabar' : 'bg-[rgba(245,242,235,0.08)]'}`} />
          ))}
        </div>

        {/* Step 1: Choose role */}
        {step === 1 && (
          <div className="gift-reveal">
            <p className="text-body text-stone mb-6">选择赠礼对象</p>
            <div className="grid grid-cols-2 gap-4">
              {roles.map(r => (
                <button key={r} onClick={() => { setRole(r as Role); setStep(2); }}
                  className="text-center p-8 border border-[rgba(245,242,235,0.1)] hover:border-cinnabar/40 hover:bg-cinnabar/5 transition-all group">
                  <span className="block text-4xl mb-2">{r === '师长' ? '🎓' : r === '友人' ? '🤝' : r === '同侪' ? '💼' : '🌟'}</span>
                  <span className="font-serif text-h2 text-mist group-hover:text-cinnabar transition-colors">{r}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Gift set */}
        {step === 2 && role && (
          <div className="gift-reveal">
            <p className="text-body text-stone mb-2">为 <span className="text-cinnabar">{role}</span> 推荐的礼组</p>
            <div className="p-6 border border-[rgba(245,242,235,0.1)] bg-ink-light">
              <h3 className="font-serif text-h1 text-mist mb-4">{giftSets[role].name}</h3>
              <div className="space-y-3 mb-6">
                {giftSets[role].items.map(item => (
                  <div key={item.name} className="flex justify-between text-body text-stone">
                    <span>{item.name}</span>
                    <span>¥{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[rgba(245,242,235,0.1)] pt-4 flex justify-between items-center">
                <span className="text-caption text-stone">合计</span>
                <span className="font-serif text-h1 text-mist">¥{giftSets[role].total}</span>
              </div>
            </div>
            <button onClick={() => setStep(3)} className="mt-6 w-full font-sans text-caption-s tracking-wide bg-cinnabar text-mist px-8 py-3 hover:bg-cinnabar-light transition-colors uppercase">
              继续写贺卡
            </button>
            <button onClick={() => setStep(1)} className="mt-3 w-full text-caption-s text-stone hover:text-mist transition-colors">← 重新选择</button>
          </div>
        )}

        {/* Step 3: Write card */}
        {step === 3 && (
          <div className="gift-reveal">
            <p className="text-body text-stone mb-4">写一张贺卡</p>
            <textarea value={cardText} onChange={e => setCardText(e.target.value)}
              placeholder="写下你想说的话..."
              rows={5}
              className="w-full bg-transparent border border-[rgba(245,242,235,0.15)] p-4 font-serif text-body text-mist placeholder:text-stone/40 focus:outline-none focus:border-cinnabar resize-none" />
            <div className="flex gap-4 mt-6">
              <button onClick={() => { alert('礼单已确认！'); }}
                className="flex-1 font-sans text-caption-s tracking-wide bg-cinnabar text-mist px-8 py-3 hover:bg-cinnabar-light transition-colors uppercase">
                确认礼单
              </button>
              <button onClick={() => setStep(2)} className="text-caption-s text-stone hover:text-mist transition-colors">← 返回</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
