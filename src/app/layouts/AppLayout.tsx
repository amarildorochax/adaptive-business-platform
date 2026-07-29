// AppLayout.tsx
//
// Responsabilidade:
// Layout padrão da aplicação — envolve o conteúdo com o `AppShell`
// completo (Header/Sidebar/Footer). Funciona tanto como Layout Route do
// `AppRouter` (renderiza `<Outlet/>`) quanto como wrapper standalone
// (renderiza `children`, se fornecido).

import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, type AppShellProps } from '../shell';

export interface AppLayoutProps extends Omit<AppShellProps, 'children'> {
  children?: ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children, ...shellProps } = props;

  return <AppShell {...shellProps}>{children ?? <Outlet />}</AppShell>;
}
