// PipelineCard.tsx
//
// Responsabilidade:
// Cartão compacto de `Deal` para o quadro Kanban do Pipeline — mais
// enxuto que `DealCard` (sem título em cabeçalho de `CRMCard`), pensado
// para caber em uma `PipelineColumn` estreita.
//
// Sprint 33 (Adaptive CRM Workspace): ganhou Drag and Drop nativo
// (HTML5 Drag and Drop API — nenhuma biblioteca nova) via a prop opcional
// `draggable`. Comportamento por padrão (`draggable` ausente/falso)
// permanece idêntico ao da Sprint 32.

import { Card } from '@/design-system/components';
import { Stack, Flex, Text } from '@/app/primitives';
import type { Deal } from '../types/Deal';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export interface PipelineCardProps {
  deal: Deal;
  clientName?: string;
  draggable?: boolean;
  onClick?: () => void;
}

export function PipelineCard(props: PipelineCardProps) {
  const { deal, clientName, draggable, onClick } = props;

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? (event) => event.dataTransfer.setData('text/plain', deal.id) : undefined}
      onClick={onClick}
      style={{ cursor: draggable || onClick ? 'grab' : undefined }}
    >
      <Card elevated>
        <Stack gap={4}>
          <Text variant="body" style={{ fontWeight: 600 }}>
            {deal.title}
          </Text>
          {clientName && (
            <Text variant="caption" color="var(--ads-color-text-secondary)">
              {clientName}
            </Text>
          )}
          <Flex justify="space-between" align="center">
            <Text variant="caption" style={{ fontWeight: 600 }}>
              {formatCurrency(deal.value)}
            </Text>
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              {deal.probability}%
            </Text>
          </Flex>
        </Stack>
      </Card>
    </div>
  );
}
