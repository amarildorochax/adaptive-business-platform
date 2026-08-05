import type { KnowledgeVersion } from "./KnowledgeVersion.js";
import type { KnowledgeVersionRepository } from "./KnowledgeVersionRepository.js";

/**
 * Knowledge Version Service — implementa o "Knowledge Versioning" (`KNOWLEDGE_HUB.md`, Capítulo 7):
 * "aplica identificação de versão a cada estado relevante de um registro de conhecimento." O número
 * da versão é sempre calculado a partir do próprio histórico já registrado — nunca informado pelo
 * chamador — evitando lacuna ou duplicidade na sequência, mesma disciplina já usada em
 * `RuntimeRetryCoordinatorService.recordAttempt` (IMP-013).
 */
export class KnowledgeVersionService {
  constructor(private readonly repository: KnowledgeVersionRepository) {}

  async record(assetId: string): Promise<KnowledgeVersion> {
    const previous = await this.repository.listByAssetId(assetId);
    const version: KnowledgeVersion = { assetId, version: previous.length + 1, recordedAt: new Date() };
    return this.repository.create(version);
  }

  async currentVersion(assetId: string): Promise<number | undefined> {
    const versions = await this.repository.listByAssetId(assetId);
    return versions[versions.length - 1]?.version;
  }

  async history(assetId: string): Promise<readonly KnowledgeVersion[]> {
    return this.repository.listByAssetId(assetId);
  }
}
