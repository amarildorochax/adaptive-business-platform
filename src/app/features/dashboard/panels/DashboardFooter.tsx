// DashboardFooter.tsx
//
// Responsabilidade:
// Rodapé específico do Dashboard — exibe a contagem de widgets visíveis.
// Distinto de `@/app/shell/Footer` (rodapé global da aplicação).

import { Text } from '@/app/primitives';
import type { UseDashboardResult } from '../hooks';

export interface DashboardFooterProps {
  dashboard: UseDashboardResult;
}

export function DashboardFooter(props: DashboardFooterProps) {
  const { dashboard } = props;
  const visibleCount = dashboard.layout.snapshot.entries.filter((entry) => entry.visible).length;

  return (
    <footer>
      <Text variant="caption" color="var(--ads-color-text-secondary)">
        {visibleCount} de {dashboard.definitions.length} widgets visíveis.
      </Text>
    </footer>
  );
}
