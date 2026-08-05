import type { AnalyticsEventIngestion } from './AnalyticsEventIngestion';

/**
 * Contrato de persistência de Analytics Event Ingestion — apenas o contrato. Sem `update`/`remove` —
 * cada ingestão é um registro histórico imutável, sustentando "Um Dataset é sempre reconstruível a
 * partir do histórico completo de Evento consumido" (`ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 12).
 */
export interface AnalyticsEventIngestionRepository {
  create(ingestion: AnalyticsEventIngestion): Promise<AnalyticsEventIngestion>;
  listByDataset(datasetId: string): Promise<AnalyticsEventIngestion[]>;
}
