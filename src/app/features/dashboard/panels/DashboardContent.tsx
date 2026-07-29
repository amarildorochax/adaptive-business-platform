// DashboardContent.tsx
//
// Responsabilidade:
// Área de conteúdo do Dashboard — compõe o `DashboardToolbar` e o
// `DashboardGrid`. Ponto único onde `sections/` poderá, no futuro,
// agrupar widgets por categoria.

import { Stack } from '@/app/primitives';
import { DashboardToolbar } from './DashboardToolbar';
import { DashboardGrid } from './DashboardGrid';
import type { UseDashboardResult } from '../hooks';

export interface DashboardContentProps {
  dashboard: UseDashboardResult;
}

export function DashboardContent(props: DashboardContentProps) {
  const { dashboard } = props;

  return (
    <Stack gap={16}>
      <DashboardToolbar dashboard={dashboard} />
      <DashboardGrid dashboard={dashboard} />
    </Stack>
  );
}
