/**
 * Context Quality — os dez atributos de qualidade avaliados para cada porção de informação
 * incorporada a um Contexto, aplicação do princípio Quality Before Quantity.
 * Estrutura, regras e invariantes definidas em CONTEXT_CONCRETE_STRUCTURE.md.
 */
import type { ContextSource } from "./ContextSource.js";

export interface ContextQuality {
  /** Contexto ao qual esta qualidade se refere. */
  readonly contextId: string;

  readonly relevance: number;
  readonly freshness: number;
  readonly confidence: number;
  readonly consistency: number;
  readonly completeness: number;
  readonly sensitivity: number;
  readonly priority: number;
  readonly businessValue: number;

  /** Origem responsável por esta informação. */
  readonly ownership: ContextSource;

  /** Referência rastreável até o ponto exato de origem. */
  readonly traceability: string;
}
