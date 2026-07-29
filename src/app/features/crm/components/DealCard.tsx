// DealCard.tsx
//
// Responsabilidade:
// Resumo visual de um `Deal` — usado pela página "Negócios" (lista) e
// como base visual do `PipelineCard` (Kanban).

import { Stack, Flex, Text } from '@/app/primitives';
import { CRMCard } from './CRMCard';
import type { Deal } from '../types/Deal';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export interface DealCardProps {
  deal: Deal;
  clientName?: string;
}

export function DealCard(props: DealCardProps) {
  const { deal, clientName } = props;

  return (
    <CRMCard title={deal.title}>
      <Stack gap={8}>
        {clientName && (
          <Text variant="caption" color="var(--ads-color-text-secondary)">
            {clientName}
          </Text>
        )}
        <Flex justify="space-between" align="center">
          <Text variant="body" style={{ fontWeight: 600 }}>
            {formatCurrency(deal.value)}
          </Text>
          <Text variant="caption" color="var(--ads-color-text-auxiliary)">
            {deal.probability}% de chance
          </Text>
        </Flex>
        <Text variant="caption" color="var(--ads-color-text-auxiliary)">
          Fechamento previsto: {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}
        </Text>
      </Stack>
    </CRMCard>
  );
}
