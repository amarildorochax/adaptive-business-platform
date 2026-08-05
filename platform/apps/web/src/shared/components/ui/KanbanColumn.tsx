import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "./Badge";

export interface KanbanColumnProps {
  readonly title: string;
  readonly count: number;
  readonly tone?: BadgeTone;
  readonly children: ReactNode;
}

/**
 * Coluna genérica de um quadro Kanban — cabeçalho com título e contagem, corpo com os cartões
 * (tipicamente `PipelineCard`). Primeiro uso no Pipeline do CRM Workspace (FUN-103), genérico para
 * qualquer quadro Kanban futuro (ex.: Workflow do Automation Engine).
 */
export function KanbanColumn({ title, count, tone = "neutral", children }: KanbanColumnProps) {
  return (
    <div className="kanban-column">
      <div className="kanban-column__header">
        <h3>{title}</h3>
        <Badge tone={tone}>{count}</Badge>
      </div>
      <div className="kanban-column__body">{children}</div>
    </div>
  );
}
