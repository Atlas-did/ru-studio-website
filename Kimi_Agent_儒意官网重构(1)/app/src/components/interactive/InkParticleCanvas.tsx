/**
 * InkParticleCanvas — 水墨粒子交互背景
 * 参考: 故宫"纹以载道"沉浸式数字体验
 * 行为: Canvas 2D 粒子系统，鼠标交互产生水墨晕染效果
 * 技术: Canvas 2D + requestAnimationFrame，无需WebGL
 */
import { useEffect, useRef, useCallback } from 'react';

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
  particleCount?: number;
  interactionRadius?: number;
  colorPalette?: string[];
}

const DEFAULT_COLORS = [
  'rgba(139, 26, 26,',   // cinnabar
  'rgba(156, 132, 88,',  // gold
  'rgba(138, 133, 128,', // stone
  'rgba(232, 228, 220,', // paper
];

export default function InkParticleCanvas({
  className = '',
  particleCount = 40,
  interactionRadius = 150,
  colorPalette = DEFAULT_COLORS,
}: InkParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const createParticle = useCallback(
    (canvasWidth: number, canvasHeight: number, atMouse = false): Particle => {
      const colorBase = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const life = 200 + Math.random() * 300;

      if (atMouse && mouseRef.current.active) {
        return {
          x: mouseRef.current.x + (Math.random() - 0.5) * 30,
          y: mouseRef.current.y + (Math.random() - 0.5) * 30,
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
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1, // 轻微上浮
        radius: 5 + Math.random() * 20,
        alpha: 0.03 + Math.random() * 0.08,
        life,
        maxLife: life,
        color: colorBase,
      };
    },
    [colorPalette]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 初始化粒子
    const rect = canvas.getBoundingClientRect();
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(rect.width, rect.height)
    );

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 动画循环
    const animate = () => {
      frameCountRef.current++;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // 半透明清除（拖尾效果）
      ctx.fillStyle = 'rgba(10, 10, 10, 0.08)';
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // 鼠标交互产生新粒子（限制频率）
      if (mouse.active && frameCountRef.current % 5 === 0) {
        particles.push(createParticle(w, h, true));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;

        if (p.life <= 0) {
          particles.splice(i, 1);
          particles.push(createParticle(w, h));
          continue;
        }

        // 鼠标排斥力
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

        // 应用速度
        p.x += p.vx;
        p.y += p.vy;

        // 阻尼
        p.vx *= 0.98;
        p.vy *= 0.98;

        // 边界环绕
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;

        // 绘制水墨粒子（柔和圆形渐变）
        const lifeRatio = p.life / p.maxLife;
        const alpha = p.alpha * lifeRatio * lifeRatio; // 两端淡入淡出

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `${p.color}${alpha})`);
        gradient.addColorStop(0.5, `${p.color}${alpha * 0.3})`);
        gradient.addColorStop(1, `${p.color}0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 保持粒子数量稳定
      while (particles.length < particleCount) {
        particles.push(createParticle(w, h));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount, interactionRadius, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ mixBlendMode: 'screen', opacity: 0.6 }}
    />
  );
}
