/**
 * Memory Retrieval Result — o registro de que a etapa Memory Retrieval do Pipeline de Decisão foi
 * concluída para uma solicitação, vinculando-a às entradas de memória já recuperadas pelo Memory
 * Manager através de identificador opaco, sem redefinir a estrutura da memória (Component 16) nem o
 * estado do pipeline (`DecisionPipelineState`, Component 17).
 * Artefato de integração INT-02, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-02.
 */
export interface MemoryRetrievalResult {
  /** Solicitação para a qual a memória foi recuperada. */
  readonly requestId: string;

  /** Entradas de memória recuperadas — identificadores opacos, sem redefinir Memory (Component 16). */
  readonly memoryIds: readonly string[];

  /** Momento em que a etapa Memory Retrieval foi concluída para esta solicitação. */
  readonly retrievedAt: Date;
}
