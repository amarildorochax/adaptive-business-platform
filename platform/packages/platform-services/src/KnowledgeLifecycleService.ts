import type { KnowledgeLifecycleStage, KnowledgeLifecycleState } from "./KnowledgeLifecycleState.js";
import type { KnowledgeLifecycleStateRepository } from "./KnowledgeLifecycleStateRepository.js";

/**
 * Knowledge Lifecycle Service — implementa o "Knowledge Lifecycle Manager" (`KNOWLEDGE_HUB.md`,
 * Capítulo 7): "orquestra a transição de um registro de conhecimento entre os estados do Ciclo de
 * Vida... garantindo que nenhuma transição pule uma etapa exigida." As transições abaixo aplicam a
 * sequência literal do Capítulo 9 (Criação → Revisão → Aprovação → Publicação → Indexação → Uso →
 * Atualização → Arquivamento → Recuperação), mais o único ciclo explicitamente descrito em prosa:
 * "um conhecimento publicado e em uso ativo continua sujeito a nova Revisão a qualquer momento, sem
 * limite de quantas vezes esse ciclo se repete" — implementado como `Atualização → Revisão`, a
 * transição textualmente mais próxima dessa afirmação ("uma nova Revisão produz uma nova Versão").
 * `Recuperação` nunca acontece automaticamente — "é sempre um ato de escolha, nunca um efeito
 * colateral automático" — por isso `Arquivamento → Recuperação` exige sempre uma chamada explícita
 * deste Service, nunca disparada por nenhuma outra transição.
 */
const ALLOWED_TRANSITIONS: Record<KnowledgeLifecycleStage, readonly KnowledgeLifecycleStage[]> = {
  Criação: ["Revisão"],
  Revisão: ["Aprovação"],
  Aprovação: ["Publicação"],
  Publicação: ["Indexação"],
  Indexação: ["Uso"],
  Uso: ["Atualização"],
  Atualização: ["Arquivamento", "Revisão"],
  Arquivamento: ["Recuperação"],
  Recuperação: [],
};

export class KnowledgeLifecycleService {
  constructor(private readonly repository: KnowledgeLifecycleStateRepository) {}

  async start(assetId: string): Promise<KnowledgeLifecycleState> {
    return this.record(assetId, "Criação");
  }

  async advance(assetId: string, next: KnowledgeLifecycleStage): Promise<KnowledgeLifecycleState> {
    const current = await this.currentStage(assetId);
    if (!current) {
      throw new Error(`Knowledge Asset "${assetId}" ainda não iniciou seu Ciclo de Vida.`);
    }

    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new Error(`Transição inválida de "${current}" para "${next}" em "${assetId}".`);
    }

    return this.record(assetId, next);
  }

  async currentStage(assetId: string): Promise<KnowledgeLifecycleStage | undefined> {
    const states = await this.repository.listByAssetId(assetId);
    return states[states.length - 1]?.stage;
  }

  async history(assetId: string): Promise<readonly KnowledgeLifecycleState[]> {
    return this.repository.listByAssetId(assetId);
  }

  private async record(assetId: string, stage: KnowledgeLifecycleStage): Promise<KnowledgeLifecycleState> {
    const state: KnowledgeLifecycleState = { assetId, stage, enteredAt: new Date() };
    return this.repository.create(state);
  }
}
