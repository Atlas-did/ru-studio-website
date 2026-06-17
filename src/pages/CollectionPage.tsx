import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const filters = ['全部', '文房', '茶事', '服饰', '礼赠'];

const fallbackProducts = [
  { slug:'bronze-bookmark',name:'论语书签',category:'文房',price:188,proverb:'君子和而不同',limit_edition:'谷雨限定',image_url:'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800' },
  { slug:'ru-ware-cup',name:'汝窑茶盏',category:'茶事',price:128,proverb:'温故而知新',limit_edition:'春分限定',image_url:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800' },
  { slug:'sandalwood-holder',name:'檀香插',category:'礼赠',price:88,proverb:'德不孤必有邻',limit_edition:'冬至限定',image_url:'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800' },
  { slug:'ru-paperweight',name:'儒意镇纸',category:'文房',price:268,proverb:'大学之道在明明德',limit_edition:'立夏限定',image_url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800' },
  { slug:'canvas-tote',name:'帆布袋',category:'服饰',price:68,proverb:'己所不欲勿施于人',image_url:'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800' },
  { slug:'handbound-notebook',name:'手抄笔记本',category:'文房',price:58,proverb:'学而时习之',image_url:'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800' },
];

export default function CollectionPage() {
  const [activeFilter, setActiveFilter] = useState('全部');
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const items: any[] = fallbackProducts;
  const filtered: any[] = activeFilter === '全部' ? items : items.filter((i: any) => i.category === activeFilter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const hItems = headerRef.current?.querySelectorAll('.reveal-item') || [];
      const gItems = gridRef.current?.querySelectorAll('.product-card') || [];
      gsap.from(hItems, { opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: headerRef.current, start: 'top 80%' } });
      gsap.from(gItems, { opacity: 0, y: 40, duration: 0.7, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: gridRef.current, start: 'top 85%' } });
    });
    return () => ctx.revert();
  }, [filtered]);

  return (
    <div className="min-h-screen bg-ink pt-20 md:pt-28">
      <div ref={headerRef} className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <span className="reveal-item block text-overline text-stone mb-4">CURATED COLLECTION</span>
          <h1 className="reveal-item font-serif text-display-l text-mist mt-2 mb-4">儒意典藏</h1>
          <p className="reveal-item text-body text-stone max-w-2xl leading-relaxed">
            向历史借灵感，为当代造美物。每一件器物，都是一次与儒家美学的对话。
          </p>
        </div>
      </div>

      <div className="px-6 md:px-12 pb-8">
        <div className="max-w-[1440px] mx-auto flex flex-wrap gap-3">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`text-caption-s font-sans px-4 py-2 border transition-all duration-300 ${
                activeFilter === f ? 'bg-cinnabar text-mist border-cinnabar' : 'text-stone border-[rgba(245,242,235,0.1)] hover:text-mist hover:border-mist/30'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      <div ref={gridRef} className="px-6 md:px-12 pb-24 md:pb-40">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((item: any) => (
            <Link key={item.slug} to={`/collection/${item.slug}`} className="product-card group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-ink-light border border-[rgba(245,242,235,0.06)]">
                <img src={item.image_url || item.cover?.url} alt={item.name || item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-500 flex items-center justify-center">
                  <span className="text-overline text-mist border border-mist/60 px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">了解此意</span>
                </div>
                {item.limit_edition && (
                  <div className="absolute top-3 left-3">
                    <span className="text-caption-s text-cinnabar bg-ink/80 px-2 py-1">{item.limit_edition}</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="font-serif text-h2 text-mist group-hover:text-cinnabar transition-colors duration-300">{item.name || item.title}</h3>
                {item.proverb && <p className="mt-1 text-caption text-stone italic">"{item.proverb}"</p>}
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-serif text-h2 text-mist">¥{item.price}</span>
                  <span className="text-caption-s text-stone/60">{item.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
