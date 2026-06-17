/**
 * HeroParallaxLayer — Hero区鼠标视差交互层
 * 参考: Nike / Gucci 沉浸式首屏
 * 行为: 鼠标移动时，多层元素以不同速度偏移，营造3D纵深
 */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ParallaxElement {
  selector: string;
  depth: number; // 1-10, 越大移动越多
  rotateAmount?: number;
}

interface HeroParallaxLayerProps {
  children: React.ReactNode;
  intensity?: number; // 0-1 整体强度
  className?: string;
}

const defaultElements: ParallaxElement[] = [
  { selector: '.parallax-bg', depth: 2 },
  { selector: '.parallax-mid', depth: 5 },
  { selector: '.parallax-front', depth: 8, rotateAmount: 2 },
  { selector: '.parallax-text', depth: 3 },
];

export default function HeroParallaxLayer({
  children,
  intensity = 0.6,
  className = '',
}: HeroParallaxLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) return; // 移动端禁用鼠标视差

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // 归一化到 -0.5 ~ 0.5
      const nx = ((e.clientX - rect.left) / rect.width) - 0.5;
      const ny = ((e.clientY - rect.top) / rect.height) - 0.5;

      defaultElements.forEach(({ selector, depth, rotateAmount }) => {
        const el = container.querySelector(selector) as HTMLElement;
        if (!el) return;

        const moveX = nx * depth * 15 * intensity;
        const moveY = ny * depth * 10 * intensity;
        const rotX = rotateAmount ? -ny * rotateAmount : 0;
        const rotY = rotateAmount ? nx * rotateAmount : 0;

        gsap.to(el, {
          x: moveX,
          y: moveY,
          rotateX: rotX,
          rotateY: rotY,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    };

    const handleMouseLeave = () => {
      defaultElements.forEach(({ selector }) => {
        const el = container.querySelector(selector) as HTMLElement;
        if (!el) return;
        gsap.to(el, {
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 1.2,
          ease: 'power3.out',
        });
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile, intensity]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ perspective: '1200px' }}
    >
      {children}
    </div>
  );
}

/**
 * 使用说明:
 * 在 HeroSection 的子元素上添加 class:
 * - .parallax-bg   → 背景层（移动最少）
 * - .parallax-mid  → 中间层
 * - .parallax-front → 前景层（移动最多，带微旋转）
 * - .parallax-text → 文字层（轻微移动）
 *
 * 示例:
 * <HeroParallaxLayer>
 *   <img className="parallax-bg" ... />
 *   <div className="parallax-front" ... />
 *   <h1 className="parallax-text" ... />
 * </HeroParallaxLayer>
 */
