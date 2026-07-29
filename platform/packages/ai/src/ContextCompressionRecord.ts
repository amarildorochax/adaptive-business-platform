/**
 * Context Compression Record — registro de que uma técnica de compressão foi aplicada a um Contexto,
 * com a perda envolvida sempre calculada e comunicada, nunca ocultada silenciosamente (No Silent Loss).
 * Estrutura, regras e invariantes definidas em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export type ContextCompressionTechnique =
  | "Resumo"
  | "Redução"
  | "Agrupamento"
  | "Remoção"
  | "Preservação";

export interface ContextCompressionRecord {
  /** Contexto ao qual esta compressão foi aplicada. */
  readonly contextId: string;

  /** Técnica aplicada. */
  readonly technique: ContextCompressionTechnique;

  /** Momento em que a técnica foi aplicada. */
  readonly appliedAt: Date;

  /** Se a perda de detalhe envolvida foi comunicada como aceitável. */
  readonly acceptableLoss: boolean;
}
