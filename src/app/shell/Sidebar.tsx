// Sidebar.tsx
//
// Responsabilidade:
// Estrutura arquitetural da Sidebar do Shell — consome `useSidebar` para
// saber se está colapsada e renderiza o conteúdo de navegação recebido
// via `children` (normalmente um `<Navigation>`). Sem identidade visual
// definitiva.

import type { ReactNode } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

export interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar(props: SidebarProps) {
  const { children } = props;
  const { collapsed } = useSidebar();

  return (
    <aside aria-label="Barra lateral" data-collapsed={collapsed}>
      {children}
    </aside>
  );
}
