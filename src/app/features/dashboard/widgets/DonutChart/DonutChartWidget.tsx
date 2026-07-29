// DonutChartWidget.tsx
//
// Responsabilidade:
// Widget mock "Gráfico de Rosca" — renderizado com `conic-gradient`
// puro (sem biblioteca de gráficos). Dado 100% simulado; nenhum acesso
// ao Core.

import { WidgetFrame } from '../../components';
import { Flex, Stack, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { DonutSegment } from '../../mocks';

export const donutChartDefinition: WidgetDefinition = {
  id: 'donut-chart',
  title: 'Distribuição de Leads',
  description: 'Origem dos leads por canal (simulado).',
  icon: 'chevron-down',
  size: 'lg',
  position: { x: 6, y: 0, w: 6, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface DonutChartWidgetProps {
  state: WidgetState<DonutSegment[]>;
  onRefresh: () => void;
}

function buildConicGradient(segments: DonutSegment[]): string {
  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    cursor += segment.value;
    return `${segment.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export function DonutChartWidget(props: DonutChartWidgetProps) {
  const { state, onRefresh } = props;
  const segments = state.data ?? [];

  return (
    <WidgetFrame definition={donutChartDefinition} state={state} onRefresh={onRefresh}>
      <Flex align="center" gap={16}>
        <div
          role="img"
          aria-label="Gráfico de rosca de distribuição de leads por canal"
          style={{
            width: 96,
            height: 96,
            borderRadius: 'var(--ads-radius-full)',
            background: buildConicGradient(segments),
            flexShrink: 0,
          }}
        />
        <Stack gap={4}>
          {segments.map((segment) => (
            <Flex key={segment.id} align="center" gap={8}>
              <span
                aria-hidden="true"
                style={{ width: 8, height: 8, borderRadius: 'var(--ads-radius-full)', backgroundColor: segment.color }}
              />
              <Text variant="caption">
                {segment.label} — {segment.value}%
              </Text>
            </Flex>
          ))}
        </Stack>
      </Flex>
    </WidgetFrame>
  );
}
