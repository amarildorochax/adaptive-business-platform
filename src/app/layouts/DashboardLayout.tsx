// DashboardLayout.tsx
//
// Responsabilidade:
// Layout para telas de dashboard — `AppShell` completo com o conteúdo
// limitado por um `Container` de largura `wide`. Não implementa nenhum
// dashboard real (isso é a Sprint 28); apenas a moldura estrutural.

import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, type AppShellProps } from '../shell';
import { Container } from '../primitives';

export interface DashboardLayoutProps extends Omit<AppShellProps, 'children'> {
  children?: ReactNode;
}

export function DashboardLayout(props: DashboardLayoutProps) {
  const { children, ...shellProps } = props;

  return (
    <AppShell {...shellProps}>
      <Container maxWidth="wide">{children ?? <Outlet />}</Container>
    </AppShell>
  );
}
