import type { Dataset } from './Dataset';
import type { DatasetRepository } from './DatasetRepository';

/**
 * DatasetService — nenhum precedente legado equivalente foi encontrado (`src/core/analytics` coleta
 * `AnalyticsMetric` diretamente, sem um conceito de "dado bruto ainda não agregado" intermediário).
 * `refresh` sempre atualiza `refreshedAt` — "Um Dataset é sempre reconstruível a partir do histórico
 * completo de Evento consumido" (Blueprint, Capítulo 12) é garantido por `AnalyticsEventIngestion`,
 * nunca por este Service isoladamente. Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class DatasetService {
  constructor(private readonly repository: DatasetRepository) {}

  async create(tenantId: string): Promise<Dataset> {
    const dataset: Dataset = { datasetId: crypto.randomUUID(), tenantId, refreshedAt: new Date() };
    return this.repository.create(dataset);
  }

  async refresh(datasetId: string): Promise<Dataset> {
    const existing = await this.repository.get(datasetId);

    if (!existing) {
      throw new Error(`Dataset ${datasetId} não encontrado.`);
    }

    return this.repository.update({ ...existing, refreshedAt: new Date() });
  }

  async get(datasetId: string): Promise<Dataset | undefined> {
    return this.repository.get(datasetId);
  }

  async list(tenantId: string): Promise<readonly Dataset[]> {
    return this.repository.list(tenantId);
  }
}
