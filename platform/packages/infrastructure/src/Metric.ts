/**
 * Metric — sinal estruturado que quantifica o comportamento de um componente ao longo do tempo.
 * Estrutura, regras e invariantes definidas em OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
import type { CorrelationId } from "./CorrelationId.js";

export interface Metric {
  /** Nome nomeado da métrica. */
  readonly name: string;

  /** Valor numérico observado. */
  readonly value: number;

  /** Identificador de correlação — obrigatório ("No Signal Without Correlation"). */
  readonly correlationId: CorrelationId;

  /** Momento da observação. */
  readonly timestamp: Date;
}
