import type { ReactNode } from "react";

export interface StatCardProps {
  readonly label: string;
  readonly value: string;
  readonly icon?: ReactNode;
}

/** Card de estatística única — reutilizado por toda página que precisa destacar um número/valor isolado. `icon` (UX-001) é opcional — nenhum uso existente precisou passar a fornecê-lo. */
export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card__label">
        {icon}
        {label}
      </span>
      <strong className="stat-card__value">{value}</strong>
    </div>
  );
}
