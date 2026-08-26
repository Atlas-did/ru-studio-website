/**
 * InkParticleCanvas — 水墨粒子交互背景
 * Canvas 2D 粒子系统：鼠标划过产生墨滴晕散与拖尾。
 *
 * 性能优化（卡顿来源）：
 * 1. 宽高只在 resize 时测量，动画循环内不再调 getBoundingClientRect（强制布局）；
 * 2. 径向渐变预渲染成 offscreen 精灵图，逐粒子 drawImage，不再每帧 createRadialGradient；
 * 3. IntersectionObserver 监听：画布滚出视口即暂停 rAF，回到视口再恢复；
 * 4. prefers-reduced-motion / 移动端自动减少粒子数。
 */
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  colorIndex: number;
}

interface InkParticleCanvasProps {
  className?: string;
  /** Base particle count; auto-scaled down on small screens / reduced motion */
  particleCount?: number;
  interactionRadius?: number;
  colorPalette?: string[];
}

const DEFAULT_COLORS = [
  'rgba(166, 45, 45,',   // cinnabar light
  'rgba(156, 132, 88,',  // gold
  'rgba(138, 133, 128,', // stone
  'rgba(232, 228, 220,', // paper
];

export default function InkParticleCanvas({
  className = '',
  particleCount = 28,
  interactionRadius = 160,
  colorPalette = DEFAULT_COLORS,
}: InkParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isSmallScreen = window.innerWidth < 768;
    const count = Math.max(10, Math.floor(particleCount * (isSmallScreen ? 0.4 : 1)));
    const particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let frame = 0;
    let dprScale = 1;
    let width = 0;
    let height = 0;

    // 预渲染每个颜色的柔边圆精灵，动画内只做 drawImage（快得多）
    const spriteSize = 64;
    const sprites = colorPalette.map((base) => {
      const c = document.createElement('canvas');
      c.width = c.height = spriteSize;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(
        spriteSize / 2, spriteSize / 2, 0,
        spriteSize / 2, spriteSize / 2, spriteSize / 2
      );
      grad.addColorStop(0, `${base}0.9)`);
      grad.addColorStop(0.5, `${base}0.35)`);
      grad.addColorStop(1, `${base}0)`);
      g.fillStyle = grad;
      g.fillRect(0, 0, spriteSize, spriteSize);
      return c;
    });

    const createParticle = (atMouse = false): Particle => {
      const life = 200 + Math.random() * 300;
      const colorIndex = Math.floor(Math.random() * colorPalette.length);
      if (atMouse && mouse.active) {
        return {
          x: mouse.x + (Math.random() - 0.5) * 30,
          y: mouse.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: 2 + Math.random() * 8,
          alpha: 0.12 + Math.random() * 0.3,
          life,
          maxLife: life,
          colorIndex,
        };
      }
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.08,
        radius: 5 + Math.random() * 20,
        alpha: 0.03 + Math.random() * 0.08,
        life,
        maxLife: life,
        colorIndex,
      };
    };

    const resize = () => {
      dprScale = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dprScale));
      canvas.height = Math.max(1, Math.round(height * dprScale));
      ctx.setTransform(dprScale, 0, 0, dprScale, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) particles.push(createParticle());

    // Track pointer at window level so overlay content never blocks interaction
    const handleMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= width && mouse.y <= height;
    };
    const handleLeaveWindow = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseout', handleLeaveWindow);

    let rafId = 0;
    let running = true;

    const animate = () => {
      if (!running) return;
      rafId = requestAnimationFrame(animate);
      frame++;

      // Translucent clear → trailing ink wash
      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
      ctx.fillRect(0, 0, width, height);

      if (mouse.active && frame % 5 === 0 && particles.length < count + 24) {
        particles.push(createParticle(true));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < interactionRadius && dist > 0) {
            const force = (interactionRadius - dist) / interactionRadius;
            p.vx += (dx / dist) * force * 0.3;
            p.vy += (dy / dist) * force * 0.3;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        const lifeRatio = p.life / p.maxLife;
        const alpha = p.alpha * lifeRatio * lifeRatio;
        const sprite = sprites[p.colorIndex];
        const r = p.radius * 2;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - r / 2, p.y - r / 2, r, r);
      }
      ctx.globalAlpha = 1;

      while (particles.length < count) {
        particles.push(createParticle());
      }
    };

    // 画布离开视口就暂停动画，避免首页滚走后还空跑 60fps 拖累滚动
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((en) => en.isIntersecting);
          if (visible && !running) {
            running = true;
            rafId = requestAnimationFrame(animate);
          } else if (!visible && running) {
            running = false;
            cancelAnimationFrame(rafId);
          }
        },
        { threshold: 0.02 }
      );
      observer.observe(canvas);
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseout', handleLeaveWindow);
    };
  }, [particleCount, interactionRadius, colorPalette]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen', opacity: 0.6 }}
    />
  );
}
