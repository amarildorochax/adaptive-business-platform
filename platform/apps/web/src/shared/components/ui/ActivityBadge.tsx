export type ActivityBadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export interface ActivityBadgeProps {
  readonly label: string;
  readonly tone?: ActivityBadgeTone;
}

/**
 * Rótulo de tipo de evento em um feed cronológico (ex.: "Criado", "Movido", "Ganho") — distinto de
 * `Badge` (rótulo de status de um registro) por seu marcador visual de ponto, pensado para uma lista
 * vertical de itens em sequência temporal. Primeiro uso no Timeline Comercial do CRM Workspace
 * (FUN-103), genérico para qualquer feed de atividade futuro.
 */
export function ActivityBadge({ label, tone = "neutral" }: ActivityBadgeProps) {
  return (
    <span className={`activity-badge activity-badge--${tone}`}>
      <span className="activity-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
