import type { Aggregation } from '../Aggregation';
import type { AggregationRepository } from '../AggregationRepository';
import type { AnalyticalRecommendation } from '../AnalyticalRecommendation';
import type { AnalyticalRecommendationRepository } from '../AnalyticalRecommendationRepository';
import type { AnalyticsEventIngestion } from '../AnalyticsEventIngestion';
import type { AnalyticsEventIngestionRepository } from '../AnalyticsEventIngestionRepository';
import type { Dashboard } from '../Dashboard';
import type { DashboardRepository } from '../DashboardRepository';
import type { Dataset } from '../Dataset';
import type { DatasetRepository } from '../DatasetRepository';
import type { Forecast } from '../Forecast';
import type { ForecastRepository } from '../ForecastRepository';
import type { Insight } from '../Insight';
import type { InsightRepository } from '../InsightRepository';
import type { KPI } from '../KPI';
import type { KPIRepository } from '../KPIRepository';
import type { Metric } from '../Metric';
import type { MetricRepository } from '../MetricRepository';
import type { Report } from '../Report';
import type { ReportRepository } from '../ReportRepository';
import type { ReportTemplate } from '../ReportTemplate';
import type { ReportTemplateRepository } from '../ReportTemplateRepository';
import type { Snapshot } from '../Snapshot';
import type { SnapshotRepository } from '../SnapshotRepository';
import type { TimeSeries } from '../TimeSeries';
import type { TimeSeriesRepository } from '../TimeSeriesRepository';
import type { Trend } from '../Trend';
import type { TrendRepository } from '../TrendRepository';
import type { Visualization } from '../Visualization';
import type { VisualizationRepository } from '../VisualizationRepository';
import type { Widget } from '../Widget';
import type { WidgetRepository } from '../WidgetRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-008, Etapa de Testes). Mesmo padrão já usado
 * por `@abp/crm-hub` (IMP-002), `@abp/communication-hub` (IMP-003), `@abp/content-hub` (IMP-004),
 * `@abp/growth-hub` (IMP-005), `@abp/commerce-hub` (IMP-006) e `@abp/finance-hub` (IMP-007) — nunca
 * exportados pelo barrel do pacote, nunca referenciados por nenhum Service em produção.
 */

