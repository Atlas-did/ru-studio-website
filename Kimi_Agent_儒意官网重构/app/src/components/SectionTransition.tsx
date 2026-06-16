interface SectionTransitionProps {
  variant?: 'ink-to-light' | 'light-to-ink' | 'ink-fade';
  height?: string;
}

export function SectionTransition({ variant = 'ink-fade', height = 'h-24 md:h-32' }: SectionTransitionProps) {
  const gradients = {
    'ink-to-light': 'bg-gradient-to-b from-ink via-ink-light to-paper',
    'light-to-ink': 'bg-gradient-to-b from-paper via-ink-light to-ink',
    'ink-fade': 'bg-gradient-to-b from-ink via-ink to-ink-light',
  };

  return (
    <div className={`${height} ${gradients[variant]} relative overflow-hidden`}>
      {/* Subtle ink wash texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 50%, rgba(245,242,235,0.03) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
