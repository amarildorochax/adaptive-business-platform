// OverviewMetricsWidget.tsx
//
// Responsabilidade:
// Widget mock "Overview Metrics" — os "Cards Superiores" do Dashboard.
// Dado 100% simulado (`mocks/overviewMetrics.mock`); nenhum acesso ao
// Core.
//
// Sprint 31 (evolução visual — "Cards Superiores"): cada métrica agora
// é seu próprio `Card` (ícone, valor, variação percentual, período, cor
// temática via `Badge`, hover via `Card elevated`, tooltip via
// `Tooltip`) — usando apenas componentes já existentes do Adaptive
// Design System, sem alterá-lo.

import { WidgetFrame } from '../../components';
import { Card, Badge, Tooltip } from '@/design-system/components';
import { Grid, Flex, Text, Heading, Icon } from '@/app/primitives';
import type { WidgetDefinition, WidgetState } from '../../types';
import type { OverviewMetric } from '../../mocks';

export const overviewMetricsDefinition: WidgetDefinition = {
  id: 'overview-metrics',
  title: 'Visão Geral',
  description: 'Indicadores gerais do negócio.',
  icon: 'info',
  size: 'full',
  position: { x: 0, y: 0, w: 12, h: 1 },
  permissions: {},
  refreshPolicy: { mode: 'interval', intervalMs: 60000 },
};

export interface OverviewMetricsWidgetProps {
  state: WidgetState<OverviewMetric[]>;
  onRefresh: () => void;
}

export function OverviewMetricsWidget(props: OverviewMetricsWidgetProps) {
  const { state, onRefresh } = props;

  return (
    <WidgetFrame definition={overviewMetricsDefinition} state={state} onRefresh={onRefresh}>
      <Grid columns={4} gap={16}>
        {(state.data ?? []).map((metric) => (
          <Tooltip key={metric.id} content={`${metric.label} — ${metric.period}`}>
            <Card elevated>
              <Flex justify="space-between" align="center">
                <Icon name={metric.icon} size={20} aria-label={metric.label} />
                <Badge variant={metric.variant}>
                  {metric.changePercent >= 0 ? '+' : ''}
                  {metric.changePercent}%
                </Badge>
              </Flex>
              <Text variant="caption" color="var(--ads-color-text-secondary)">
                {metric.label}
              </Text>
              <Heading level={3} variant="heading">
                {metric.value}
              </Heading>
              <Text variant="caption" color="var(--ads-color-text-secondary)">
                {metric.period}
              </Text>
            </Card>
          </Tooltip>
        ))}
      </Grid>
    </WidgetFrame>
  );
}
