/**
 * ImageZoomViewer — 交互式图片放大镜
 * 参考: Aesop / Gucci 产品页 zoom 交互
 * 行为: 鼠标进入图片区域时显示放大视窗，移动鼠标浏览细节
 */
import { useRef, useState, useCallback } from 'react';

interface ImageZoomViewerProps {
  src: string;
  alt: string;
  zoomScale?: number;
  className?: string;
}

export default function ImageZoomViewer({
  src,
  alt,
  zoomScale = 2.5,
  className = '',
}: ImageZoomViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setPosition({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      });
    },
    []
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = (touch.clientY - rect.top) / rect.height;
      setPosition({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      });
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 放大镜偏移百分比
  const bgPosX = position.x * 100;
  const bgPosY = position.y * 100;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => {
        setIsZoomed(false);
        setIsDragging(false);
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-cursor="view"
    >
      {/* 基础图片 */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300"
        style={{
          transform: isZoomed ? `scale(${1.05})` : 'scale(1)',
        }}
      />

      {/* 暗化遮罩（hover时） */}
      <div
        className="absolute inset-0 bg-ink/0 transition-colors duration-300 pointer-events-none"
        style={{
          backgroundColor: isZoomed ? 'rgba(10,10,10,0.15)' : 'transparent',
        }}
      />

      {/* 放大镜视窗（仅桌面端hover时显示） */}
      {isZoomed && (
        <div
          className="absolute pointer-events-none hidden md:block"
          style={{
            width: 160,
            height: 160,
            left: `calc(${bgPosX}% - 80px)`,
            top: `calc(${bgPosY}% - 80px)`,
            borderRadius: '50%',
            border: '1px solid rgba(245,242,235,0.2)',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoomScale * 100}%`,
              backgroundPosition: `${bgPosX}% ${bgPosY}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}

      {/* 全屏放大层（移动端/点击展开模式） */}
      {isZoomed && (
        <div
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: `${zoomScale * 100}%`,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* 提示文字 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-caption-s text-mist/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none font-sans tracking-overline">
        移动浏览细节
      </div>
    </div>
  );
}
