// DashboardToolbar.tsx
//
// Responsabilidade:
// Barra de ações do Dashboard — atualizar todos os widgets
// (`refreshAll`, real e funcional contra `DashboardMockService`) e
// exibir o horário da última atualização. Nenhuma ação chama o Core.

import { Flex, Text } from '@/app/primitives';
import { Button } from '@/design-system/components';
import type { UseDashboardResult } from '../hooks';

export interface DashboardToolbarProps {
  dashboard: UseDashboardResult;
}

function mostRecentUpdate(states: UseDashboardResult['states']): string | null {
  const timestamps = Object.values(states)
    .map((state) => state.lastUpdatedAt)
    .filter((value): value is string => value !== null);

  if (timestamps.length === 0) return null;

  const sorted = [...timestamps].sort();
  return sorted[sorted.length - 1];
}

export function DashboardToolbar(props: DashboardToolbarProps) {
  const { dashboard } = props;
  const lastUpdate = mostRecentUpdate(dashboard.states);

  return (
    <Flex justify="space-between" align="center">
      <Text variant="caption" color="var(--ads-color-text-secondary)">
        {lastUpdate ? `Última atualização: ${new Date(lastUpdate).toLocaleTimeString('pt-BR')}` : 'Carregando…'}
      </Text>
      <Button variant="primary" size="sm" onClick={() => dashboard.refreshAll()}>
        Atualizar tudo
      </Button>
    </Flex>
  );
}
