import type { Aggregation } from './Aggregation';
import { AggregationService } from './AggregationService';
import type { AnalyticalRecommendation } from './AnalyticalRecommendation';
import { AnalyticalRecommendationService } from './AnalyticalRecommendationService';
import type { AnalyticsCommand, AnalyticsCommandType } from './AnalyticsCommand';
import type { AnalyticsEvent, AnalyticsEventType } from './AnalyticsEvent';
import type { AnalyticsEventIngestion, AnalyticsSourceHub } from './AnalyticsEventIngestion';
import { AnalyticsEventIngestionService } from './AnalyticsEventIngestionService';
import type { Dashboard } from './Dashboard';
import { DashboardService } from './DashboardService';
import type { Dataset } from './Dataset';
import { DatasetService } from './DatasetService';
import type { Forecast } from './Forecast';
import { ForecastService } from './ForecastService';
import type { Insight } from './Insight';
import { InsightService } from './InsightService';
import type { KPI } from './KPI';
import { KPIService } from './KPIService';
import type { Metric } from './Metric';
import { MetricService, type CreateMetricInput } from './MetricService';
import type { Report } from './Report';
import { ReportService } from './ReportService';
import type { ReportTemplate } from './ReportTemplate';
import { ReportTemplateService } from './ReportTemplateService';
import type { Snapshot } from './Snapshot';
import { SnapshotService } from './SnapshotService';
import type { TimeSeries } from './TimeSeries';
import { TimeSeriesService } from './TimeSeriesService';
import type { Trend } from './Trend';
import { TrendService } from './TrendService';
import type { Visualization } from './Visualization';
import { VisualizationService } from './VisualizationService';
import type { Widget } from './Widget';
import { WidgetService } from './WidgetService';

export interface AnalyticsManagerDependencies {
  readonly datasets: DatasetService;
  readonly eventIngestions: AnalyticsEventIngestionService;
  readonly aggregations: AggregationService;
  readonly metrics: MetricService;
  readonly kpis: KPIService;
  readonly dashboards: DashboardService;
  readonly widgets: WidgetService;
  readonly snapshots: SnapshotService;
  readonly timeSeries: TimeSeriesService;
  readonly trends: TrendService;
  readonly forecasts: ForecastService;
  readonly insights: InsightService;
  readonly recommendations: AnalyticalRecommendationService;
  readonly reportTemplates: ReportTemplateService;
  readonly reports: ReportService;
  readonly visualizations: VisualizationService;
}

/**
 * Resultado de uma operação de AnalyticsManager — a Entidade produzida, todo Event já aprovado
 * consequente, e o Command que a originou, quando a operação corresponde a um dos dezesseis Commands
 * já aprovados em `AnalyticsCommand.ts`. Diferente de Content/Commerce Hub, o Analytics Hub já chega
 * com um catálogo de Commands completo — mesma forma já usada por `CRMOperationResult`/
 * `GrowthOperationResult`/`FinanceOperationResult`.
 */
export interface AnalyticsOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: AnalyticsCommand;
  readonly events: readonly AnalyticsEvent[];
}

/**
 * AnalyticsManager — o componente "Analytics Manager" já catalogado em `AnalyticsHubComponent.ts`,
 * implementado pela primeira vez nesta Sprint (IMP-008, Analytics Core). Nunca contém, ele mesmo,
 * regra de negócio de uma Entidade específica — mesma disciplina de fronteira já demonstrada por todo
 * Manager anterior desta série.
 *
 * Escopo desta Sprint (Analytics Core): os dois fluxos centrais já descritos no Blueprint (Capítulo
 * 9) — `Dataset → Aggregation → Metric → KPI → Dashboard` e `TimeSeries → Trend → Forecast →
 * Recommendation` —, mais `Report → Visualization` e a Anti-Corruption Layer de ingestão
 * (`AnalyticsEventIngestion`). Nunca Benchmark, Scorecard, Analytical Model/View/Dimension/Measure,
 * os quatro tipos de Indicator (Business/Executive/Operational/Strategic) ou Decision Support, todos
 * adiados (ver relatório desta Sprint).
 *
 * Analytics nunca acessa Customer, Conversation, Invoice ou Campaign diretamente — toda referência a
 * outro Hub é sempre `sourceHub`/`sourceEventType` opacos em `AnalyticsEventIngestion`, nunca um tipo
 * importado de `@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub` ou `@abp/growth-hub`
 * (Blueprint, Capítulo 4 e ADR-007/008/009). Dashboards Are Read-Only (ADR-002): nenhum método aqui
 * expõe escrita sobre dado de outro domínio. Não publica em nenhum Event Bus — `AnalyticsEvent` é
 * retornado ao chamador, mesmo padrão já em uso por todo Manager anterior desta série.
 */
