import { AlertTriangle, Info, XCircle } from "lucide-react";

export type AlertCardSeverity = "info" | "warning" | "danger";

const ICON: Record<AlertCardSeverity, typeof Info> = { info: Info, warning: AlertTriangle, danger: XCircle };

export interface AlertCardProps {
  readonly title: string;
  readonly description: string;
  readonly severity: AlertCardSeverity;
  readonly count: number;
  readonly items?: readonly string[];
}

/**
 * Cartão de um alerta operacional derivado de dado real (contagem + lista opcional dos itens
 * afetados) — distinto de `Alert` (UX-001, mensagem de resultado de uma ação) por representar um
 * estado observado do domínio, persistente enquanto a condição existir, nunca uma notificação de
 * uma única operação. Primeiro uso no Inventory Workspace (FUN-105, Alertas) — cada instância desta
 * Sprint é sempre derivada de uma contagem real sobre `ProductWorkspaceSnapshot`, nunca inventada.
 */
export function AlertCard({ title, description, severity, count, items }: AlertCardProps) {
  const Icon = ICON[severity];

  return (
    <div className={`alert-card alert-card--${severity}`}>
      <div className="alert-card__header">
        <Icon size={18} aria-hidden="true" />
        <strong>{title}</strong>
        <span className="alert-card__count">{count}</span>
      </div>
      <p className="alert-card__description">{description}</p>
      {items && items.length > 0 && (
        <ul className="alert-card__items">
          {items.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
          {items.length > 5 && <li>+{items.length - 5} outro(s)</li>}
        </ul>
      )}
    </div>
  );
}
