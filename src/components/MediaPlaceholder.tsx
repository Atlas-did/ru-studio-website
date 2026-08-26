import Seal from './Seal';

/**
 * MediaPlaceholder — 影音/3D 内容占位
 * 为将来接入视频、360° 展示、3D 模型预留的位子。
 * 视觉上做成「宣纸拓片框」：双层细线边框 + 纸纹 + 朱砂播放键 + 印章角标，
 * hover 时播放键轻微放大、光晕脉冲，暗示"这里会有内容，敬请期待"。
 * 换上真实内容时，直接把它替换成 <video> / <iframe> / <Canvas> 即可。
 */
interface MediaPlaceholderProps {
  /** 内容类型 */
  variant?: 'film' | 'model' | 'gallery';
  /** 中文主文案，默认按 variant 给出 */
  label?: string;
  /** 英文副文案，默认按 variant 给出 */
  sub?: string;
  /** 说明小字，如"将展示品牌影片" */
  caption?: string;
  /** 宽高比（Tailwind class），默认 aspect-video */
  aspect?: string;
  /** 印章文字，默认「影」/「览」/「藏」 */
  sealText?: string;
  className?: string;
}

const VARIANTS = {
  film: {
    label: '影片即将上线',
    sub: 'VIDEO · COMING SOON',
    seal: '影',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 translate-x-[2px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5.5v13l11-6.5-11-6.5z" />
      </svg>
    ),
  },
  model: {
    label: '3D 模型即将上线',
    sub: '3D VIEW · IN PROGRESS',
    seal: '览',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
      </svg>
    ),
  },
  gallery: {
    label: '影像图集整理中',
    sub: 'GALLERY · PREPARING',
    seal: '藏',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <rect x="3" y="4" width="7" height="6" rx="0" />
        <rect x="14" y="4" width="7" height="6" rx="0" />
        <rect x="3" y="14" width="7" height="6" rx="0" />
        <rect x="14" y="14" width="7" height="6" rx="0" />
      </svg>
    ),
  },
};

export default function MediaPlaceholder({
  variant = 'film',
  label,
  sub,
  caption,
  aspect = 'aspect-video',
  sealText,
  className = '',
}: MediaPlaceholderProps) {
  const v = VARIANTS[variant];

  return (
    <div
      className={`media-frame relative w-full overflow-hidden ${aspect} ${className}`}
      role="img"
      aria-label={label || v.label}
    >
      {/* 纸纹底 */}
      <div className="absolute inset-0 bg-raised" />
      <div className="absolute inset-0 media-grain" />

      {/* 双层框线（拓片内框） */}
      <div className="absolute inset-2 md:inset-3 border border-line-medium" />
      <div className="absolute inset-[10px] md:inset-[13px] border border-line-subtle" />

      {/* 大号竖排角标 */}
      <span aria-hidden="true" className="absolute left-[14px] md:left-[20px] bottom-[10px] text-fg-ghost vertical-text text-2xl md:text-3xl font-serif">
        RU STUDIO
      </span>

      {/* 印章角标 */}
      <Seal text={sealText || v.seal} size={30} variant="zhu" className="absolute right-3 bottom-3 opacity-80" />

      {/* 中央播放键/图标 + 文案 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-5 px-6">
        <button
          type="button"
          aria-label={label || v.label}
          data-cursor="hover"
          className="media-play relative grid place-items-center w-14 h-14 md:w-16 md:h-16 rounded-full border border-accent/70 text-accent transition-transform duration-500 ease-out hover:scale-110"
        >
          {v.icon}
        </button>
        <div className="text-center">
          <p className="font-serif text-h2 text-fg tracking-wide">{label || v.label}</p>
          <p className="text-overline text-fg-muted mt-2 tracking-[0.2em]">{sub || v.sub}</p>
          {caption && <p className="text-caption text-fg-muted mt-2">{caption}</p>}
        </div>
      </div>

      {/* 底边年份铭 */}
      <span className="absolute right-[14px] md:right-[20px] bottom-[10px] text-caption-s text-fg-ghost font-sans">
        {new Date().getFullYear()} · RU STUDIO
      </span>
    </div>
  );
}
