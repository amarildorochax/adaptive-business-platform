/**
 * Context Distribution — registro de que um Contexto, ou o subconjunto relevante dele, foi entregue a
 * um destinatário específico, nunca o Contexto completo além do escopo já delimitado.
 * Estrutura definida em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export interface ContextDistribution {
  /** Contexto distribuído. */
  readonly contextId: string;

  /** Destinatário do subconjunto distribuído. */
  readonly recipientId: string;

  /** Escopo do subconjunto entregue. */
  readonly scope: readonly string[];

  /** Momento da distribuição. */
  readonly distributedAt: Date;
}
