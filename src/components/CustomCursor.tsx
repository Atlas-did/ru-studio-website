import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type CursorState = 'default' | 'hover' | 'view' | 'drag';

/**
 * 自定义鼠标指针 —— 丹红 + 双主题可见。
 *
 * 性能与可见性要点（为什么这样写）：
 * 1. mousemove/mouseover 不再走 React setState：指针状态存在 ref 里，直接
 *    改 DOM class / GSAP，避免每次鼠标扫过元素都触发整组件重渲染（旧版卡顿根因之一）。
 * 2. 用 gsap xPercent/yPercent 做居中：旧版用 Tailwind -translate-x-1/2 类，
 *    但 GSAP 内联 transform 会整体覆盖类里的 transform，导致居中丢失、指针偏移。
 * 3. 颜色走 CSS 变量（--accent 丹红、--fg 前景色），在「墨」深色页与「宣」浅色页
 *    下都能看清；不再硬编码近白色 mist。
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  // 触屏设备直接不渲染，用惰性初始化避免首帧闪一下
  const [isTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  );

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    document.body.classList.add('custom-cursor-enabled');

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    // 居中放到 GSAP 的 transform 里，确保与 quickTo 的 x/y 共存
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(dot, { xPercent: -50, yPercent: -50 });

    // quickTo 复用单个 tween，无 GC 抖动
    const ringX = gsap.quickTo(cursor, 'x', { duration: 0.14, ease: 'power2.out' });
    const ringY = gsap.quickTo(cursor, 'y', { duration: 0.14, ease: 'power2.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.03, ease: 'none' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.03, ease: 'none' });

    // rAF 合帧：一帧内多次 mousemove 只应用一次
    let rafPending = false;
    let lastX = -100;
    let lastY = -100;
    const flush = () => {
      rafPending = false;
      ringX(lastX);
      ringY(lastY);
      dotX(lastX);
      dotY(lastY);
    };
    const onMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(flush);
      }
    };

    // 指针视觉状态：直接写 data-state + GSAP 尺寸，不经过 React 渲染
    const stateRef = { current: 'default' as CursorState };
    const sizes: Record<CursorState, number> = { default: 14, hover: 46, view: 72, drag: 56 };
    const applyState = (s: CursorState) => {
      if (stateRef.current === s) return;
      stateRef.current = s;
      cursor.dataset.state = s;
      gsap.to(cursor, { width: sizes[s], height: sizes[s], duration: 0.3, ease: 'power3.out' });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest('a, button, [role="button"]')) applyState('hover');
      else if (target.closest('[data-cursor="view"]')) applyState('view');
      else if (target.closest('[data-cursor="drag"]')) applyState('drag');
      else applyState('default');
    };

    const onMouseDown = () => gsap.to(cursor, { scale: 0.85, duration: 0.1, ease: 'power2.out' });
    const onMouseUp = () => gsap.to(cursor, { scale: 1, duration: 0.15, ease: 'power2.out' });

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      document.body.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div
        ref={cursorRef}
        data-state="default"
        className="cursor-ring fixed top-0 left-0 pointer-events-none z-[9997] rounded-full"
        style={{ width: 14, height: 14 }}
      >
        <span className="cursor-label">查看</span>
        <span className="cursor-label">拖拽</span>
      </div>
      <div ref={cursorDotRef} className="cursor-dot fixed top-0 left-0 pointer-events-none z-[9997] rounded-full" />
    </>
  );
}
