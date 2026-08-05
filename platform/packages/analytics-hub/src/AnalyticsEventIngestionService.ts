import type { AnalyticsEventIngestion, AnalyticsSourceHub } from './AnalyticsEventIngestion';
import type { AnalyticsEventIngestionRepository } from './AnalyticsEventIngestionRepository';

/**
 * AnalyticsEventIngestionService — a Anti-Corruption Layer central deste Hub: registra que um Evento
 * público de outro Business Hub foi consumido e consolidado em um Dataset, sempre por `sourceHub`/
 * `sourceEventType` opacos (`string`), nunca por um tipo importado de `@abp/crm-hub`,
 * `@abp/communication-hub`, `@abp/finance-hub` ou `@abp/growth-hub`. Nenhuma emissão de Evento aqui —
 * responsabilidade exclusiva de AnalyticsManager.
 */
export class AnalyticsEventIngestionService {
  constructor(private readonly repository: AnalyticsEventIngestionRepository) {}

  async ingest(sourceHub: AnalyticsSourceHub, sourceEventType: string, datasetId: string): Promise<AnalyticsEventIngestion> {
    const ingestion: AnalyticsEventIngestion = { sourceHub, sourceEventType, datasetId, ingestedAt: new Date() };
    return this.repository.create(ingestion);
  }

  async listByDataset(datasetId: string): Promise<readonly AnalyticsEventIngestion[]> {
    return this.repository.listByDataset(datasetId);
  }
}
