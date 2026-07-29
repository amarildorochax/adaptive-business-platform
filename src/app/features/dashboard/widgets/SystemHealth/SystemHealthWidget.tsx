// SystemHealthWidget.tsx
//
// Responsabilidade:
// Widget mock "Saúde do Sistema" — status simulado de subsistemas. Não
// consulta a Observability real do Core; dado 100% simulado
// (`mocks/systemHealth.mock`).
//
// Sprint 31D: `SystemHealthStatus` ('operational'/'degraded'/'down') é
// um identificador técnico interno, nunca exibido cru — `STATUS_LABEL`
// traduz cada valor para o rótulo em Português mostrado no `Badge`.

import { WidgetFrame } from '../../components';
import { Badge } from '@/design-system/components';
import { Flex } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { SystemHealthCheck, SystemHealthStatus } from '../../mocks';
import type { ComponentVariant } from '@/design-system/types';

export const systemHealthDefinition: WidgetDefinition = {
  id: 'system-health',
  title: 'Saúde do Sistema',
  description: 'Status simulado dos subsistemas da plataforma.',
  icon: 'spinner',
  size: 'full',
  position: { x: 0, y: 6, w: 12, h: 1 },
  permissions: {},
  refreshPolicy: { mode: 'interval', intervalMs: 20000 },
};

const VARIANT_BY_STATUS: Record<SystemHealthStatus, ComponentVariant> = {
  operational: 'success',
  degraded: 'warning',
  down: 'danger',
};

const STATUS_LABEL: Record<SystemHealthStatus, string> = {
  operational: 'Operacional',
  degraded: 'Degradado',
  down: 'Fora do ar',
};

export interface SystemHealthWidgetProps {
  state: WidgetState<SystemHealthCheck[]>;
  onRefresh: () => void;
}

export function SystemHealthWidget(props: SystemHealthWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={systemHealthDefinition} state={state} onRefresh={onRefresh}>
      <Flex gap={16} wrap>
        {(state.data ?? []).map((check) => (
          <Flex key={check.id} align="center" gap={8}>
            <span>{check.name}</span>
            <Badge variant={VARIANT_BY_STATUS[check.status]}>{STATUS_LABEL[check.status]}</Badge>
          </Flex>
        ))}
      </Flex>
    </WidgetFrame>
  );
}
