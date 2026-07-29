// EmptyLayout.tsx
//
// Responsabilidade:
// Layout sem nenhuma estrutura de Shell — usado por páginas totalmente
// customizadas que não devem herdar Header/Sidebar/Footer.

import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

export interface EmptyLayoutProps {
  children?: ReactNode;
}

export function EmptyLayout(props: EmptyLayoutProps) {
  const { children } = props;
  return <>{children ?? <Outlet />}</>;
}
