// PipelineWidget.tsx
//
// Responsabilidade:
// Widget mock "Pipeline" — estágios Solicitada/Planejada/Aprovada/
// Executada, puramente visual (sem lógica de negócio). Dado 100%
// simulado; nenhum acesso ao Core.

import { WidgetFrame } from '../../components';
import { Flex, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { PipelineStage } from '../../mocks';

export const pipelineDefinition: WidgetDefinition = {
  id: 'pipeline',
  title: 'Pipeline',
  description: 'Distribuição por estágio (simulado).',
  icon: 'chevron-right',
  size: 'xl',
  position: { x: 4, y: 2, w: 8, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface PipelineWidgetProps {
  state: WidgetState<PipelineStage[]>;
  onRefresh: () => void;
}

export function PipelineWidget(props: PipelineWidgetProps) {
  const { state, onRefresh } = props;
  const stages = state.data ?? [];
  const max = Math.max(1, ...stages.map((stage) => stage.count));

  return (
    <WidgetFrame definition={pipelineDefinition} state={state} onRefresh={onRefresh}>
      <Flex gap={16}>
        {stages.map((stage) => (
          <Flex key={stage.key} direction="column" align="center" gap={8} style={{ flex: 1 }}>
            <div
              style={{
                width: '100%',
                height: 8,
                borderRadius: 'var(--ads-radius-full)',
                backgroundColor: 'var(--ads-color-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(stage.count / max) * 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--ads-color-solid-primary)',
                }}
              />
            </div>
            <Text variant="caption" style={{ fontWeight: 700 }}>
              {stage.count}
            </Text>
            <Text variant="caption" color="var(--ads-color-text-secondary)">
              {stage.label}
            </Text>
          </Flex>
        ))}
      </Flex>
    </WidgetFrame>
  );
}
