/**
 * MarqueeBand — 倾斜滚动文字带
 * 编辑部式的装饰装置：一行衬线大字横向匀速滚动，整体微微倾斜，
 * 打破"横平竖直"的规整感（参考奢侈品牌官网的 ambient band）。
 * 放在区块之间，作为章节的呼吸与转折。
 *
 * 结构三层：外层 .marquee 满宽裁剪 → 中层 .marquee-rotator 整体旋转并加宽
 * → 内层 .marquee-track 做无缝位移。旋转产生的角部溢出被外层裁剪，
 * 不会撑出页面横向滚动条。
 */
interface MarqueeBandProps {
  /** 循环文案，默认品牌词 */
  text?: string;
  /** 分隔符 */
  separator?: string;
  /** 倾斜角度（deg） */
  rotate?: number;
  /** 背景：透明 或 深墨 或 朱砂 */
  tone?: 'transparent' | 'ink' | 'cinnabar';
  className?: string;
}

export default function MarqueeBand({
  text = '儒意 RU STUDIO',
  separator = '✦',
  rotate = -1.6,
  tone = 'transparent',
  className = '',
}: MarqueeBandProps) {
  // 连续两份内容，translateX(-50%) 无缝循环
  const row = (key: string) => (
    <span key={key} className="marquee-row">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="marquee-item">
          <span>{text}</span>
          <span className="marquee-sep">{separator}</span>
        </span>
      ))}
    </span>
  );

  const toneClass =
    tone === 'ink'
      ? 'bg-ink border-y border-line-subtle'
      : tone === 'cinnabar'
      ? 'bg-cinnabar text-paper'
      : 'text-fg';

  return (
    <div
      aria-hidden="true"
      className={`marquee overflow-hidden py-4 md:py-6 select-none pointer-events-none ${toneClass} ${className}`}
      style={
        tone === 'transparent'
          ? { borderTop: '1px solid var(--line-subtle)', borderBottom: '1px solid var(--line-subtle)' }
          : undefined
      }
    >
      <div
        className="marquee-rotator"
        style={{ transform: `rotate(${rotate}deg) scale(1.03)`, width: '118%', marginLeft: '-9%' }}
      >
        <div className="marquee-track">
          {row('a')}
          {row('b')}
        </div>
      </div>
    </div>
  );
}
