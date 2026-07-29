/**
 * Context Budget — o orçamento finito de capacidade dentro do qual um Contexto é construído,
 * exigindo decisão disciplinada de priorização.
 * Estrutura, regras e invariantes definidas em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export interface ContextBudget {
  /** Contexto ao qual este orçamento se aplica. */
  readonly contextId: string;

  /** Peso relativo desta informação dentro do orçamento total. */
  readonly weight: number;

  /** Custo arquitetural de incluir esta informação. */
  readonly cost: number;

  /** Prioridade de alocação. */
  readonly priority: number;

  /** Benefício estimado para a qualidade final do raciocínio. */
  readonly value: number;

  /** Risco associado à omissão desta informação. */
  readonly risk: number;

  /** Momento em que esta informação deixa de ser válida para inclusão. */
  readonly expiresAt: Date;

  /** Identificadores de informação da qual esta depende para ser corretamente interpretada. */
  readonly dependencies: readonly string[];
}
