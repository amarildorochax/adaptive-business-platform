// PerformanceWidget.tsx
//
// Responsabilidade:
// Widget mock "Performance" — série semanal (barras simples, sem
// biblioteca de gráficos) + KPIs de sistema (Sprint 31: CPU, Memória,
// Latência, Eventos/minuto, via componente `Progress` do Design
// System para os percentuais). Dado 100% simulado
// (`mocks/performance.mock`); nenhum acesso ao Core.

import { WidgetFrame } from '../../components';
import { Progress } from '@/design-system/components';
import { Flex, Grid, Stack, Text } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { PerformanceSeriesPoint, SystemPerformanceSnapshot } from '../../mocks';

export const performanceDefinition: WidgetDefinition = {
  id: 'performance',
  title: 'Desempenho',
  description: 'Desempenho da semana e indicadores de sistema (simulado).',
  icon: 'chevron-up',
  size: 'lg',
  position: { x: 4, y: 6, w: 6, h: 2 },
  permissions: {},
  refreshPolicy: { mode: 'interval', intervalMs: 45000 },
};

export interface PerformanceWidgetData {
  series: PerformanceSeriesPoint[];
  system: SystemPerformanceSnapshot;
}

export interface PerformanceWidgetProps {
  state: WidgetState<PerformanceWidgetData>;
  onRefresh: () => void;
}

export function PerformanceWidget(props: PerformanceWidgetProps) {
  const { state, onRefresh } = props;
  const points = state.data?.series ?? [];
  const system = state.data?.system;
  const max = Math.max(1, ...points.map((point) => point.value));

  return (
    <WidgetFrame definition={performanceDefinition} state={state} onRefresh={onRefresh}>
      <Stack gap={16}>
        <Flex align="flex-end" gap={8} style={{ height: 96 }}>
          {points.map((point) => (
            <Flex key={point.label} direction="column" align="center" gap={4}>
              <div
                style={{
                  width: 24,
                  height: `${(point.value / max) * 80}px`,
                  backgroundColor: 'var(--ads-color-primary)',
                  borderRadius: 4,
                }}
              />
              <Text variant="caption">{point.label}</Text>
            </Flex>
          ))}
        </Flex>

        {system && (
          <Grid columns={2} gap={12}>
            <Stack gap={4}>
              <Text variant="caption">CPU</Text>
              <Progress value={system.cpuPercent} aria-label="Uso de CPU" />
            </Stack>
            <Stack gap={4}>
              <Text variant="caption">Memória</Text>
              <Progress value={system.memoryPercent} aria-label="Uso de memória" />
            </Stack>
            <Stack gap={4}>
              <Text variant="caption">Latência</Text>
              <Text variant="body" style={{ fontWeight: 700 }}>
                {system.latencyMs} ms
              </Text>
            </Stack>
            <Stack gap={4}>
              <Text variant="caption">Eventos/min</Text>
              <Text variant="body" style={{ fontWeight: 700 }}>
                {system.eventsPerMinute}
              </Text>
            </Stack>
          </Grid>
        )}
      </Stack>
    </WidgetFrame>
  );
}
