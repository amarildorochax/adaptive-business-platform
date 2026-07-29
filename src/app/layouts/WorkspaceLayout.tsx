// WorkspaceLayout.tsx
//
// Responsabilidade:
// Layout para telas com escopo de workspace — envolve o `AppLayout` com
// um `WorkspaceProvider` próprio, isolando o estado de "workspace atual"
// para a subárvore de rotas que o utiliza.

import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, type AppShellProps } from '../shell';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';

export interface WorkspaceLayoutProps extends Omit<AppShellProps, 'children'> {
  children?: ReactNode;
  defaultWorkspaceId?: string | null;
}

export function WorkspaceLayout(props: WorkspaceLayoutProps) {
  const { children, defaultWorkspaceId, ...shellProps } = props;

  return (
    <WorkspaceProvider defaultWorkspaceId={defaultWorkspaceId}>
      <AppShell {...shellProps}>{children ?? <Outlet />}</AppShell>
    </WorkspaceProvider>
  );
}