export class AnalyticsManager {
  constructor(private readonly deps: AnalyticsManagerDependencies) {}

  /**
   * Cria um Dataset vazio, pronto para receber ingestão via `refreshDataset`. Nenhum dos dezesseis
   * Commands aprovados cobre a criação inicial de um Dataset — apenas `RefreshDataset`, que já
   * pressupõe um Dataset existente — mesmo tratamento já dado a Organization/Contact em
   * `CRMOperationResult` (IMP-002).
   */
  async createDataset(tenantId: string): Promise<AnalyticsOperationResult<Dataset>> {
    const dataset = await this.deps.datasets.create(tenantId);
    return { result: dataset, events: [] };
  }

  /** Nenhum Command/Event aprovado cobre Report Template — ver relatório desta Sprint. */
  async createReportTemplate(tenantId: string, name: string): Promise<AnalyticsOperationResult<ReportTemplate>> {
    const reportTemplate = await this.deps.reportTemplates.create(tenantId, name);
    return { result: reportTemplate, events: [] };
  }

  async createDashboard(tenantId: string, name: string): Promise<AnalyticsOperationResult<Dashboard>> {
    const dashboard = await this.deps.dashboards.create(tenantId, name);
    return { result: dashboard, command: this.command('CreateDashboard'), events: [this.event('DashboardCreated')] };
  }

  async updateDashboard(dashboardId: string, sourceId: string, title?: string): Promise<AnalyticsOperationResult<{ dashboard: Dashboard; widget: Widget }>> {
    const widget = await this.deps.widgets.create(dashboardId, sourceId, title);
    const dashboard = await this.deps.dashboards.addWidget(dashboardId, widget.widgetId);

    return {
      result: { dashboard, widget },
      command: this.command('UpdateDashboard'),
      events: [this.event('DashboardUpdated')],
    };
  }

  /**
   * Arquiva um Dashboard. Nenhum Evento dedicado existe no catálogo de catorze já aprovados para
   * este Comando — `DashboardUpdated` (o único Evento aprovado para Dashboard além de `Created`) é
   * reutilizado, tratando arquivamento como uma forma de atualização de estado, nunca um Evento
   * inventado (ver relatório desta Sprint).
   */
  async archiveDashboard(dashboardId: string): Promise<AnalyticsOperationResult<Dashboard>> {
    const dashboard = await this.deps.dashboards.archive(dashboardId);
    return { result: dashboard, command: this.command('ArchiveDashboard'), events: [this.event('DashboardUpdated')] };
  }

  async generateReport(
    tenantId: string,
    reportTemplateId: string,
    metricIds: readonly string[],
    title?: string,
  ): Promise<AnalyticsOperationResult<Report>> {
    const template = await this.deps.reportTemplates.get(reportTemplateId);

    if (!template) {
      throw new Error(`Report Template ${reportTemplateId} não encontrado.`);
    }

    const metrics: Metric[] = [];

    for (const metricId of metricIds) {
      const metric = await this.deps.metrics.get(metricId);

      if (metric) {
        metrics.push(metric);
      }
    }

    const report = await this.deps.reports.generate(tenantId, reportTemplateId, metrics, title);

    return { result: report, command: this.command('GenerateReport'), events: [this.event('ReportGenerated')] };
  }

  async publishVisualization(sourceId: string): Promise<AnalyticsOperationResult<Visualization>> {
    const visualization = await this.deps.visualizations.publish(sourceId);
    return { result: visualization, command: this.command('PublishVisualization'), events: [this.event('VisualizationPublished')] };
  }

  /** `CalculateMetric` cobre tanto a primeira criação quanto todo recálculo — não existe um Command "CreateMetric" separado no catálogo já aprovado. */
  async calculateMetric(input: CreateMetricInput, value: number, existingMetricId?: string): Promise<AnalyticsOperationResult<Metric>> {
    const metric = existingMetricId
      ? await this.deps.metrics.recalculate(existingMetricId, value)
      : await this.deps.metrics.create(input, value);

    return { result: metric, command: this.command('CalculateMetric'), events: [this.event('MetricCalculated')] };
  }

  /** `CalculateKPI` produz o Event `KPIUpdated` — mesma assimetria de nomenclatura já aprovada entre Command e Event (ver relatório desta Sprint). */
  async calculateKPI(tenantId: string, metricIds: readonly string[], existingKpiId?: string): Promise<AnalyticsOperationResult<KPI>> {
    const kpi = existingKpiId ? await this.deps.kpis.recalculate(existingKpiId) : await this.deps.kpis.create(tenantId, metricIds);

    return { result: kpi, command: this.command('CalculateKPI'), events: [this.event('KPIUpdated')] };
  }

