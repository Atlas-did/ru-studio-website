/**
 * RubbingReveal — 拓片体验
 * Canvas 石碑，鼠标变成拓包，移动时文字逐渐显现
 * 全部显现后显示完整《论语》句子
 */
import { useRef, useEffect, useState, useCallback } from 'react';

const STONE_TEXT = '学而不思则罔 思而不学则殆';
const REVEAL_RADIUS = 35;

export default function RubbingReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealPct, setRevealPct] = useState(0);
  const [complete, setComplete] = useState(false);
  const revealedRef = useRef<Set<string>>(new Set());

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
      renderStone(ctx, rect.width, rect.height);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [complete]);

  const renderStone = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Stone texture background
    ctx.fillStyle = '#2C2C2C';
    ctx.fillRect(0, 0, w, h);
    // Stone grain
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.05)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 8, 1 + Math.random() * 2);
    }

    if (!complete) {
      // Hidden text (very faint, almost invisible)
      ctx.fillStyle = 'rgba(245,242,235,0.04)';
      ctx.font = 'bold clamp(24px, 4vw, 48px) "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(STONE_TEXT, w / 2, h / 2);
    } else {
      // Revealed text (full brightness)
      ctx.fillStyle = '#E8E4DC';
      ctx.font = 'bold clamp(24px, 4vw, 48px) "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(STONE_TEXT, w / 2, h / 2);

      // Source attribution
      ctx.fillStyle = '#8B1A1A';
      ctx.font = '14px "Noto Serif SC", serif';
      ctx.fillText('——《论语·为政》', w / 2, h / 2 + 60);
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (complete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Reveal by brushing away the stone layer
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, REVEAL_RADIUS, 0, Math.PI * 2);
    ctx.clip();
    renderStone(ctx, rect.width, rect.height);
    // Paint revealed text brighter at brush position
    ctx.fillStyle = 'rgba(245,242,235,0.15)';
    ctx.font = 'bold clamp(24px, 4vw, 48px) "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(STONE_TEXT, rect.width / 2, rect.height / 2);
    ctx.restore();

    // Track progress
    const key = `${Math.round(x / 10)},${Math.round(y / 10)}`;
    revealedRef.current.add(key);
    const pct = Math.min(100, Math.round((revealedRef.current.size / 200) * 100));
    if (pct > 60 && !complete) { setComplete(true); setRevealPct(100); }
    else { setRevealPct(pct); }
  }, [complete]);

  const reset = () => {
    setComplete(false);
    setRevealPct(0);
    revealedRef.current = new Set();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        renderStone(ctx, rect.width, rect.height);
      }
    }
  };

  return (
    <div className="min-h-screen bg-ink pt-20 px-6 py-12 flex flex-col items-center">
      <h1 className="font-serif text-display-l text-mist mb-2">拓片体验</h1>
      <p className="text-body text-stone mb-4">移动鼠标，如拓包轻叩石碑，文字渐显</p>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-[rgba(245,242,235,0.08)] mb-8 rounded">
        <div className="h-full bg-cinnabar rounded transition-all duration-300" style={{ width: `${revealPct}%` }} />
      </div>

      <div className="relative max-w-2xl w-full">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onTouchMove={e => { const t = e.touches[0]; if (t) handleMouseMove({ clientX: t.clientX, clientY: t.clientY } as any); }}
          className="w-full cursor-pointer border border-[rgba(245,242,235,0.08)]"
          style={{ height: '300px' }}
        />
        {!complete && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-caption-s text-stone/40 pointer-events-none">
            移动鼠标拓印 · 已揭示 {revealPct}%
          </div>
        )}
      </div>

      {complete && (
        <div className="mt-8 text-center animate-page-enter">
          <p className="font-serif text-display-m text-gold mb-2">{STONE_TEXT}</p>
          <p className="text-caption-s text-stone mb-4">——《论语·为政》</p>
          <button onClick={reset} className="text-caption-s text-stone/50 hover:text-stone transition-colors">重新拓印</button>
        </div>
      )}
    </div>
  );
}
