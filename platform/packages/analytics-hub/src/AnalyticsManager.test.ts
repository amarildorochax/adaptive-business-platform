import { describe, expect, it } from 'vitest';
import { AggregationService } from './AggregationService';
import { AnalyticalRecommendationService } from './AnalyticalRecommendationService';
import { AnalyticsEventIngestionService } from './AnalyticsEventIngestionService';
import { AnalyticsManager } from './AnalyticsManager';
import { DashboardService } from './DashboardService';
import { DatasetService } from './DatasetService';
import { ForecastService } from './ForecastService';
import { InsightService } from './InsightService';
import { KPIService } from './KPIService';
import { MetricService } from './MetricService';
import { ReportService } from './ReportService';
import { ReportTemplateService } from './ReportTemplateService';
import { SnapshotService } from './SnapshotService';
import { TimeSeriesService } from './TimeSeriesService';
import { TrendService } from './TrendService';
import { VisualizationService } from './VisualizationService';
import { WidgetService } from './WidgetService';
import {
  FakeAggregationRepository,
  FakeAnalyticalRecommendationRepository,
  FakeAnalyticsEventIngestionRepository,
  FakeDashboardRepository,
  FakeDatasetRepository,
  FakeForecastRepository,
  FakeInsightRepository,
  FakeKPIRepository,
  FakeMetricRepository,
  FakeReportRepository,
  FakeReportTemplateRepository,
  FakeSnapshotRepository,
  FakeTimeSeriesRepository,
  FakeTrendRepository,
  FakeVisualizationRepository,
  FakeWidgetRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const metricRepository = new FakeMetricRepository();

  return new AnalyticsManager({
    datasets: new DatasetService(new FakeDatasetRepository()),
    eventIngestions: new AnalyticsEventIngestionService(new FakeAnalyticsEventIngestionRepository()),
    aggregations: new AggregationService(new FakeAggregationRepository()),
    metrics: new MetricService(metricRepository),
    kpis: new KPIService(new FakeKPIRepository(), metricRepository),
    dashboards: new DashboardService(new FakeDashboardRepository()),
    widgets: new WidgetService(new FakeWidgetRepository()),
    snapshots: new SnapshotService(new FakeSnapshotRepository()),
    timeSeries: new TimeSeriesService(new FakeTimeSeriesRepository()),
    trends: new TrendService(new FakeTrendRepository()),
    forecasts: new ForecastService(new FakeForecastRepository()),
    insights: new InsightService(new FakeInsightRepository()),
    recommendations: new AnalyticalRecommendationService(new FakeAnalyticalRecommendationRepository()),
    reportTemplates: new ReportTemplateService(new FakeReportTemplateRepository()),
    reports: new ReportService(new FakeReportRepository()),
    visualizations: new VisualizationService(new FakeVisualizationRepository()),
  });
}

