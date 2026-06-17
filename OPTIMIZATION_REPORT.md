# 儒意 RU STUDIO 网站 — 性能与代码优化诊断报告

> 分析日期：2026-06-17  
> 项目技术栈：React 19 + Vite + Tailwind CSS + GSAP + Lenis + Three.js

---

## 目录

1. [🔴 卡顿问题（性能瓶颈）](#1-卡顿问题)
2. [🟠 重影 / 视觉异常](#2-重影视觉异常)
3. [🟡 鼠标 / 光标问题](#3-鼠标光标问题)
4. [🟢 滑动 / 拖拽冲突 & 键位冲突](#4-滑动拖拽冲突--键位冲突)
5. [🔵 排版与 CSS 问题](#5-排版与-css-问题)
6. [🟣 代码架构优化](#6-代码架构优化)
7. [📋 修改优先级排序](#7-修改优先级排序)

---

## 1. 卡顿问题（性能瓶颈）

### 1.1 TiltCard — mousemove 触发 React 重渲染（严重）

**文件：** `src\components\ui\animated\TiltCard.tsx`

**现状：** `handleMouseMove` 每次调用 `setStyle()` → `setState` → 每秒约 60 次 React 重新渲染（per card）。首页 WorksSection 有 6 张卡片，鼠标划过的瞬间就是 360 次/秒的重新渲染。

```tsx
// 问题代码（当前）
const [style, setStyle] = useState<React.CSSProperties>({...});

const handleMouseMove = (e: React.MouseEvent) => {
  // ... 计算 rotateX/Y ...
  setStyle({ transform: `...`, transition: '...' }); // ← 每次触发 re-render
};
```

**方案：** 用 `useRef` + 直接 DOM 操作替代 `useState`。动画不需要进 React 渲染管线，直接写 `el.style.transform` 零开销。

```tsx
// 修复后
const ref = useRef<HTMLDivElement>(null);

const handleMouseMove = useCallback((e: React.MouseEvent) => {
  const el = ref.current;
  if (!el) return;
  // ... 计算 ...
  el.style.transform = `perspective(800px) rotateX(...) rotateY(...) scale(...)`;
  el.style.transition = 'transform 0.1s ease-out';
}, [maxTilt, scale]);
```

**理由：** `setState` 在 mousemove 频率下（~60fps）会导致 React 的 reconciliation + commit 在整个 fiber 树上跑，这是帧率下降的头号元凶。

---

### 1.2 ScrollProgress — scroll 事件触发 setState（中等）

**文件：** `src\components\ScrollProgress.tsx`

**现状：** 原生 `window.addEventListener('scroll')` + `setState(progress)` → 每次滚动触发 React 重渲染。

```tsx
// 问题代码
const [progress, setProgress] = useState(0);
window.addEventListener('scroll', () => setProgress(...)); // re-render
```

**方案：** 用 `useRef` 直接操作 DOM 元素的 `style.width`。

```tsx
const barRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const bar = barRef.current;
  if (!bar) return;
  const handleScroll = () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = `${Math.min(100, pct)}%`;
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

**理由：** 进度条只改变一个 `width` 属性，完全不需要 React 参与。passive listener 本身不阻塞，但 setState 会。

---

### 1.3 Header — scroll 事件触发 setState（中等）

**文件：** `src\components\Header.tsx` 第 18-21 行

**现状：** `useState(scrolled)` + scroll listener → 每次滚动触发一次 React 重渲染来切换 header 样式。

**方案：** 用 CSS `@supports (animation-timeline: scroll())` 做纯 CSS scroll-driven 效果，或者用 `useRef` + classList 操作。

```tsx
// 方案 A（推荐）：useRef + classList
const headerRef = useRef<HTMLElement>(null);
useEffect(() => {
  const header = headerRef.current;
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('glass-header', window.scrollY > 80);
    header.classList.toggle('bg-transparent', window.scrollY <= 80 && isHome);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, [isHome]);
```

**理由：** classList.toggle 是原生操作，不经过 React。每次 scroll 省一次 fiber 遍历。

---

### 1.4 Lenis + GSAP ticker 双重绑定（中等）

**文件：** `src\hooks\useLenis.ts` 第 30-33 行

**现状：** Lenis 的 RAF 被挂到 `gsap.ticker` 上，而 GSAP 自己的 ScrollTrigger 也在同一个 ticker 里。这意味着每次 GSAP tick 都额外跑一次 Lenis RAF。

```tsx
// 问题代码
gsap.ticker.add((time) => {
  lenisInstance?.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0); // 完全禁用平滑 = 跳帧时无补偿
```

**方案：** Lenis 用自己的 requestAnimationFrame，不和 GSAP 共用 ticker。或者保留但加 `lagSmoothing(500)` 缓冲。

```tsx
// 推荐
function animate(time: number) {
  lenisInstance?.raf(time);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

**理由：** 共用一个 ticker 会让两者互相等待，GSAP 动画多的时候 Lenis 平滑滚动也跟着掉帧。

---

### 1.5 DraggableGallery — cursorX state 导致 mousemove 重渲染（中等）

**文件：** `src\components\interactive\DraggableGallery.tsx` 第 15、87-90 行

**现状：** `const [cursorX, setCursorX] = useState<number | null>(null)` — mousemove 上更新 `cursorX`，触发 React 重渲染来挪动自定义光标提示圆圈。

**方案：** 用 `useRef` 直接操作那个提示 div 的 `style.left`。

```tsx
const cursorHintRef = useRef<HTMLDivElement>(null);
// 在 handleMouseMove 中：
if (cursorHintRef.current) {
  cursorHintRef.current.style.left = `${cursorX - 40}px`;
  cursorHintRef.current.style.display = 'block';
}
```

**理由：** 和 TiltCard 同理，mousemove 级别的更新必须走原生 DOM。

---

## 2. 重影 / 视觉异常

### 2.1 App.css 残留 — #root 限制破坏布局（严重）

**文件：** `src\App.css`

**现状：** 这个文件是 Vite 脚手架默认模板残留，根本不适用于当前项目：

```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
```

这导致所有页面内容被强制限制在 1280px 宽、居中、有 2rem 内边距。虽然 index.css 的 Tailwind 可能覆盖一部分，但两者打架时会出现视觉撕裂/重影。

**方案：** 删除 `src\App.css` 全部内容，只保留空文件或删除该文件。同时检查 `src\main.tsx` 是否 `import './App.css'`（当前代码里只 import 了 `./index.css`，但文件存在即可能被 build 打包）。

将 `src\App.css` 改为空文件或删除：

```css
/* 此文件已弃用，所有样式通过 Tailwind (index.css) 管理 */
```

---

### 2.2 多层 noise overlay 叠加导致视觉拖影（中等）

**文件：** 
- `src\index.css` 第 116-128 行 `.paper-grain::before`（全局 z-index: 9998）
- HeroSection / WorksSection / ConceptsSection 每个图片上又有 `.noise-overlay::after`
- SectionTransition 里也有内联 SVG noise

**现状：** 同一个页面可能有 10+ 层 `opacity: 0.03` 的噪声纹理叠加。在 Chromium 里，每个 `::after` / `::before` 伪元素如果有背景图，会创建独立 compositing layer。多层叠加后 GPU 内存暴涨，导致**滚动时画面撕裂/重影**。

**方案：**
1. 全局 `paper-grain` 保留（只此一层）
2. 移除所有 `.noise-overlay` 的 `::after`，改为纯 CSS `opacity` 在容器上
3. SectionTransition 的 noise 去掉

```css
/* 替代方案：单层全局 noise，通过 z-index 控制 */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,...");
}
/* 删掉所有 .noise-overlay::after */
```

**理由：** noise 效果的目的是统一质感，一层足矣。多层叠加既浪费 GPU 又无视觉提升。

---

### 2.3 glass-header 的 backdrop-filter 开销（轻微）

**文件：** `src\index.css` 第 147-151 行

**现状：**
```css
.glass-header {
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
}
```

`backdrop-filter` 会让浏览器在每次滚动时重绘 header 下方的像素。`saturate(180%)` 额外加重色彩计算。

**方案：** 降低 blur 值或改用半透明纯色背景。

```css
.glass-header {
  background: rgba(10, 10, 10, 0.85); /* 不依赖 backdrop-filter */
  /* 保留柔光效果即可 */
}
```

**理由：** `backdrop-filter` 在低配设备上会让滚动掉帧。如果一定要保留，至少去掉 `saturate()`。

---

### 2.4 index.html 内联 base64 SVG noise（轻微）

**文件：** `src\index.css` 和 `src\components\SectionTransition.tsx`

**现状：** 多个内联 `data:image/svg+xml,...` 字符串很长，每次解析都会重新 rasterize。

**方案：** 将 noise SVG 定义为 CSS 变量或单独的 base64 常量，复用引用。

```css
:root {
  --noise-texture: url("data:image/svg+xml,...");
}
.noise-overlay::after {
  background-image: var(--noise-texture);
}
```

---

## 3. 鼠标 / 光标问题

### 3.1 CustomCursor — mixBlendMode 导致 GPU 合成层抖动（严重）

**文件：** `src\components\CustomCursor.tsx` 第 50 行

**现状：**
```tsx
style={{
  mixBlendMode: 'difference',
  // ...
}}
```

`mixBlendMode: 'difference'` 强制浏览器为光标创建一个独立的合成层，且需要和下方所有像素做逐像素混合计算。在滚动或有动画时，光标会出现**明显滞后**。

**方案：** 去掉 `mixBlendMode`，改为纯色半透明光标。

```tsx
backgroundColor: cursorState === 'default' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
// 删掉 mixBlendMode
```

**理由：** `difference` 模式在技术上每帧需要读取 backbuffer → CPU/GPU 混合 → 写回。这是光标卡的根本原因。

---

### 3.2 CustomCursor — scroll/wheel 事件中的 getBoundingClientRect（中等）

**文件：** `src\components\CustomCursor.tsx` 第 24-25 行

**现状：**
```tsx
const onScroll = () => repaint();
// repaint 里：dot.style.transform = `translate(${lastX - 4}px, ${lastY - 4}px)`;
```

滚动时只有 `lastX/lastY` 是旧的鼠标坐标，没有重新从事件获取。这导致**滚动时光标停留在原地，和页面内容错位**。

**方案：** 滚动时不强行重绘，而是用 `pointermove` 事件自然更新。或者用 `requestAnimationFrame` 包裹 repaint：

```tsx
let rafId = 0;
const onScroll = () => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    repaint();
    rafId = 0;
  });
};
```

---

### 3.3 CustomCursor — 缺少 will-change 优化（轻微）

**方案：** 在光标的 style 中加 `will-change: transform`，让浏览器提前把它提升到合成层。

```tsx
style={{
  willChange: 'transform',
  // ...
}}
```

---

### 3.4 mouseover 委托检测开销（轻微）

**文件：** `src\components\CustomCursor.tsx` 第 27-33 行

**现状：** 每次 `mouseover` 事件都调用 `closest('a, button, [role="button"]')` 和 `closest('[data-cursor="view"]')` 和 `closest('[data-cursor="drag"]')`。

**方案：** 用 `matches()` 替代 `closest()`，或者只在 `target` 变化时检测；用事件冒泡在父级统一判断。

---

## 4. 滑动 / 拖拽冲突 & 键位冲突

### 4.1 DraggableGallery wheel 事件和 Lenis 冲突（严重）

**文件：** `src\components\interactive\DraggableGallery.tsx` 第 63-72 行

**现状：**
```tsx
container.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();           // ← 阻止了 Lenis 的平滑滚动
    container.scrollLeft += e.deltaY;
  }
}, { passive: false });
```

用户想在 gallery 上用滚轮水平翻图，但**同样的滚轮也想用来上下滚动页面**。当前代码总是 `preventDefault()` 阻止了页面滚动——这就是你描述的"键位冲突"。

**方案：** 加一个锁定机制 — gallery 有一个 `锁定/解锁` 按钮。解锁状态下滚轮正常滚动页面；锁定状态下滚轮才控制 gallery 水平滑动。

```tsx
const [locked, setLocked] = useState(false);

const onWheel = (e: WheelEvent) => {
  if (!locked) return; // 未锁定，让事件冒泡到 Lenis
  e.preventDefault();
  container.scrollLeft += e.deltaY;
};
```

在 UI 上加一个切换按钮：
```tsx
<button onClick={() => setLocked(!locked)} className="...">
  {locked ? '🔒 已锁定滚动' : '🔓 点击锁定画廊滚动'}
</button>
```

**理由：** 画廊的横滚和页面竖滚本来就不应该同时发生。提供一个显式的锁定开关是 Nike、Apple 等产品页的通行做法。

---

### 4.2 DraggableGallery 拖拽和文字选择冲突（中等）

**现状：** `className="select-none"` 解决了文字选中，但如果用户双击图片想放大（ImageZoomViewer），拖拽手势会先触发。

**方案：** 用 `pointerdown` / `pointermove` / `pointerup` 替代 `mousedown/mousemove/mouseup`，并加一个移动阈值（比如移动 < 5px 不算拖拽，算点击）。

```tsx
const DRAG_THRESHOLD = 5;
let hasMoved = false;

const handlePointerDown = (e) => {
  startX.current = e.clientX;
  hasMoved = false;
};

const handlePointerMove = (e) => {
  if (Math.abs(e.clientX - startX.current) > DRAG_THRESHOLD) {
    hasMoved = true;
    // 拖拽逻辑...
  }
};

const handlePointerUp = () => {
  if (!hasMoved) {
    // 算点击，触发原有点击行为
  }
};
```

---

### 4.3 缺少键盘导航（中等）

**现状：** DraggableGallery 有左右箭头按钮，但用户按键盘 ← → 键没有反应。TimelineSection 的节点可以用 Tab 切换但无 Enter 展开。

**方案：** 给 DraggableGallery 容器加 `tabIndex={0}` 和 `onKeyDown`：

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
};
```

---

### 4.4 ImageZoomViewer — 触屏拖拽和放大镜冲突（轻微）

**文件：** `src\components\interactive\ImageZoomViewer.tsx`

**现状：** 触屏有 `handleTouchStart/Move/End` 用于拖拽缩放镜位置，但双指 pinch-zoom 没有处理，浏览器默认行为会缩放整个页面。

**方案：** 加 `touch-action: manipulation` 阻止双击缩放，pinch 交给浏览器处理即可。

---

## 5. 排版与 CSS 问题

### 5.1 App.css 残留（严重）

同 2.1，再次强调：**删除 `src\App.css` 的内容**。

---

### 5.2 GSAP ScrollTrigger 重复注册（中等）

**文件：** 共 7 个文件都在文件顶部写了 `gsap.registerPlugin(ScrollTrigger)`：
- `src\hooks\useLenis.ts`
- `src\hooks\useScrollReveal.ts`
- `src\hooks\useTextReveal.ts`
- `src\sections\HeroSection.tsx`
- `src\sections\WorksSection.tsx`
- `src\sections\ConceptsSection.tsx`
- 等...

**方案：** 只在 `src\main.tsx` 或 `src\hooks\useLenis.ts` 注册一次。

```tsx
// src/main.tsx 顶部
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

然后删掉所有其他文件里的 `gsap.registerPlugin(ScrollTrigger)` 和 `import { ScrollTrigger } ...`。

**理由：** `registerPlugin` 是幂等的但每次 import 都会执行，增加模块初始化开销。

---

### 5.3 useEffect 依赖数组问题 — 动画重复执行（中等）

**文件：** 
- `src\sections\WorksSection.tsx` → `useEffect(..., [items])`
- `src\sections\ConceptsSection.tsx` → `useEffect(..., [concepts])`

**现状：** 把数据作为依赖，初始渲染时 `items` 是 fallback 数据（空数组），API 返回真实数据后 reference 变化 → effect 重新执行 → GSAP 动画重跑一遍 → 页面闪烁。

**方案：** 用 `useRef` 标记是否已执行过动画。

```tsx
const animatedRef = useRef(false);

useEffect(() => {
  if (animatedRef.current || !items.length) return;
  animatedRef.current = true;
  // ... GSAP 动画 ...
}, [items]);
```

---

### 5.4 图片 loading 策略不一致（轻微）

**文件：** 
- HeroSection: `loading="eager"` ← 首屏正确
- WorksSection: `loading="lazy"` ← 正确  
- CollectionPage: `loading="lazy"` ← 正确
- DraggableGallery 内的图片：**没有 `loading` 属性** ← 遗漏

**方案：** 给 DraggableGallery 的 `<img>` 加 `loading="lazy"`，首张加 `fetchpriority="high"`。

---

### 5.5 PageTransition 会卸载/重挂整个页面（中等）

**文件：** `src\components\PageTransition.tsx` 第 8、14 行

**现状：**
```tsx
const [displayLocation, setDisplayLocation] = useState(location);
// ...
<div key={displayLocation.pathname} className="animate-page-enter">
  <Outlet />
</div>
```

路由切换时 `key` 变化 → 整个 `<Outlet />` 卸载再挂载 → 所有 GSAP 动画、Lenis、状态全部重建 → 看起来"卡了一下"。

**方案：** 用 `location.pathname` 做 key，去掉 `displayLocation` 这套延迟机制，或者用 `framer-motion` 的 `AnimatePresence` 替代 DIY 实现。

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

否则至少简化 ink-wipe 为纯 CSS transition：

```css
.page-enter { animation: page-enter 0.4s ease-out both; }
```

---

### 5.6 SectionTransition 过多 DOM 节点（轻微）

**现状：** HomePage 有 9 个 `<SectionTransition>` 组件，每个都是独立的 div。总计 9 个额外 DOM 层。

**方案：** 如果只是颜色过渡，可以用 CSS 的 `background: linear-gradient(...)` 直接在 section 的 `::before` 上处理，删掉 SectionTransition 组件。

---

### 5.7 font-display 策略（轻微）

**文件：** `index.html` 第 9-11 行

**现状：** Google Fonts 用 `<link>` 加载，可能阻塞首屏渲染。

**方案：** 在内联 `<style>` 里加 `font-display: swap`：

```html
<link ... &display=swap" />
<!-- 已经把 display=swap 参数传给 Google Fonts 了，正确 ✅ -->
```

---

## 6. 代码架构优化

### 6.1 useLenis 的 scrollSpeed 是全局变量（轻微）

**文件：** `src\hooks\useLenis.ts` 第 6 行

```tsx
let scrollSpeed = 0; // 模块级全局变量
```

**方案：** 如果多个页面复用此模块，scrollSpeed 不会重置。应该在 Lenis 实例上存储或在 Layout 层级管理。

---

### 6.2 三.js / React Three Fiber 体积（轻微）

**现状：** `package.json` 依赖了 `three` + `@react-three/fiber` + `@react-three/drei`，仅在 `Model3DViewer.tsx` 中使用。这些库打包后约 500KB+ gzip。

**方案：** 用 `React.lazy` + `Suspense` 动态加载 Model3DViewer：

```tsx
const Model3DViewer = React.lazy(() => import('@/components/interactive/Model3DViewer'));
```

---

### 6.3 删除未使用的 CSS 动画类（轻微）

**现状：** `tailwind.config.js` 定义了 `page-exit`、`ink-wipe`、`char-reveal` 等 keyframe，但实际代码中只有 `page-enter` 被使用，`char-reveal` 在 HeroSection 中通过 GSAP 手动实现（没用 CSS 版本）。

**方案：** 删除未使用的动画定义，减少 CSS 体积。

---

## 7. 修改优先级排序

| 优先级 | 问题编号 | 问题名称 | 影响范围 | 修改难度 |
|--------|---------|---------|---------|---------|
| 🔴 P0 | 1.1 | TiltCard mousemove setState | 全站卡顿 | 低 |
| 🔴 P0 | 3.1 | CustomCursor mixBlendMode | 光标卡顿 | 低 |
| 🔴 P0 | 5.1 / 2.1 | App.css 残留 #root 限制 | 全站布局错乱 | 低 |
| 🔴 P0 | 4.1 | DraggableGallery + Lenis 滚动冲突 | 滑动体验 | 中 |
| 🟠 P1 | 1.2 | ScrollProgress setState | 滚动卡顿 | 低 |
| 🟠 P1 | 1.3 | Header setState on scroll | 滚动卡顿 | 低 |
| 🟠 P1 | 2.2 | 多层 noise overlay 叠加 | 重影/GPU压力 | 中 |
| 🟠 P1 | 1.4 | Lenis + GSAP 双重 ticker | 掉帧 | 中 |
| 🟡 P2 | 5.2 | GSAP registerPlugin 重复注册 | 启动性能 | 低 |
| 🟡 P2 | 5.3 | useEffect 依赖导致动画重跑 | 页面闪烁 | 低 |
| 🟡 P2 | 1.5 | DraggableGallery cursorX state | 画廊卡顿 | 低 |
| 🟡 P2 | 5.5 | PageTransition 卸载重挂 | 路由切换卡顿 | 中 |
| 🔵 P3 | 4.3 | 缺少键盘导航 | 无障碍 | 低 |
| 🔵 P3 | 4.2 | 拖拽 vs 点击阈值 | 交互精度 | 低 |
| 🔵 P3 | 6.2 | Three.js 动态加载 | 首屏体积 | 中 |
| 🔵 P3 | 其余 | 排版/CSS 优化 | 代码质量 | 低 |

---

## 总结

核心问题链：

```
mousemove setState (TiltCard) ─┐
mousemove setState (CursorX)  ─┤
scroll   setState (ProgressBar)─┼─→ React 高频重渲染 → JS 主线程阻塞 → 掉帧/卡顿
scroll   setState (Header)    ─┤
mixBlendMode (CustomCursor)   ─┘

Lenis + GSAP 共用 ticker ─→ RAF 竞争 ─→ 平滑滚动掉帧

wheel preventDefault ─→ Lenis 被阻断 ─→ 滑动冲突

App.css #root ─→ max-width:1280px ─→ 布局撕裂/重影

多层 noise::after ─→ 合成层爆炸 ─→ GPU 内存满 → 重影
```

**建议修改顺序：** 先修 P0（4 项），单这 4 项就能解决 80% 的体验问题。P1 跟上，P2 P3 择机处理。

---

> 以上所有文件路径均相对于项目根目录 `D:\Temp_download\app`。
