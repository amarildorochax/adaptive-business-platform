import type { KnowledgeAsset } from "./KnowledgeAsset.js";

/**
 * Knowledge Asset Repository — "Nenhum documento existe fora do Knowledge Repository administrado
 * por este Hub" (ADR-001). Estrutura (`type`/`category`/`tags`) é fixada na Criação — mudança de
 * conhecimento é sempre representada por uma nova `KnowledgeVersion`, nunca por sobrescrita do
 * próprio Asset (ADR-005: "Conhecimento nunca é sobrescrito"); por isso, sem `update` nem `remove`.
 */
export interface KnowledgeAssetRepository {
  create(asset: KnowledgeAsset): Promise<KnowledgeAsset>;
  find(assetId: string): Promise<KnowledgeAsset | undefined>;
  listByTenant(tenantId: string): Promise<readonly KnowledgeAsset[]>;
}
