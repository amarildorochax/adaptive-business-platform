// Navigation.tsx
//
// Responsabilidade:
// Renderiza uma lista de `NavigationItem` destacando o item ativo (via
// `useNavigationState`). Não decide para onde navegar — isso é
// responsabilidade de quem usa este componente junto de um `<Link>` do
// roteador (ver `router/`); aqui, apenas a estrutura visual da lista.

import type { ReactNode } from 'react';
import type { NavigationItem } from '../navigation';
import { useNavigationState } from '../contexts/NavigationContext';

export interface NavigationProps {
  items: NavigationItem[];
  renderItem: (item: NavigationItem, isActive: boolean) => ReactNode;
}

export function Navigation(props: NavigationProps) {
  const { items, renderItem } = props;
  const { activeItemKey } = useNavigationState();

  return (
    <nav aria-label="Navegação principal">
      <ul>
        {items.map((item) => (
          <li key={item.key}>{renderItem(item, item.key === activeItemKey)}</li>
        ))}
      </ul>
    </nav>
  );
}
