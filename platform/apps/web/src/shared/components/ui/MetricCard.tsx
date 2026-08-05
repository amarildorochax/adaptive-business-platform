import type { ReactNode } from "react";

export type MetricTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export interface MetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly icon?: ReactNode;
  /** Cor semântica de destaque — nunca livre fora da paleta já usada por `Badge`/`Alert`. */
  readonly tone?: MetricTone;
  /** Texto secundário curto, ex.: "de 5 Oportunidades". */
  readonly hint?: string;
}

/**
 * Indicador de negócio com tom semântico — variante de `StatCard` (UX-001) para o caso em que o
 * próprio valor precisa comunicar positivo/negativo/neutro (ex.: Negócios Ganhos vs. Perdidos),
 * algo que `StatCard` nunca precisou expressar. Primeiro uso no CRM Workspace (FUN-103), genérico
 * para qualquer domínio futuro com o mesmo requisito.
 */
export function MetricCard({ label, value, icon, tone = "neutral", hint }: MetricCardProps) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">
        {icon}
        {label}
      </span>
      <strong className="metric-card__value">{value}</strong>
      {hint && <span className="metric-card__hint">{hint}</span>}
    </div>
  );
}
