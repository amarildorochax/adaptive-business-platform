// MiniChartsWidget.tsx
//
// Responsabilidade:
// Widget mock "Mini Gráficos" — pequenos sparklines em SVG puro. Dado
// 100% simulado; nenhum acesso ao Core.

import { WidgetFrame } from '../../components';
import { Flex, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { MiniChartMetric } from '../../mocks';

export const miniChartsDefinition: WidgetDefinition = {
  id: 'mini-charts',
  title: 'Mini Gráficos',
  description: 'Tendências rápidas da semana (simulado).',
  icon: 'chevron-up',
  size: 'md',
  position: { x: 8, y: 4, w: 4, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'manual' },
};

export interface MiniChartsWidgetProps {
  state: WidgetState<MiniChartMetric[]>;
  onRefresh: () => void;
}

const SPARK_WIDTH = 72;
const SPARK_HEIGHT = 24;

function buildSparklinePoints(trend: number[]): string {
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const range = max - min || 1;
  const step = SPARK_WIDTH / Math.max(1, trend.length - 1);

  return trend
    .map((value, index) => `${index * step},${SPARK_HEIGHT - ((value - min) / range) * SPARK_HEIGHT}`)
    .join(' ');
}

export function MiniChartsWidget(props: MiniChartsWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={miniChartsDefinition} state={state} onRefresh={onRefresh}>
      <Flex direction="column" gap={12}>
        {(state.data ?? []).map((metric) => (
          <Flex key={metric.id} justify="space-between" align="center">
            <div>
              <Text variant="caption">{metric.label}</Text>
              <Text variant="body" style={{ fontWeight: 700 }}>
                {metric.value}
              </Text>
            </div>
            <svg
              viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
              width={SPARK_WIDTH}
              height={SPARK_HEIGHT}
              role="img"
              aria-label={`Tendência de ${metric.label}`}
            >
              <polyline
                points={buildSparklinePoints(metric.trend)}
                fill="none"
                stroke="var(--ads-color-primary)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </Flex>
        ))}
      </Flex>
    </WidgetFrame>
  );
}
