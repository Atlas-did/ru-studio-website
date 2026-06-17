/**
 * DraggableGallery — 水平拖拽/滚轮 图片画廊
 * 参考: Nike 产品页 horizontal scroll gallery
 * 行为: 鼠标拖拽 / 滚轮滚动 / 触控滑动 / 箭头导航
 */
import { useRef, useState, useEffect, useCallback } from 'react';

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface DraggableGalleryProps {
  images: GalleryImage[];
  className?: string;
  itemWidth?: number; // 百分比 0-100
  gap?: number; // px
}

export default function DraggableGallery({
  images,
  className = '',
  itemWidth = 75, // 默认每张占75%宽度，露出下一张边缘
  gap = 12,
}: DraggableGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [showCursorHint, setShowCursorHint] = useState(true);
  const [wheelLocked, setWheelLocked] = useState(false);

  // 计算当前激活项
  const updateActiveIndex = useCallback(() => {
    if (!containerRef.current) return;
    const scroll = containerRef.current.scrollLeft;
    const containerWidth = containerRef.current.clientWidth;
    const itemTotalWidth = (containerWidth * itemWidth) / 100 + gap;
    const newIndex = Math.round(scroll / itemTotalWidth);
    setActiveIndex(Math.max(0, Math.min(images.length - 1, newIndex)));
  }, [images.length, itemWidth, gap]);

  // 滚轮横向滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (!wheelLocked) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
        updateActiveIndex();
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [updateActiveIndex, wheelLocked]);

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.scrollLeft || 0));
    setShowCursorHint(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 自定义光标位置
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCursorX(e.clientX - rect.left);
    }

    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - startX;
    containerRef.current.scrollLeft = scrollLeft - x;
    updateActiveIndex();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    snapToNearest();
  };

  // 吸附到最近的项
  const snapToNearest = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const itemTotalWidth = (containerWidth * itemWidth) / 100 + gap;
    const nearest = Math.round(containerRef.current.scrollLeft / itemTotalWidth);
    const target = nearest * itemTotalWidth;

    containerRef.current.scrollTo({
      left: target,
      behavior: 'smooth',
    });
    setActiveIndex(Math.max(0, Math.min(images.length - 1, nearest)));
  };

  // 点击圆点跳转
  const goTo = (index: number) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const itemTotalWidth = (containerWidth * itemWidth) / 100 + gap;
    containerRef.current.scrollTo({
      left: index * itemTotalWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
    setShowCursorHint(false);
  };

  // 左右箭头
  const goPrev = () => goTo(Math.max(0, activeIndex - 1));
  const goNext = () => goTo(Math.min(images.length - 1, activeIndex + 1));

  // 自定义拖拽光标
  const cursorLabel = isDragging ? '拖拽中' : '拖拽浏览';

  return (
    <div className={`relative ${className}`} data-cursor="drag">
      {/* 主画廊区域 */}
      <div
        ref={containerRef}
        className="overflow-x-auto scrollbar-hide select-none"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onScroll={updateActiveIndex}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            gap: `${gap}px`,
            paddingRight: `${100 - itemWidth}%`, // 露出最后一张的边缘
          }}
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative overflow-hidden border border-[rgba(245,242,235,0.08)]"
              style={{ width: `${itemWidth}%` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/80 to-transparent">
                  <span className="text-caption-s text-mist/70 font-sans">
                    {img.caption}
                  </span>
                </div>
              )}
              {/* 序号角标 */}
              <div className="absolute top-3 right-3 font-display text-overline text-mist/30">
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 拖拽提示光标（仅在hover时显示） */}
      {!isDragging && showCursorHint && cursorX !== null && (
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none hidden md:block z-10"
          style={{
            left: cursorX - 40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '1px solid rgba(245,242,235,0.15)',
            backgroundColor: 'rgba(10,10,10,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="text-[9px] text-mist/50 font-sans tracking-overline uppercase">
            {cursorLabel}
          </span>
        </div>
      )}

      {/* 导航控制栏 */}
      <div className="flex items-center justify-between mt-6 px-1">
        {/* 箭头按钮 + 锁定切换 */}
        <div className="flex gap-3 items-center">
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="w-10 h-10 border border-[rgba(245,242,235,0.12)] flex items-center justify-center transition-all duration-300 hover:border-mist/30 hover:bg-mist/5 disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="上一张"
          >
            <svg className="w-4 h-4 text-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            disabled={activeIndex === images.length - 1}
            className="w-10 h-10 border border-[rgba(245,242,235,0.12)] flex items-center justify-center transition-all duration-300 hover:border-mist/30 hover:bg-mist/5 disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="下一张"
          >
            <svg className="w-4 h-4 text-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setWheelLocked(!wheelLocked)}
            className={`text-caption-s font-sans px-2 py-1.5 border transition-all duration-300 ${
              wheelLocked
                ? 'text-cinnabar border-cinnabar/40 bg-cinnabar/10'
                : 'text-stone/50 border-[rgba(245,242,235,0.08)] hover:text-stone hover:border-mist/20'
            }`}
            title={wheelLocked ? '已锁定：滚轮控制画廊' : '未锁定：滚轮控制页面'}
          >
            {wheelLocked ? '🔒 滚轮浏览' : '🔓 滚轮翻页'}
          </button>
        </div>

        {/* 进度指示 */}
        <div className="flex items-center gap-4">
          <span className="text-overline text-stone font-sans">
            {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </span>

          {/* 圆点导航 */}
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'bg-cinnabar w-6'
                    : 'bg-mist/20 hover:bg-mist/40'
                }`}
                aria-label={`转到第${i + 1}张`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 隐藏滚动条 */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
