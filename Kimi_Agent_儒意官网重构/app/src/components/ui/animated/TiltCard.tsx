import { useRef, useCallback } from 'react';
import gsap from 'gsap';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
  scale?: number;
}

export function TiltCard({ children, className = '', tiltAmount = 8, scale = 1.02 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = (-mouseY / (rect.height / 2)) * tiltAmount;
      const rotateY = (mouseX / (rect.width / 2)) * tiltAmount;

      gsap.to(card, {
        rotateX,
        rotateY,
        scale,
        duration: 0.4,
        ease: 'power2.out',
      });
    },
    [tiltAmount, scale]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`perspective-1200 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="preserve-3d will-change-transform">
        {children}
      </div>
    </div>
  );
}