export class FakeDatasetRepository implements DatasetRepository {
  private readonly rows = new Map<string, Dataset>();
  async create(dataset: Dataset) {
    this.rows.set(dataset.datasetId, dataset);
    return dataset;
  }
  async update(dataset: Dataset) {
    this.rows.set(dataset.datasetId, dataset);
    return dataset;
  }
  async get(datasetId: string) {
    return this.rows.get(datasetId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((d) => d.tenantId === tenantId);
  }
}

export class FakeAnalyticsEventIngestionRepository implements AnalyticsEventIngestionRepository {
  private readonly rows: AnalyticsEventIngestion[] = [];
  async create(ingestion: AnalyticsEventIngestion) {
    this.rows.push(ingestion);
    return ingestion;
  }
  async listByDataset(datasetId: string) {
    return this.rows.filter((i) => i.datasetId === datasetId);
  }
}

export class FakeAggregationRepository implements AggregationRepository {
  private readonly rows: Aggregation[] = [];
  async create(aggregation: Aggregation) {
    this.rows.push(aggregation);
    return aggregation;
  }
  async listByDataset(datasetId: string) {
    return this.rows.filter((a) => a.datasetId === datasetId);
  }
}

export class FakeMetricRepository implements MetricRepository {
  private readonly rows = new Map<string, Metric>();
  async create(metric: Metric) {
    this.rows.set(metric.metricId, metric);
    return metric;
  }
  async update(metric: Metric) {
    this.rows.set(metric.metricId, metric);
    return metric;
  }
  async get(metricId: string) {
    return this.rows.get(metricId);
  }
  async list(datasetId: string) {
    return [...this.rows.values()].filter((m) => m.datasetId === datasetId);
  }
}

export class FakeKPIRepository implements KPIRepository {
  private readonly rows = new Map<string, KPI>();
  async create(kpi: KPI) {
    this.rows.set(kpi.kpiId, kpi);
    return kpi;
  }
  async update(kpi: KPI) {
    this.rows.set(kpi.kpiId, kpi);
    return kpi;
  }
  async get(kpiId: string) {
    return this.rows.get(kpiId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((k) => k.tenantId === tenantId);
  }
}

export class FakeDashboardRepository implements DashboardRepository {
  private readonly rows = new Map<string, Dashboard>();
  async create(dashboard: Dashboard) {
    this.rows.set(dashboard.dashboardId, dashboard);
    return dashboard;
  }
  async update(dashboard: Dashboard) {
    this.rows.set(dashboard.dashboardId, dashboard);
    return dashboard;
  }
  async get(dashboardId: string) {
    return this.rows.get(dashboardId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((d) => d.tenantId === tenantId);
  }
}

export class FakeWidgetRepository implements WidgetRepository {
  private readonly rows = new Map<string, Widget>();
  async create(widget: Widget) {
    this.rows.set(widget.widgetId, widget);
    return widget;
  }
  async get(widgetId: string) {
    return this.rows.get(widgetId);
  }
  async list(dashboardId: string) {
    return [...this.rows.values()].filter((w) => w.dashboardId === dashboardId);
  }
}

export class FakeSnapshotRepository implements SnapshotRepository {
  private readonly rows: Snapshot[] = [];
  async create(snapshot: Snapshot) {
    this.rows.push(snapshot);
    return snapshot;
  }
  async listByIndicator(indicatorId: string) {
    return this.rows.filter((s) => s.indicatorId === indicatorId);
  }
}

export class FakeTimeSeriesRepository implements TimeSeriesRepository {
  private readonly rows = new Map<string, TimeSeries>();
  async create(timeSeries: TimeSeries) {
    this.rows.set(timeSeries.timeSeriesId, timeSeries);
    return timeSeries;
  }
  async update(timeSeries: TimeSeries) {
    this.rows.set(timeSeries.timeSeriesId, timeSeries);
    return timeSeries;
  }
  async findByMetric(metricId: string) {
    return [...this.rows.values()].find((t) => t.metricId === metricId);
  }
}

export class FakeTrendRepository implements TrendRepository {
  private readonly rows: Trend[] = [];
  async create(trend: Trend) {
    this.rows.push(trend);
    return trend;
  }
  async listByTimeSeries(timeSeriesId: string) {
    return this.rows.filter((t) => t.timeSeriesId === timeSeriesId);
  }
}

export class FakeForecastRepository implements ForecastRepository {
  private readonly rows: Forecast[] = [];
  async create(forecast: Forecast) {
    this.rows.push(forecast);
    return forecast;
  }
  async listByTrend(trendId: string) {
    return this.rows.filter((f) => f.trendId === trendId);
  }
}

export class FakeInsightRepository implements InsightRepository {
  private readonly rows = new Map<string, Insight>();
  async create(insight: Insight) {
    this.rows.set(insight.insightId, insight);
    return insight;
  }
  async get(insightId: string) {
    return this.rows.get(insightId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((i) => i.tenantId === tenantId);
  }
}

export class FakeAnalyticalRecommendationRepository implements AnalyticalRecommendationRepository {
  private readonly rows = new Map<string, AnalyticalRecommendation>();
  async create(recommendation: AnalyticalRecommendation) {
    this.rows.set(recommendation.analyticalRecommendationId, recommendation);
    return recommendation;
  }
  async update(recommendation: AnalyticalRecommendation) {
    this.rows.set(recommendation.analyticalRecommendationId, recommendation);
    return recommendation;
  }
  async get(analyticalRecommendationId: string) {
    return this.rows.get(analyticalRecommendationId);
  }
  async listByInsight(insightId: string) {
    return [...this.rows.values()].filter((r) => r.insightId === insightId);
  }
}

export class FakeReportTemplateRepository implements ReportTemplateRepository {
  private readonly rows = new Map<string, ReportTemplate>();
  async create(reportTemplate: ReportTemplate) {
    this.rows.set(reportTemplate.reportTemplateId, reportTemplate);
    return reportTemplate;
  }
  async get(reportTemplateId: string) {
    return this.rows.get(reportTemplateId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((r) => r.tenantId === tenantId);
  }
}

export class FakeReportRepository implements ReportRepository {
  private readonly rows = new Map<string, Report>();
  async create(report: Report) {
    this.rows.set(report.reportId, report);
    return report;
  }
  async get(reportId: string) {
    return this.rows.get(reportId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((r) => r.tenantId === tenantId);
  }
}

export class FakeVisualizationRepository implements VisualizationRepository {
  private readonly rows = new Map<string, Visualization>();
  async create(visualization: Visualization) {
    this.rows.set(visualization.visualizationId, visualization);
    return visualization;
  }
  async get(visualizationId: string) {
    return this.rows.get(visualizationId);
  }
}