  /**
   * Consome um Evento já publicado por outro Business Hub, registra a ingestão (Anti-Corruption
   * Layer) e atualiza o Dataset correspondente — nunca lê a Entidade de origem diretamente, apenas o
   * tipo de Evento já opaco.
   */
  async refreshDataset(datasetId: string, sourceHub: AnalyticsSourceHub, sourceEventType: string): Promise<AnalyticsOperationResult<{ dataset: Dataset; ingestion: AnalyticsEventIngestion }>> {
    const ingestion = await this.deps.eventIngestions.ingest(sourceHub, sourceEventType, datasetId);
    const dataset = await this.deps.datasets.refresh(datasetId);

    return {
      result: { dataset, ingestion },
      command: this.command('RefreshDataset'),
      events: [this.event('DatasetRefreshed')],
    };
  }

  /**
   * Aciona `RefreshDataset` para cada Dataset já registrado de um Tenant — nenhum Evento dedicado
   * existe para a operação agregada em si; um `DatasetRefreshed` é emitido por Dataset atualizado,
   * nunca um Evento novo inventado para o agregado (ver relatório desta Sprint).
   */
  async refreshAnalytics(tenantId: string): Promise<AnalyticsOperationResult<readonly Dataset[]>> {
    const datasets = await this.deps.datasets.list(tenantId);
    const refreshed: Dataset[] = [];

    for (const dataset of datasets) {
      refreshed.push(await this.deps.datasets.refresh(dataset.datasetId));
    }

    return {
      result: refreshed,
      command: this.command('RefreshAnalytics'),
      events: refreshed.map(() => this.event('DatasetRefreshed')),
    };
  }

  async processAggregation(datasetId: string): Promise<Aggregation> {
    return this.deps.aggregations.process(datasetId);
  }

  async createSnapshot(indicatorId: string, value: number, metricId?: string): Promise<AnalyticsOperationResult<{ snapshot: Snapshot; timeSeries?: TimeSeries }>> {
    const snapshot = await this.deps.snapshots.record(indicatorId, value);
    const timeSeries = metricId ? await this.deps.timeSeries.append(metricId, snapshot.snapshotId) : undefined;

    return {
      result: { snapshot, timeSeries },
      command: this.command('CreateSnapshot'),
      events: [this.event('SnapshotCreated')],
    };
  }

  async generateTrend(metricId: string): Promise<AnalyticsOperationResult<Trend>> {
    const timeSeries = await this.deps.timeSeries.findByMetric(metricId);

    if (!timeSeries) {
      throw new Error(`Time Series de Metric ${metricId} não encontrada.`);
    }

    const candidates = await this.deps.snapshots.listByIndicator(metricId);
    const snapshots = candidates.filter((snapshot) => timeSeries.snapshotIds.includes(snapshot.snapshotId));

    const trend = await this.deps.trends.identify(timeSeries.timeSeriesId, snapshots);

    return { result: trend, command: this.command('GenerateTrend'), events: [this.event('TrendIdentified')] };
  }

  async generateForecast(trend: Trend, currentValue: number): Promise<AnalyticsOperationResult<Forecast>> {
    const forecast = await this.deps.forecasts.project(trend, currentValue);
    return { result: forecast, command: this.command('GenerateForecast'), events: [this.event('ForecastGenerated')] };
  }

  /** Nunca gera um Insight para um Trend `stable` — nenhuma anomalia observada (ver `InsightService.identify`). */
  async generateInsight(tenantId: string, datasetId: string, trend: Trend): Promise<AnalyticsOperationResult<Insight>> {
    const insight = await this.deps.insights.identify(tenantId, datasetId, trend);

    if (!insight) {
      throw new Error('Nenhum Insight gerado — o Trend informado é "stable", sem anomalia a reportar.');
    }

    return { result: insight, command: this.command('GenerateInsight'), events: [this.event('InsightGenerated')] };
  }

  /** Nunca gera uma Recommendation para um Insight de severidade `low` (ver `AnalyticalRecommendationService.formulate`). */
  async generateRecommendation(insight: Insight): Promise<AnalyticsOperationResult<AnalyticalRecommendation>> {
    const recommendation = await this.deps.recommendations.formulate(insight);

    if (!recommendation) {
      throw new Error(`Nenhuma Recommendation gerada — Insight ${insight.insightId} tem severidade "low".`);
    }

    return { result: recommendation, command: this.command('GenerateRecommendation'), events: [this.event('RecommendationGenerated')] };
  }

  private command(type: AnalyticsCommandType): AnalyticsCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(type: AnalyticsEventType): AnalyticsEvent {
    return { eventId: crypto.randomUUID(), type, occurredAt: new Date() };
  }
}
