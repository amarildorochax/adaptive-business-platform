// DashboardMockService.ts
//
// Responsabilidade:
// Simula a busca assíncrona de dados de cada widget (delay artificial +
// dado de `mocks/`), no formato que uma futura integração real com o
// Core deveria respeitar. Nenhuma chamada de rede ou ao Core ocorre
// aqui — apenas `mocks/*`.
//
// Substituição futura: quando um widget for conectado a um módulo real
// do Core, o método correspondente deste serviço (ou um equivalente)
// passa a chamar a fachada pública do Core em vez de `mocks/*`,
// preservando a mesma assinatura `Promise<Data>` consumida por
// `useWidgets`.

import {
  generateOverviewMetrics,
  generateRecentActivities,
  generateNotifications,
  generateAgenda,
  generateQuickActions,
  generateAIInsights,
  generatePerformanceSeries,
  generateSystemPerformance,
  generateSystemHealth,
  generateLineChartSeries,
  generateDonutSegments,
  generateTimeline,
  generatePipelineStages,
  generateTopDeals,
  generateMiniCharts,
  generateHeatmap,
} from '../mocks';

const DEFAULT_DELAY_MS = 350;

function delay<Data>(value: Data, ms: number = DEFAULT_DELAY_MS): Promise<Data> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}

export class DashboardMockService {
  async fetchWidgetData<Data>(widgetId: string): Promise<Data> {
    switch (widgetId) {
      case 'overview-metrics':
        return delay(generateOverviewMetrics() as unknown as Data);
      case 'recent-activities':
        return delay(generateRecentActivities() as unknown as Data);
      case 'notifications':
        return delay(generateNotifications() as unknown as Data);
      case 'agenda':
        return delay(generateAgenda() as unknown as Data);
      case 'quick-actions':
        return delay(generateQuickActions() as unknown as Data);
      case 'ai-insights':
        return delay(generateAIInsights() as unknown as Data);
      case 'performance':
        return delay({ series: generatePerformanceSeries(), system: generateSystemPerformance() } as unknown as Data);
      case 'system-health':
        return delay(generateSystemHealth() as unknown as Data);
      case 'line-chart':
        return delay(generateLineChartSeries() as unknown as Data);
      case 'donut-chart':
        return delay(generateDonutSegments() as unknown as Data);
      case 'timeline':
        return delay(generateTimeline() as unknown as Data);
      case 'pipeline':
        return delay(generatePipelineStages() as unknown as Data);
      case 'top-deals':
        return delay(generateTopDeals() as unknown as Data);
      case 'mini-charts':
        return delay(generateMiniCharts() as unknown as Data);
      case 'heatmap':
        return delay(generateHeatmap() as unknown as Data);
      default:
        throw new Error(`DashboardMockService: nenhum dado mock registrado para o widget "${widgetId}".`);
    }
  }
}

/** Instância única e compartilhada do serviço de dados mock do Dashboard. */
export const dashboardMockService = new DashboardMockService();
