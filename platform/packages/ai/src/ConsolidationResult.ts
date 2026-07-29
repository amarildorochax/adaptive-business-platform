/**
 * Consolidation Result — o resultado consolidado de múltiplos resultados parciais em uma resposta
 * única e coerente, com Rastreabilidade preservada até cada origem individual.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export interface ConsolidationResult {
  /** Solicitação cujos resultados foram consolidados. */
  readonly requestId: string;

  /** Agentes que contribuíram ao resultado consolidado. */
  readonly contributingAgentIds: readonly string[];

  /** Se havia conflito entre resultados parciais, já resolvido. */
  readonly conflictResolved: boolean;

  /** Momento da consolidação. */
  readonly consolidatedAt: Date;
}
