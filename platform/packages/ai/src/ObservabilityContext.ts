/**
 * Observability Context — a hierarquia de correlação de um sinal observável de IA: Correlation ID
 * (raiz) → Trace ID (cadeia de processamento de IA) → Span ID (unidade individual). Nenhuma
 * importação de CorrelationId ou Span já implementados em platform/packages/infrastructure/src/
 * (Component 09) — todo identificador aqui é opaco.
 * Estrutura definida em AI_OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
export interface ObservabilityContext {
  /** Identificador de correlação — raiz de toda a solicitação, técnica ou de IA. */
  readonly correlationId: string;

  /** Identificador de trace, quando esta solicitação envolve processamento de IA. */
  readonly traceId?: string;

  /** Identificador de span, quando aplicável a uma unidade individual de processamento. */
  readonly spanId?: string;

  /** Tipo do componente de origem deste sinal. */
  readonly componentType: string;
}
