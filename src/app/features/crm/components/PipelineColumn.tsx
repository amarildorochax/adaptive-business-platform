// PipelineColumn.tsx
//
// Responsabilidade:
// Coluna do quadro Kanban do Pipeline — uma `CrmPipelineStage` e os
// `Deal`s posicionados nela. Continua puramente apresentacional: quem
// decide "para onde o negócio foi" é sempre a página chamadora (via
// `onDropDeal`) — esta coluna só relata o evento de soltar (drop) e
// aplica um destaque visual enquanto o arrasto passa por cima.
//
// Sprint 33 (Adaptive CRM Workspace): ganhou suporte a Drag and Drop
// (HTML5 nativo) via as props opcionais `onDropDeal`/`onCardClick`.
// Sem essas props, o comportamento é idêntico ao da Sprint 32.

import { useState } from 'react';
import { Flex, Stack, Text } from '@/app/primitives';
import { Badge } from '@/design-system/components';
import { PipelineCard } from './PipelineCard';
import type { CrmPipelineStage } from '../types/CrmPipelineStage';
import type { Deal } from '../types/Deal';
import type { Client } from '../types/Client';

export interface PipelineColumnProps {
  stage: CrmPipelineStage;
  deals: Deal[];
  clientsById: Map<string, Client>;
  onDropDeal?: (dealId: string, stageId: string) => void;
  onCardClick?: (deal: Deal) => void;
}

export function PipelineColumn(props: PipelineColumnProps) {
  const { stage, deals, clientsById, onDropDeal, onCardClick } = props;
  const variant = stage.isWon ? 'success' : stage.isLost ? 'danger' : 'neutral';
  const draggable = Boolean(onDropDeal);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={
        draggable
          ? (event) => {
              event.preventDefault();
              setDragOver(true);
            }
          : undefined
      }
      onDragLeave={draggable ? () => setDragOver(false) : undefined}
      onDrop={
        draggable
          ? (event) => {
              event.preventDefault();
              setDragOver(false);
              const dealId = event.dataTransfer.getData('text/plain');
              if (dealId) onDropDeal?.(dealId, stage.id);
            }
          : undefined
      }
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 260,
        backgroundColor: dragOver ? 'var(--ads-color-hover)' : 'var(--ads-color-surface)',
        borderRadius: 'var(--ads-radius-lg)',
        padding: 12,
        border: dragOver ? '1px dashed var(--ads-color-primary)' : '1px solid transparent',
      }}
    >
      <Flex justify="space-between" align="center">
        <Text variant="label" style={{ fontWeight: 600 }}>
          {stage.name}
        </Text>
        <Badge variant={variant}>{deals.length}</Badge>
      </Flex>
      <Stack gap={8}>
        {deals.map((deal) => (
          <PipelineCard
            key={deal.id}
            deal={deal}
            clientName={clientsById.get(deal.clientId)?.name}
            draggable={draggable}
            onClick={onCardClick ? () => onCardClick(deal) : undefined}
          />
        ))}
      </Stack>
    </div>
  );
}
