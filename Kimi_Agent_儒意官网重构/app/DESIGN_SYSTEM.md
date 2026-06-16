# 儒意 · RU STUDIO — Design System

> 向历史借灵感，为当代造美物。

---

## 1. Design Philosophy

**Less is More.** Every pixel must breathe.

The design language draws from Confucian aesthetics — restraint, balance, and the poetry of empty space (留白). The digital experience should feel like unfolding a handscroll: gradual, meditative, with moments of quiet revelation.

---

## 2. Typography System

### 2.1 Font Families

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| Display (EN) | Playfair Display | Times New Roman, serif | Hero titles, large headings |
| Serif (ZH) | Noto Serif SC | Songti SC, SimSun, serif | Chinese body text, quotes |
| Sans (EN) | Inter | -apple-system, sans-serif | Navigation, labels, captions |

**Font loading strategy**: Preload critical fonts in `<head>`. Use `font-display: swap` to prevent FOUT.

### 2.2 Type Scale

| Token | Size | Line Height | Letter Spacing | Weight | Usage |
|-------|------|-------------|----------------|--------|-------|
| Display XL | clamp(64px, 8vw, 120px) | 1.0 | 0.02em | 300 | Hero "儒" character |
| Display L | clamp(42px, 5vw, 72px) | 1.1 | 0.01em | 400 | Section titles |
| Display M | clamp(32px, 3.5vw, 48px) | 1.2 | 0.02em | 400 | Sub-section headings |
| H1 | clamp(28px, 2.5vw, 36px) | 1.4 | 0.04em | 600 | Page titles |
| H2 | clamp(22px, 2vw, 28px) | 1.5 | 0.03em | 500 | Card titles |
| H3 | 18px | 1.6 | 0.02em | 500 | Small headings |
| Body L | clamp(16px, 1.2vw, 18px) | 1.8 | 0.05em | 400 | Lead paragraphs |
| Body | 15px | 1.75 | 0.04em | 400 | Body text |
| Caption | 12px | 1.5 | 0.08em | 400 | Labels, metadata |
| Caption S | 11px | 1.4 | 0.12em | 400 | Tags, fine print |
| Overline | 10px | 1.2 | 0.2em | 500 | Section labels, uppercase |

### 2.3 Chinese-English Mixed Typography

- When Chinese and English appear together, insert a `&nbsp;` or `0.25em` word spacing
- English within Chinese context: use font-sans, slightly smaller (0.9em) with 0.05em tracking
- Section labels format: `中文标题&nbsp;&nbsp;<span class="overline">(EN LABEL)</span>`

### 2.4 OpenType Features

