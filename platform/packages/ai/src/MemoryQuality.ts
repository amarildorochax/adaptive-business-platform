/**
 * Memory Quality — relevância e confiança de uma entrada de memória, por analogia direta aos mesmos
 * atributos já formalizados para Contexto (Component 15), do qual a memória contextual é subconjunto.
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
export interface MemoryQuality {
  /** Entrada qualificada. */
  readonly memoryId: string;

  /** Relevância da entrada. */
  readonly relevance: number;

  /** Confiança associada à entrada. */
  readonly confidence: number;
}
