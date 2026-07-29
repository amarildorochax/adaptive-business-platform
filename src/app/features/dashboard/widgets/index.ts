// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos 15 widgets do Dashboard (8 da Sprint 28
// + 7 da Sprint 31). Também é quem popula `dashboardWidgetRegistry`
// (side effect deliberado, no import deste módulo) e expõe
// `widgetComponentMap` — a resolução id → componente de conteúdo,
// mantida FORA do serviço de registry para não criar um ciclo de import
// (ver comentário em `services/DashboardWidgetRegistry.ts`).
//
// Ordem de registro (Sprint 31 — rebalanceamento de layout): a ordem
// deste array é a ordem de renderização no `DashboardGrid` (que usa
// CSS Grid com fluxo automático, não as coordenadas `position.x/y` —
// essas continuam sendo apenas metadata reservada para uma futura
// persistência de layout). Os tamanhos (`size`) de cada widget foram
// ajustados para que cada linha do grid de 12 colunas feche
// exatamente: Overview (12) / Line+Donut (6+6) / RecentAct+Notif+Agenda
// (4+4+4) / Timeline+Pipeline (4+8) / TopDeals+MiniCharts (8+4) /
// Heatmap+QuickActions (8+4) / AIInsights+Performance (6+6) /
// SystemHealth (12).

import type { ComponentType } from 'react';
import { dashboardWidgetRegistry } from '../services';
import type { WidgetState } from '../types';

import { OverviewMetricsWidget, overviewMetricsDefinition } from './OverviewMetrics';
import { LineChartWidget, lineChartDefinition } from './LineChart';
import { DonutChartWidget, donutChartDefinition } from './DonutChart';
import { RecentActivitiesWidget, recentActivitiesDefinition } from './RecentActivities';
import { NotificationsWidget, notificationsDefinition } from './Notifications';
import { AgendaWidget, agendaDefinition } from './Agenda';
import { TimelineWidget, timelineDefinition } from './Timeline';
import { PipelineWidget, pipelineDefinition } from './Pipeline';
import { TopDealsTableWidget, topDealsDefinition } from './TopDealsTable';
import { MiniChartsWidget, miniChartsDefinition } from './MiniCharts';
import { HeatmapWidget, heatmapDefinition } from './Heatmap';
import { QuickActionsWidget, quickActionsDefinition } from './QuickActions';
import { AIInsightsWidget, aiInsightsDefinition } from './AIInsights';
import { PerformanceWidget, performanceDefinition } from './Performance';
import { SystemHealthWidget, systemHealthDefinition } from './SystemHealth';

export * from './OverviewMetrics';
export * from './LineChart';
export * from './DonutChart';
export * from './RecentActivities';
export * from './Notifications';
export * from './Agenda';
export * from './Timeline';
export * from './Pipeline';
export * from './TopDealsTable';
export * from './MiniCharts';
export * from './Heatmap';
export * from './QuickActions';
export * from './AIInsights';
export * from './Performance';
export * from './SystemHealth';

export const allWidgetDefinitions = [
  overviewMetricsDefinition,
  lineChartDefinition,
  donutChartDefinition,
  recentActivitiesDefinition,
  notificationsDefinition,
  agendaDefinition,
  timelineDefinition,
  pipelineDefinition,
  topDealsDefinition,
  miniChartsDefinition,
  heatmapDefinition,
  quickActionsDefinition,
  aiInsightsDefinition,
  performanceDefinition,
  systemHealthDefinition,
];

export interface WidgetRendererProps {
  state: WidgetState;
  onRefresh: () => void;
}

// Cada widget aceita um `WidgetState<T>` específico do seu próprio dado
// mock — o cast abaixo apenas unifica a assinatura para armazenamento
// heterogêneo neste mapa; cada widget continua fortemente tipado em seu
// próprio arquivo.
export const widgetComponentMap: Record<string, ComponentType<WidgetRendererProps>> = {
  [overviewMetricsDefinition.id]: OverviewMetricsWidget as ComponentType<WidgetRendererProps>,
  [lineChartDefinition.id]: LineChartWidget as ComponentType<WidgetRendererProps>,
  [donutChartDefinition.id]: DonutChartWidget as ComponentType<WidgetRendererProps>,
  [recentActivitiesDefinition.id]: RecentActivitiesWidget as ComponentType<WidgetRendererProps>,
  [notificationsDefinition.id]: NotificationsWidget as ComponentType<WidgetRendererProps>,
  [agendaDefinition.id]: AgendaWidget as ComponentType<WidgetRendererProps>,
  [timelineDefinition.id]: TimelineWidget as ComponentType<WidgetRendererProps>,
  [pipelineDefinition.id]: PipelineWidget as ComponentType<WidgetRendererProps>,
  [topDealsDefinition.id]: TopDealsTableWidget as ComponentType<WidgetRendererProps>,
  [miniChartsDefinition.id]: MiniChartsWidget as ComponentType<WidgetRendererProps>,
  [heatmapDefinition.id]: HeatmapWidget as ComponentType<WidgetRendererProps>,
  [quickActionsDefinition.id]: QuickActionsWidget as ComponentType<WidgetRendererProps>,
  [aiInsightsDefinition.id]: AIInsightsWidget as ComponentType<WidgetRendererProps>,
  [performanceDefinition.id]: PerformanceWidget as ComponentType<WidgetRendererProps>,
  [systemHealthDefinition.id]: SystemHealthWidget as ComponentType<WidgetRendererProps>,
};

dashboardWidgetRegistry.registerMany(allWidgetDefinitions);
