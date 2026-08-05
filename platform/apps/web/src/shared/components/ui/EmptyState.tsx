import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/** Estado vazio padrão — nunca uma tela em branco sem explicação; usado por `AsyncState` e por qualquer lista/tabela sem itens. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="async-state async-state--empty">
      <span className="async-state__icon">{icon ?? <Inbox size={28} aria-hidden="true" />}</span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
