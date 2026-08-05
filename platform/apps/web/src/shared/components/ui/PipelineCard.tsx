import type { ReactNode } from "react";

export interface PipelineCardMeta {
  readonly label: string;
  readonly value: string;
}

export interface PipelineCardProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly value?: string;
  readonly meta: readonly PipelineCardMeta[];
  readonly badge?: ReactNode;
  readonly actions?: ReactNode;
}

/**
 * Cartão genérico de um item de Kanban — título, subtítulo, valor de destaque, lista de metadados
 * (rótulo/valor) e ações opcionais. Primeiro uso no Pipeline do CRM Workspace (FUN-103, um cartão por
 * Opportunity), genérico para qualquer quadro Kanban futuro.
 */
export function PipelineCard({ title, subtitle, value, meta, badge, actions }: PipelineCardProps) {
  return (
    <div className="pipeline-card">
      <div className="pipeline-card__header">
        <strong>{title}</strong>
        {badge}
      </div>
      {subtitle && <p className="pipeline-card__subtitle">{subtitle}</p>}
      {value && <p className="pipeline-card__value">{value}</p>}
      {meta.length > 0 && (
        <dl className="pipeline-card__meta">
          {meta.map((entry) => (
            <div key={entry.label}>
              <dt>{entry.label}</dt>
              <dd>{entry.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {actions && <div className="pipeline-card__actions">{actions}</div>}
    </div>
  );
}
