// QuickActionsWidget.tsx
//
// Responsabilidade:
// Widget mock "Quick Actions" — atalhos de ação. Nenhum botão dispara
// uma ação real nesta Sprint (nenhum acesso ao Core); apenas exibe o
// contrato de rótulo/descrição vindo de `mocks/quickActions.mock`.

import { WidgetFrame } from '../../components';
import { Stack, Flex } from '@/app/primitives';
import { Button } from '@/design-system/components';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { QuickAction } from '../../mocks';

export const quickActionsDefinition: WidgetDefinition = {
  id: 'quick-actions',
  title: 'Ações Rápidas',
  description: 'Atalhos para as ações mais usadas.',
  icon: 'check',
  size: 'md',
  position: { x: 8, y: 2, w: 4, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface QuickActionsWidgetProps {
  state: WidgetState<QuickAction[]>;
  onRefresh: () => void;
}

export function QuickActionsWidget(props: QuickActionsWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={quickActionsDefinition} state={state} onRefresh={onRefresh}>
      <Stack gap={8}>
        {(state.data ?? []).map((action) => (
          <Flex key={action.id} direction="column">
            <Button variant="secondary" size="sm">
              <span title={action.description}>{action.label}</span>
            </Button>
          </Flex>
        ))}
      </Stack>
    </WidgetFrame>
  );
}
