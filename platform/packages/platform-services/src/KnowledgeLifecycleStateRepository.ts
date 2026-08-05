import type { KnowledgeLifecycleState } from "./KnowledgeLifecycleState.js";

/**
 * Knowledge Lifecycle State Repository — cada transição de estágio é um fato imutável, um novo
 * registro (`KnowledgeLifecycleState` não tem identificador próprio — apenas `assetId` + `stage` +
 * `enteredAt`); nunca `update` nem `remove`. O estágio atual é sempre o último em ordem de inserção
 * (ver `KnowledgeLifecycleService.currentStage`).
 */
export interface KnowledgeLifecycleStateRepository {
  create(state: KnowledgeLifecycleState): Promise<KnowledgeLifecycleState>;
  listByAssetId(assetId: string): Promise<readonly KnowledgeLifecycleState[]>;
}
