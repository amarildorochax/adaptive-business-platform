// Breadcrumb.tsx
//
// Responsabilidade:
// Estrutura arquitetural do breadcrumb do Shell — recebe uma trilha de
// itens e os renderiza; não conhece a rota atual nem decide seu próprio
// conteúdo (isso é responsabilidade de quem monta a página, no futuro).

import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  key: string;
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  renderLink?: (item: BreadcrumbItem) => ReactNode;
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { items, renderLink } = props;

  return (
    <nav aria-label="Trilha de navegação">
      <ol>
        {items.map((item) => (
          <li key={item.key}>{renderLink ? renderLink(item) : item.label}</li>
        ))}
      </ol>
    </nav>
  );
}
