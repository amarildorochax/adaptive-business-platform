/**
 * Knowledge Version — versão preservável de um Knowledge Asset; nenhuma mudança sobrescreve
 * silenciosamente o estado anterior.
 * Estrutura definida em KNOWLEDGE_CONCRETE_STRUCTURE.md.
 */
export interface KnowledgeVersion {
  /** Ativo ao qual esta versão pertence. */
  readonly assetId: string;

  /** Número da versão. */
  readonly version: number;

  /** Momento em que esta versão foi registrada. */
  readonly recordedAt: Date;
}
