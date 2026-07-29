/**
 * Index Entry — registro de que um Knowledge Asset foi indexado e está pesquisável.
 * Estrutura definida em KNOWLEDGE_CONCRETE_STRUCTURE.md.
 */
export interface IndexEntry {
  /** Ativo indexado. */
  readonly assetId: string;

  /** Momento em que o ativo foi indexado. */
  readonly indexedAt: Date;
}
