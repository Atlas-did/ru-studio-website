import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DraggableGallery from '@/components/interactive/DraggableGallery';
import Model3DViewer from '@/components/interactive/Model3DViewer';

gsap.registerPlugin(ScrollTrigger);

interface ProductDetail {
  slug: string; name: string; name_en?: string; price: number; category: string;
  stock?: number; limit_edition?: string; season?: string; description?: string;
  proverb?: string; inspiration?: string; craft?: string; usage?: string;
  image_url: string; model_url?: string; video_url?: string;
}

const fallbackItem: ProductDetail = {
  slug: 'bronze-bookmark', name: '论语书签', name_en: 'Bronze Bookmark', price: 188, category: '文房',
  limit_edition: '谷雨限定 · 余 47 件', description: '青铜材质复刻竹简形制，表面镌刻微缩《论语》章句，在光影流转间呈现出古籍翻阅的视觉效果。',
  proverb: '君子和而不同', inspiration: '《论语·子路》——子曰：君子和而不同，小人同而不和。', craft: '青铜蚀刻工艺，手工打磨做旧，每枚书签纹理独一无二。',
  usage: '案头伴读，随手翻阅时夹入书中，亦可作为雅致信物赠予师友。',
  image_url: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800',
  model_url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
};

export default function CollectionDetailPage() {
  const { slug: _slug } = useParams<{ slug: string }>();
  void _slug; // In production, fetch by slug
  const item = fallbackItem;

  const [customText, setCustomText] = useState('');
  const [customEnabled, setCustomEnabled] = useState(false);
  const [packageType, setPackageType] = useState('素笺');
  const [showOrder, setShowOrder] = useState(false);

  const packages: Record<string, number> = { '素笺': 0, '锦盒': 30, '竹筒': 50 };
  const totalPrice = item.price + (customEnabled ? 20 : 0) + (packages[packageType] || 0);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current?.querySelectorAll('.reveal-item') || [], {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
      });
    });
    return () => ctx.revert();
  }, []);

  const galleryImages = [
    { src: item.image_url, alt: item.name, caption: '封面' },
    { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', alt: '细节一', caption: '细节 I' },
    { src: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800', alt: '细节二', caption: '细节 II' },
  ];

  return (
    <div className="min-h-screen bg-ink pt-20 md:pt-28">
      {/* Hero */}
      <div ref={headerRef} className="px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <Link to="/collection" className="reveal-item text-overline text-stone hover:text-cinnabar transition-colors">← 儒意典藏</Link>
          <div className="flex flex-col md:flex-row md:items-start gap-6 mt-8">
            <div className="md:w-1/2 shrink-0">
              <div className="relative aspect-[4/5] overflow-hidden border border-[rgba(245,242,235,0.08)]">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1">
              {item.limit_edition && <span className="reveal-item block text-caption-s text-cinnabar mb-3">{item.limit_edition}</span>}
              <h1 className="reveal-item font-serif text-display-l text-mist leading-tight mb-2">{item.name}</h1>
              {item.proverb && <p className="reveal-item font-serif text-body-l text-stone italic mb-4">"{item.proverb}"</p>}
              <p className="reveal-item text-body text-stone/70 leading-relaxed mb-6">{item.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="px-6 md:px-12 py-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <span className="text-overline text-stone mb-6 block">GALLERY · 拖拽浏览</span>
          <DraggableGallery images={galleryImages} itemWidth={70} gap={16} />
        </div>
      </div>

      {/* 此意何来 */}
      <div className="px-6 md:px-12 py-12 md:py-20 border-t border-[rgba(245,242,235,0.06)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-display-m text-mist mb-8">此意何来</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-overline text-cinnabar mb-3 block">灵感来源</span>
              <p className="text-body text-stone leading-relaxed">{item.inspiration || '儒家经典中的智慧，跨越千年，依然照亮今日的生活。'}</p>
            </div>
            <div>
              <span className="text-overline text-cinnabar mb-3 block">工艺材质</span>
              <p className="text-body text-stone leading-relaxed">{item.craft || '匠人以心手相传的技艺，将文化融入每一件器物之中。'}</p>
            </div>
            <div>
              <span className="text-overline text-cinnabar mb-3 block">使用场景</span>
              <p className="text-body text-stone leading-relaxed">{item.usage || '在日常生活的一隅，感受文化传承的温度。'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Model Viewer */}
      {item.model_url && (
        <div className="px-6 md:px-12 py-8 md:py-16 border-t border-[rgba(245,242,235,0.06)]">
          <div className="max-w-5xl mx-auto">
            <span className="text-overline text-stone mb-4 block">3D 预览 · 拖拽旋转 · 滚轮缩放</span>
            <Model3DViewer modelUrl={item.model_url} height="450px" />
          </div>
        </div>
      )}

      {/* 定制入手 */}
      <div className="px-6 md:px-12 py-12 md:py-20 border-t border-[rgba(245,242,235,0.06)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-display-m text-mist mb-2">定制入手</h2>
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-serif text-display-m text-mist">¥ {totalPrice}</span>
            {item.limit_edition && <span className="text-caption-s text-cinnabar">{item.limit_edition}</span>}
          </div>

          {!showOrder ? (
            <div className="flex gap-4">
              <button onClick={() => setShowOrder(true)} className="font-sans text-caption-s tracking-wide bg-cinnabar text-mist px-8 py-3 hover:bg-cinnabar-light transition-colors uppercase">
                定制入手
              </button>
              <Link to="/gift" className="font-sans text-caption-s tracking-wide border border-cinnabar/40 text-cinnabar px-8 py-3 hover:bg-cinnabar/10 transition-colors uppercase">
                以礼相赠
              </Link>
            </div>
          ) : (
            <div className="space-y-6 p-6 border border-[rgba(245,242,235,0.1)]">
              {/* Custom text */}
              <div>
                <label className="flex items-center gap-3 mb-2">
                  <input type="checkbox" checked={customEnabled} onChange={e => setCustomEnabled(e.target.checked)} className="accent-cinnabar" />
                  <span className="text-caption text-stone">题字定制 (+¥20)</span>
                </label>
                {customEnabled && (
                  <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
                    placeholder="输入2-4字，如「慎独」" maxLength={4}
                    className="w-full bg-transparent border-b border-[rgba(245,242,235,0.2)] py-2 font-serif text-mist placeholder:text-stone/40 focus:outline-none focus:border-cinnabar" />
                )}
              </div>
              {/* Package */}
              <div>
                <span className="text-caption text-stone block mb-2">包装选择</span>
                <div className="flex gap-3">
                  {Object.entries(packages).map(([name, add]) => (
                    <button key={name} onClick={() => setPackageType(name)}
                      className={`text-caption-s font-sans px-4 py-2 border transition-all ${packageType === name ? 'bg-cinnabar text-mist border-cinnabar' : 'text-stone border-[rgba(245,242,235,0.1)] hover:border-mist/30'}`}>
                      {name} {add > 0 ? `+¥${add}` : ''}
                    </button>
                  ))}
                </div>
              </div>
              {/* Total + confirm */}
              <div className="pt-4 border-t border-[rgba(245,242,235,0.1)] flex items-center justify-between">
                <span className="font-serif text-h2 text-mist">合计 ¥{totalPrice}</span>
                <button onClick={() => { alert('已生成订单！请前往管理后台查看。'); setShowOrder(false); }}
                  className="font-sans text-caption-s tracking-wide bg-cinnabar text-mist px-8 py-3 hover:bg-cinnabar-light transition-colors uppercase">
                  确认定制
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
