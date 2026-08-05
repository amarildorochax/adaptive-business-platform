/**
 * Alert — o registro de que uma Metric já ultrapassou o limite declarado por uma AlertRule
 * ("Alertas são disparados quando uma Metric ultrapassa um limite configurado",
 * `NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9; NFR-036). Distinto de `AlertRule`: aquele é o
 * substrato declarativo (a condição); este é o fato imutável de que a condição já foi violada.
 * Sempre correlacionável (NFR-034), mesma regra já aplicada a `Metric`.
 * Estrutura ausente de `OBSERVABILITY_CONCRETE_STRUCTURE.md` — gap coberto nesta Sprint (IMP-012).
 */
import type { CorrelationId } from "./CorrelationId.js";

export interface Alert {
  readonly metricName: string;
  readonly observedValue: number;
  readonly correlationId: CorrelationId;
  readonly triggeredAt: Date;
}
