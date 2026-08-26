/**
 * InkParticleCanvas — 水墨粒子交互背景
 * Canvas 2D 粒子系统：鼠标划过产生墨滴晕散与拖尾。
 * 降级：prefers-reduced-motion 或移动端自动减少粒子数；不可用时静默隐藏。
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
  color: string;
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
  particleCount = 40,
  interactionRadius = 160,
  colorPalette = DEFAULT_COLORS,
}: InkParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isSmallScreen = window.innerWidth < 768;
    const count = Math.max(12, Math.floor(particleCount * (isSmallScreen ? 0.4 : 1)));
    const particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let frame = 0;
    let dprScale = 1;

    const createParticle = (w: number, h: number, atMouse = false): Particle => {
      const colorBase = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const life = 200 + Math.random() * 300;
      if (atMouse && mouse.active) {
        return {
          x: mouse.x + (Math.random() - 0.5) * 30,
          y: mouse.y + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: 2 + Math.random() * 8,
          alpha: 0.1 + Math.random() * 0.3,
          life,
          maxLife: life,
          color: colorBase,
        };
      }
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.08,
        radius: 5 + Math.random() * 20,
        alpha: 0.03 + Math.random() * 0.08,
        life,
        maxLife: life,
        color: colorBase,
      };
    };

    const resize = () => {
      // setTransform avoids cumulative scale bug on repeated resizes
      dprScale = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dprScale));
      canvas.height = Math.max(1, Math.round(rect.height * dprScale));
      ctx.setTransform(dprScale, 0, 0, dprScale, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const rect0 = canvas.getBoundingClientRect();
    for (let i = 0; i < count; i++) particles.push(createParticle(rect0.width, rect0.height));

    // Track pointer at window level so overlay content never blocks interaction
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active =
        mouse.x >= 0 && mouse.y >= 0 && mouse.x <= rect.width && mouse.y <= rect.height;
    };
    const handleLeaveWindow = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseout', handleLeaveWindow);

    const animate = () => {
      frame++;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      // Translucent clear → trailing ink wash
      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
      ctx.fillRect(0, 0, w, h);

      if (mouse.active && frame % 5 === 0 && particles.length < count + 30) {
        particles.push(createParticle(w, h, true));
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

        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        const lifeRatio = p.life / p.maxLife;
        const alpha = p.alpha * lifeRatio * lifeRatio;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `${p.color}${alpha})`);
        gradient.addColorStop(0.5, `${p.color}${alpha * 0.3})`);
        gradient.addColorStop(1, `${p.color}0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      while (particles.length < count) {
        particles.push(createParticle(w, h));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
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
