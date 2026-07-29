/**
 * Knowledge Lifecycle State — os nove estágios do Ciclo de Vida do Conhecimento, e o estágio atual de
 * um Knowledge Asset. Nenhum registro pula uma dessas etapas.
 * Estrutura definida em KNOWLEDGE_CONCRETE_STRUCTURE.md.
 */
export type KnowledgeLifecycleStage =
  | "Criação"
  | "Revisão"
  | "Aprovação"
  | "Publicação"
  | "Indexação"
  | "Uso"
  | "Atualização"
  | "Arquivamento"
  | "Recuperação";

export interface KnowledgeLifecycleState {
  /** Ativo ao qual este estado se refere. */
  readonly assetId: string;

  /** Estágio atual do Ciclo de Vida. */
  readonly stage: KnowledgeLifecycleStage;

  /** Momento em que o ativo entrou neste estágio. */
  readonly enteredAt: Date;
}
