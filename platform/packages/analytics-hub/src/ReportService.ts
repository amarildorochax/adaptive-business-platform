import type { Metric } from './Metric';
import type { Report } from './Report';
import type { ReportRepository } from './ReportRepository';

/**
 * ReportService — adaptado de `src/core/analytics/AnalyticsService.buildSummary()` (Business
 * Analytics legado, real e funcional): resumo determinístico (contagem/média/mínimo/máximo) sobre um
 * conjunto de Metric — nunca gerado por IA, mesmo princípio já explícito no legado e reforçado pela
 * exclusão de IA desta Sprint. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class ReportService {
  constructor(private readonly repository: ReportRepository) {}

  async generate(tenantId: string, reportTemplateId: string, metrics: readonly Metric[], title?: string): Promise<Report> {
    const report: Report = {
      reportId: crypto.randomUUID(),
      tenantId,
      reportTemplateId,
      generatedAt: new Date(),
      title,
      summary: this.buildSummary(metrics),
    };

    return this.repository.create(report);
  }

  async get(reportId: string): Promise<Report | undefined> {
    return this.repository.get(reportId);
  }

  async list(tenantId: string): Promise<readonly Report[]> {
    return this.repository.list(tenantId);
  }

  private buildSummary(metrics: readonly Metric[]): string {
    const values = metrics.map((metric) => metric.value);

    if (values.length === 0) {
      return 'Report sem Metric associada.';
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return `Report com ${values.length} Metric: valor médio ${average.toFixed(2)}, mínimo ${min.toFixed(2)}, máximo ${max.toFixed(2)}.`;
  }
}
