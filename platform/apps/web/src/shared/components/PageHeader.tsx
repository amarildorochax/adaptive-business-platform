import type { ReactNode } from "react";

export interface PageHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}

/** Cabeçalho único de topo de página — reutilizado por toda página de domínio, nunca reimplementado página a página. `actions` (UX-001) é opcional — nenhuma página existente precisou passar a fornecê-lo. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__heading">
        <h1>{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