```css
font-feature-settings: "liga" 1, "kern" 1;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## 3. Color System

### 3.1 Core Palette — Confucian Five Tones (墨分五色)

| Token | Hex | Usage |
|-------|-----|-------|
| ink | #0A0A0A | Primary dark background — not pure black, but "heavy ink" |
| ink-light | #1A1A1A | Elevated dark surfaces |
| ink-lighter | #2C2C2C | Cards, secondary dark |
| paper | #E8E4DC | Primary light background — "xuan paper white" |
| paper-dark | #D5CFC6 | Borders, dividers on light |
| mist | #F5F2EB | Lightest tint — highlights on dark bg |
| stone | #8A8580 | Muted text — "dry ink" |
| cinnabar | #8B1A1A | Primary accent — seal red, used sparingly |
| cinnabar-light | #A62D2D | Hover state of cinnabar |
| gold | #9C8458 | Secondary accent — antique bronze |

### 3.2 Usage Rules

- **Dark sections**: `bg-ink`, `text-mist` / `text-stone`
- **Light sections**: `bg-paper`, `text-ink`
- **Accent**: Cinnabar only for interactive states, hover, and one focal point per section
- **Gold**: Reserved for special highlights, numeral markers, premium badges
- **Never use pure white (#FFFFFF)** — always use `mist` or `paper`
- **Never use pure black (#000000)** — always use `ink` (#0A0A0A)

### 3.3 Gradient & Transparency

| Token | Value | Usage |
|-------|-------|-------|
| border-subtle | rgba(245, 242, 235, 0.08) | Borders on dark backgrounds |
| border-medium | rgba(245, 242, 235, 0.15) | Active borders |
| overlay-light | rgba(10, 10, 10, 0.4) | Image overlays |
| overlay-heavy | rgba(10, 10, 10, 0.75) | Modal/drawer backgrounds |

---

## 4. Spacing System

Based on 8px grid with Confucian-derived scale.

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight gaps |
| space-2 | 8px | Icon gaps |
| space-3 | 12px | Small padding |
| space-4 | 16px | Default padding |
| space-6 | 24px | Section internal gaps |
| space-8 | 32px | Card padding |
| space-10 | 40px | Medium sections |
| space-12 | 48px | Large gaps |
| space-16 | 64px | Section padding (mobile) |
| space-20 | 80px | Section padding |
| space-24 | 96px | Large section padding |
| space-32 | 128px | XL section padding |
| space-40 | 160px | Hero section spacing |

**Section vertical padding**: `py-24 md:py-32 lg:py-40`
**Content max-width**: 1440px, centered with `mx-auto`
**Page horizontal padding**: `px-6 md:px-12 lg:px-16`

---

## 5. Shadow & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.3) | Subtle lift |
| shadow-md | 0 4px 12px rgba(0,0,0,0.4) | Cards on dark |
| shadow-lg | 0 8px 30px rgba(0,0,0,0.5) | Modals, dropdowns |
| glow-cinnabar | 0 0 20px rgba(139,26,26,0.3) | Cinnabar glow |

---

## 6. Border & Radius

| Token | Value | Usage |
|-------|-------|-------|
| radius-none | 0 | Images, full-bleed elements |
| radius-sm | 2px | Small elements |
| radius-md | 4px | Buttons, inputs |
| radius-lg | 8px | Cards |

**Philosophy**: Sharp corners dominate (0-2px). Soft curves are used sparingly for interactive elements only. This echoes the straight brushstroke in Chinese calligraphy.

---

## 7. Animation System

### 7.1 Easing Curves

| Name | Value | Usage |
|------|-------|-------|
| ease-expo-out | cubic-bezier(0.16, 1, 0.3, 1) | Primary entrance |
| ease-expo-in | cubic-bezier(0.7, 0, 0.84, 0) | Exit animations |
| ease-smooth | cubic-bezier(0.4, 0, 0.2, 1) | Subtle transitions |
| ease-dramatic | cubic-bezier(0.87, 0, 0.13, 1) | Hero reveals |
| ease-spring | cubic-bezier(0.34, 1.56, 0.64, 1) | Cursor, playful |

### 7.2 Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| duration-fast | 200ms | Hover states |
| duration-normal | 400ms | Transitions |
| duration-slow | 700ms | Entrances |
| duration-slower | 1000ms | Hero animations |
| duration-dramatic | 1500ms | Page transitions |

### 7.3 Animation Patterns

| Pattern | Description | Implementation |
|---------|-------------|----------------|
| Char Reveal | Characters reveal one by one | GSAP SplitText + stagger |
| Mask Reveal | Content revealed through mask | clip-path animation |
| Fade Rise | Element fades in while rising | opacity + translateY |
| Ink Wipe | Dark wipe across screen | scaleX transform |
| Parallax Slow | Slow parallax on scroll | GSAP ScrollTrigger scrub |
| Magnetic Pull | Element follows cursor subtly | Mouse position lerp |

---

## 8. Texture & Material

### 8.1 Paper Grain Overlay

Applied globally as a subtle texture:
```css
.paper-grain::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,...feTurbulence...");
}
```

### 8.2 Ink Wash Transitions

Section-to-section transitions use SVG filter-based ink wash effects rather than simple gradients.

### 8.3 Noise Texture

All image containers get a subtle noise overlay at 2-3% opacity for filmic quality.

---

## 9. Component Patterns

### 9.1 Buttons

| Variant | Style | Hover |
|---------|-------|-------|
| Primary | Border 1px mist/60, transparent bg | Cinnabar bg, border-cinnabar |
| Ghost | No border, text only | Text color → cinnabar |
| Text | Underline via SVG stroke animation | Brush-stroke underline reveals |

### 9.2 Cards (Works)

- No border-radius (0px)
- Subtle border: 1px border-subtle
- Hover: image scale 1.03, overlay appears, info slides up
- Cursor changes to "view" mode

### 9.3 Navigation

- Transparent at top → glassmorphism on scroll
- Backdrop-filter: blur(12px) saturate(180%)
- Background: rgba(10, 10, 10, 0.7)
- Links: overline style, letter-spacing 0.15em

---

## 10. Responsive Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Ultra-wide |

---

## 11. Z-Index Scale

| Layer | Z-Index | Element |
|-------|---------|---------|
| Grain | 9998 | Paper grain overlay |
| Cursor | 9997 | Custom cursor |
| Progress | 100 | Scroll progress bar |
| Header | 50 | Fixed navigation |
| Modal | 40 | Overlays |
| Content | 1-10 | Page content |

---

*Last updated: 2026-06-16*
*Version: 2.0*
