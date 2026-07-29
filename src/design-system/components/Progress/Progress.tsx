// Progress.tsx
//
// Responsabilidade:
// Barra de progresso linear — parte do padrão de Loading States da
// Sprint 29 (Skeleton/Spinner/Progress/Shimmer/Placeholder), somando-se
// aos componentes base da Sprint 26. Usa exclusivamente as classes de
// `foundations/branding/branding.css` (`.ads-progress-track`/
// `.ads-progress-fill`) — nenhuma cor/raio hardcoded aqui.

export interface ProgressProps {
  /** Valor de 0 a 100. Quando omitido, a barra fica em modo indeterminado (largura fixa em 40%). */
  value?: number;
  'aria-label'?: string;
}

export function Progress(props: ProgressProps) {
  const { value, 'aria-label': ariaLabel = 'Progresso' } = props;
  const clamped = value === undefined ? undefined : Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="ads-progress-track"
    >
      <div className="ads-progress-fill" style={{ width: `${clamped ?? 40}%` }} />
    </div>
  );
}