describe('AnalyticsManager — Analytics Core', () => {
  it('createDashboard produz o Command CreateDashboard e o Event DashboardCreated', async () => {
    const manager = buildManager();

    const operation = await manager.createDashboard('tenant-1', 'Executive Dashboard');

    expect(operation.result.archived).toBe(false);
    expect(operation.command?.type).toBe('CreateDashboard');
    expect(operation.events.map((e) => e.type)).toEqual(['DashboardCreated']);
  });

  it('updateDashboard adiciona um Widget e produz DashboardUpdated', async () => {
    const manager = buildManager();
    const { result: dashboard } = await manager.createDashboard('tenant-1', 'Dashboard');

    const operation = await manager.updateDashboard(dashboard.dashboardId, 'metric-1', 'Receita do mês');

    expect(operation.result.dashboard.widgetIds).toContain(operation.result.widget.widgetId);
    expect(operation.command?.type).toBe('UpdateDashboard');
    expect(operation.events.map((e) => e.type)).toEqual(['DashboardUpdated']);
  });

  it('archiveDashboard reutiliza o Event DashboardUpdated — nenhum Evento dedicado existe para arquivamento', async () => {
    const manager = buildManager();
    const { result: dashboard } = await manager.createDashboard('tenant-1', 'Dashboard');

    const operation = await manager.archiveDashboard(dashboard.dashboardId);

    expect(operation.result.archived).toBe(true);
    expect(operation.command?.type).toBe('ArchiveDashboard');
    expect(operation.events.map((e) => e.type)).toEqual(['DashboardUpdated']);
  });

  it('fluxo Dataset → Aggregation → Metric → KPI → Dashboard', async () => {
    const manager = buildManager();

    const { result: created } = await manager.createDataset('tenant-1');
    const { result: refreshed } = await manager.refreshDataset(created.datasetId, 'CRM', 'OpportunityWon');
    expect(refreshed.dataset.datasetId).toBe(created.datasetId);

    const aggregation = await manager.processAggregation(refreshed.dataset.datasetId);
    expect(aggregation.datasetId).toBe(refreshed.dataset.datasetId);

    const metricOperation = await manager.calculateMetric(
      { tenantId: 'tenant-1', datasetId: refreshed.dataset.datasetId, formula: 'sum(deals)', windowStart: new Date(), windowEnd: new Date(), name: 'Receita' },
      1000,
    );
    expect(metricOperation.command?.type).toBe('CalculateMetric');
    expect(metricOperation.events.map((e) => e.type)).toEqual(['MetricCalculated']);

    const kpiOperation = await manager.calculateKPI('tenant-1', [metricOperation.result.metricId]);
    expect(kpiOperation.result.value).toBe(1000);
    expect(kpiOperation.events.map((e) => e.type)).toEqual(['KPIUpdated']);

    const { result: dashboard } = await manager.createDashboard('tenant-1', 'Dashboard Financeiro');
    const widgetOperation = await manager.updateDashboard(dashboard.dashboardId, kpiOperation.result.kpiId, 'Receita Consolidada');
    expect(widgetOperation.result.widget.sourceId).toBe(kpiOperation.result.kpiId);
  });

  it('fluxo TimeSeries → Trend → Forecast → Insight → Recommendation', async () => {
    const manager = buildManager();

    const first = await manager.createSnapshot('metric-1', 100, 'metric-1');
    const second = await manager.createSnapshot('metric-1', 200, 'metric-1');
    expect(first.events.map((e) => e.type)).toEqual(['SnapshotCreated']);
    expect(second.result.timeSeries?.snapshotIds).toHaveLength(2);

    const trendOperation = await manager.generateTrend('metric-1');
    expect(trendOperation.result.direction).toBe('up');
    expect(trendOperation.events.map((e) => e.type)).toEqual(['TrendIdentified']);

    const forecastOperation = await manager.generateForecast(trendOperation.result, 200);
    expect(forecastOperation.command?.type).toBe('GenerateForecast');
    expect(forecastOperation.events.map((e) => e.type)).toEqual(['ForecastGenerated']);

    const insightOperation = await manager.generateInsight('tenant-1', 'dataset-1', trendOperation.result);
    expect(insightOperation.events.map((e) => e.type)).toEqual(['InsightGenerated']);

    if (insightOperation.result.severity !== 'low') {
      const recommendationOperation = await manager.generateRecommendation(insightOperation.result);
      expect(recommendationOperation.result.confirmed).toBe(false);
      expect(recommendationOperation.events.map((e) => e.type)).toEqual(['RecommendationGenerated']);
    }
  });

  it('generateInsight falha para um Trend "stable" — nenhuma anomalia a reportar', async () => {
    const manager = buildManager();
    await manager.createSnapshot('metric-1', 100, 'metric-1');
    await manager.createSnapshot('metric-1', 100, 'metric-1');
    const trendOperation = await manager.generateTrend('metric-1');

    await expect(manager.generateInsight('tenant-1', 'dataset-1', trendOperation.result)).rejects.toThrow();
  });

  it('generateReport produz ReportGenerated a partir de um Report Template já existente', async () => {
    const manager = buildManager();
    const { result: reportTemplate } = await manager.createReportTemplate('tenant-1', 'Relatório Mensal');
    const { result: metric } = await manager.calculateMetric(
      { tenantId: 'tenant-1', datasetId: 'dataset-1', formula: 'sum(deals)', windowStart: new Date(), windowEnd: new Date(), name: 'Receita' },
      500,
    );

    const operation = await manager.generateReport('tenant-1', reportTemplate.reportTemplateId, [metric.metricId], 'Relatório de Agosto');

    expect(operation.result.summary).toContain('1 Metric');
    expect(operation.command?.type).toBe('GenerateReport');
    expect(operation.events.map((e) => e.type)).toEqual(['ReportGenerated']);
  });

  it('generateReport falha quando o Report Template não existe', async () => {
    const manager = buildManager();

    await expect(manager.generateReport('tenant-1', 'template-inexistente', [])).rejects.toThrow();
  });

  it('publishVisualization produz VisualizationPublished', async () => {
    const manager = buildManager();

    const operation = await manager.publishVisualization('metric-1');

    expect(operation.command?.type).toBe('PublishVisualization');
    expect(operation.events.map((e) => e.type)).toEqual(['VisualizationPublished']);
  });

  it('refreshAnalytics aciona RefreshDataset para todo Dataset do Tenant, emitindo um DatasetRefreshed por Dataset', async () => {
    const manager = buildManager();
    const { result: datasetA } = await manager.createDataset('tenant-1');
    const { result: datasetB } = await manager.createDataset('tenant-1');
    await manager.refreshDataset(datasetA.datasetId, 'Finance', 'InvoicePaid');
    await manager.refreshDataset(datasetB.datasetId, 'Growth', 'CampaignCreated');

    const operation = await manager.refreshAnalytics('tenant-1');

    expect(operation.command?.type).toBe('RefreshAnalytics');
    expect(operation.result).toHaveLength(2);
    expect(operation.events.map((e) => e.type)).toEqual(['DatasetRefreshed', 'DatasetRefreshed']);
  });
});
