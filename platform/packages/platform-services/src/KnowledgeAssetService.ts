import type { KnowledgeAsset } from "./KnowledgeAsset.js";
import type { KnowledgeAssetRepository } from "./KnowledgeAssetRepository.js";
import type { KnowledgeType } from "./KnowledgeType.js";

/**
 * Knowledge Asset Service — implementa, no Core desta Sprint, o "Repository Manager" ("administra o
 * Knowledge Repository... garantindo que nenhum documento exista fora dele nem seja duplicado
 * localmente"), o "Document Manager" ("administra o ciclo de vida de um documento individual") e a
 * responsabilidade de estrutura mínima do "Metadata Engine"/"Classification Engine" ("tipo, categoria
 * e tag" — `KNOWLEDGE_HUB.md`, Capítulo 7) — os três nunca têm entidade ou contrato próprio além do já
 * scaffolded `KnowledgeAsset`, então nenhum Service adicional foi criado apenas para replicar o mesmo
 * CRUD sobre a mesma Entity; ver "Decisões Arquiteturais" em `KNOWLEDGE_HUB_CORE_MIGRATION_REPORT.md`.
 */
export class KnowledgeAssetService {
  constructor(private readonly repository: KnowledgeAssetRepository) {}

  async create(tenantId: string, type: KnowledgeType, category: string | undefined, tags: readonly string[]): Promise<KnowledgeAsset> {
    const asset: KnowledgeAsset = { assetId: crypto.randomUUID(), tenantId, type, category, tags };
    return this.repository.create(asset);
  }

  async find(assetId: string): Promise<KnowledgeAsset | undefined> {
    return this.repository.find(assetId);
  }

  async listByTenant(tenantId: string): Promise<readonly KnowledgeAsset[]> {
    return this.repository.listByTenant(tenantId);
  }
}
