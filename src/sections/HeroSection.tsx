import { useEffect, useRef, useState } from 'react';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getSiteConfig } from '@/lib/data';

// Simple CRT effect using canvas - lightweight and effective
function CRTEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const speedRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/assets/crt-temple-texture.jpg';
    img.onload = () => {
      imgRef.current = img;
    };

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Track scroll speed
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      speedRef.current = (current - lastScroll) * 0.01;
      lastScroll = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const resize = () => {
      canvas.width = canvas.offsetWidth * Math.min(window.devicePixelRatio, 2);
      canvas.height = canvas.offsetHeight * Math.min(window.devicePixelRatio, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    const draw = (time: number) => {
      frameRef.current = time;
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw base
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      if (imgRef.current) {
        // Speed-based liquid distortion
        const speed = Math.abs(speedRef.current);
        const displace = speed * 15;

        ctx.save();

        // Barrel distortion approximation
        const cx = w / 2;
        const cy = h / 2;
        ctx.translate(cx, cy);
        ctx.scale(1 + displace * 0.002, 1 + displace * 0.002);
        ctx.translate(-cx, -cy);

        // Chromatic aberration — combines scroll speed + mouse position
        const aberration = Math.max(speed * 2, Math.abs(mouseRef.current.x - 0.5) * 3);
        if (aberration > 0.3) {
          const ab = Math.min(aberration, 6);
          // Red channel offset
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(imgRef.current, ab, 0, w, h);
          // Green channel
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(imgRef.current, 0, 0, w, h);
          // Blue channel offset
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(imgRef.current, -ab, 0, w, h);
        } else {
          ctx.drawImage(imgRef.current, 0, 0, w, h);
        }

        ctx.restore();
      } else {
        // Fallback gradient
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        grad.addColorStop(0, '#2a2a2a');
        grad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Scanlines — with subtle flicker
      const flicker = 1 + Math.sin(time * 0.003) * 0.25 + Math.sin(time * 0.007) * 0.15;
      ctx.fillStyle = `rgba(0,0,0,${0.06 * flicker})`;
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }

      // Noise — compute on every other row for performance
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const rowWidth = w * 4;
      for (let y = 0; y < h; y += 2) {
        const rowStart = y * rowWidth;
        for (let x = 0; x < rowWidth; x += 16) {
          const i = rowStart + x;
          if (i + 2 < data.length) {
            const noise = (Math.random() - 0.5) * 10;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Vignette
      const vigGrad = ctx.createRadialGradient(
        w * mouseRef.current.x,
        h * mouseRef.current.y,
        w * 0.2,
        w * 0.5,
        h * 0.5,
        w * 0.7
      );
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      // Mouse blob (subtle darkening)
      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;
      const blobGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
      blobGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
      blobGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = blobGrad;
      ctx.fillRect(0, 0, w, h);

      // Decay speed
      speedRef.current *= 0.95;

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        filter: 'blur(0.3px) brightness(1.05)',
      }}
    />
  );
}

export default function HeroSection() {
  const { data: config } = useSiteData(
    () => api.getSiteConfig(),
    { initialData: getSiteConfig() }
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 3;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
      }
      setProgress(current);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-screen bg-ink overflow-hidden">
      {/* CRT Canvas Effect */}
      <CRTEffect />

      {/* Glass overlay frame */}
      <div
        className="absolute inset-8 md:inset-16 border border-[rgba(168,164,154,0.12)] pointer-events-none"
        style={{ backdropFilter: 'blur(0.5px)' }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto w-full">
          <h1 className="font-display text-[clamp(48px,6vw,88px)] font-light tracking-wide text-mist leading-none">
            儒
          </h1>
          <p className="mt-3 font-display text-[clamp(20px,2vw,32px)] font-light tracking-[0.1em] text-mist/70">
            {config?.brandNameEn}
          </p>
        </div>

        {/* Progress line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-[rgba(168,164,154,0.18)]">
          <div
            className="h-full bg-cinnabar transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
