/**
 * Span — segmento do processamento de uma requisição em um módulo específico.
 * Um Distributed Trace é a composição de múltiplos Spans com o mesmo Correlation ID.
 * Estrutura, regras e invariantes definidas em OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
import type { CorrelationId } from "./CorrelationId.js";

export interface Span {
  /** Identificador de correlação — obrigatório ("No Signal Without Correlation"). */
  readonly correlationId: CorrelationId;

  /** Módulo em que este segmento de processamento ocorreu. */
  readonly module: string;

  /** Início do segmento. */
  readonly startedAt: Date;

  /** Fim do segmento, quando já concluído. */
  readonly finishedAt?: Date;
}
