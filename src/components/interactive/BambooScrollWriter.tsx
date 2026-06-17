/**
 * BambooScrollWriter — 竹简书写
 * Canvas 手写板，背景竹简纹理，速度感知笔触（快→飞白，慢→墨浓）
 * 技术: Canvas 2D + GSAP
 */
import { useRef, useEffect, useState } from 'react';

interface Point { x: number; y: number; time: number }

const INKS = { '浓墨': '#1a1a1a', '淡墨': '#555555', '焦墨': '#0a0a0a', '渴墨': '#999999' };
const BRUSHES = { '小': 2, '中': 4, '大': 8 };

export default function BambooScrollWriter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ink, setInk] = useState<keyof typeof INKS>('浓墨');
  const [brush, setBrush] = useState<keyof typeof BRUSHES>('中');
  const [seal, setSeal] = useState('');
  const pointsRef = useRef<Point[]>([]);
  const sealInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      drawBackground(ctx, rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, []);

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Bamboo color background
    ctx.fillStyle = '#E8E4DC';
    ctx.fillRect(0, 0, w, h);
    // Bamboo joint lines
    ctx.strokeStyle = 'rgba(139,115,85,0.15)';
    ctx.lineWidth = 1;
    for (let y = 80; y < h; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    // Subtle grain
    ctx.fillStyle = 'rgba(139,115,85,0.03)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * w;
      const bw = 0.5 + Math.random() * 3;
      ctx.fillRect(x, 0, bw, h);
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
    if (clientX === undefined || clientY === undefined) return null;
    return { x: clientX - rect.left, y: clientY - rect.top, time: Date.now() };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const p = getPos(e);
    if (!p) return;
    setIsDrawing(true);
    pointsRef.current = [p];
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const p = getPos(e);
    if (!p) return;
    pointsRef.current.push(p);
    if (pointsRef.current.length < 2) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prev = pointsRef.current[pointsRef.current.length - 2];
    const speed = Math.hypot(p.x - prev.x, p.y - prev.y) / Math.max(1, (p.time - prev.time));
    const baseWidth = BRUSHES[brush];
    // Speed-aware: fast → thin stroke (飞白), slow → thick (浓墨)
    const strokeWidth = Math.max(0.5, baseWidth - speed * 2);

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = INKS[ink];
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.7 + (1 - speed) * 0.3; // slower = more opaque
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    pointsRef.current = [];
  };

  const addSeal = () => {
    if (!seal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = rect.width - 80;
    const y = rect.height - 80;

    // Red seal box
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(x, y, 60, 60);
    ctx.fillStyle = '#E8E4DC';
    ctx.font = 'bold 16px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(seal.slice(0, 2), x + 30, y + 38);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = '儒意手札.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-ink min-h-screen pt-20 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-display-l text-mist mb-2">竹简书写</h1>
        <p className="text-body text-stone mb-8">挥毫落纸，墨迹随心</p>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-caption-s text-stone">墨色</span>
            {Object.keys(INKS).map(c => (
              <button key={c} onClick={() => setInk(c as keyof typeof INKS)}
                className={`text-caption-s px-2 py-1 border transition-all ${ink === c ? 'bg-ink text-mist border-ink' : 'text-stone border-[rgba(245,242,235,0.1)]'}`}>{c}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption-s text-stone">笔刷</span>
            {Object.keys(BRUSHES).map(b => (
              <button key={b} onClick={() => setBrush(b as keyof typeof BRUSHES)}
                className={`text-caption-s px-2 py-1 border transition-all ${brush === b ? 'bg-ink text-mist border-ink' : 'text-stone border-[rgba(245,242,235,0.1)]'}`}>{b}</button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative border border-[rgba(245,242,235,0.08)] mb-6" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: '600px' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Seal + Export */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <input ref={sealInputRef} type="text" value={seal} onChange={e => setSeal(e.target.value)}
              placeholder="印章文字" maxLength={2}
              className="w-24 bg-transparent border-b border-[rgba(245,242,235,0.2)] py-1 font-serif text-caption text-mist placeholder:text-stone/40 focus:outline-none focus:border-cinnabar text-center" />
            <button onClick={addSeal} className="text-caption-s text-mist bg-cinnabar px-3 py-1.5 hover:bg-cinnabar-light transition-colors uppercase">钤印</button>
          </div>
          <button onClick={exportImage} className="text-caption-s text-stone border border-[rgba(245,242,235,0.2)] px-3 py-1.5 hover:border-mist/40 transition-colors uppercase">导出图片</button>
        </div>
      </div>
    </div>
  );
}
