export interface ProgressBarProps {
  readonly value: number;
  readonly max?: number;
  readonly label?: string;
}

/** Barra de progresso — usada onde uma meta/limite real já existe no dado (nunca inventada para uma tela sem meta real). */
export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div className="progress__bar" style={{ width: `${percent}%` }} />
    </div>
  );
}
