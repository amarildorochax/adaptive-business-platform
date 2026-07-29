/**
 * Memory Reference — a origem exata da qual uma entrada de memória deriva; toda memória é derivada de
 * Evento, de Read Model ou de Conhecimento já catalogados, nunca uma estrutura paralela.
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
export type MemorySourceKind = "Event" | "Read Model" | "Knowledge";

export interface MemoryReference {
  /** Entrada referenciada. */
  readonly memoryId: string;

  /** Natureza da origem. */
  readonly sourceKind: MemorySourceKind;

  /** Identificador da origem exata. */
  readonly sourceId: string;
}
