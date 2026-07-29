/**
 * Memory Validation — confirmação de que uma entrada de memória é reconstruível a partir de sua
 * Memory Reference e nunca se tornou, ela mesma, uma fonte de verdade de negócio paralela.
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
export interface MemoryValidation {
  /** Entrada validada. */
  readonly memoryId: string;

  /** Se a entrada é reconstruível a partir de sua Memory Reference. */
  readonly reconstructable: boolean;

  /** Se a entrada não se tornou, ela mesma, fonte de verdade paralela. */
  readonly sourceOfTruthRespected: boolean;

  /** Momento da validação. */
  readonly validatedAt: Date;
}
