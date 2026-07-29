/**
 * Memory Version — uma versão de entrada de memória, sustentando a capacidade de correção retroativa
 * já exigida pela garantia de reconstruibilidade.
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
export interface MemoryVersion {
  /** Entrada versionada. */
  readonly memoryId: string;

  /** Número da versão. */
  readonly version: number;

  /** Momento em que esta versão foi registrada. */
  readonly recordedAt: Date;
}
