/**
 * Observability State — o estado observável de um componente de IA, incluindo degradação ou anomalia
 * percebida.
 * Estrutura definida em AI_OBSERVABILITY_CONCRETE_STRUCTURE.md.
 */
export type ObservabilityStateValue = "Normal" | "Degraded" | "Anomalous";

export interface ObservabilityState {
  /** Tipo do componente observado. */
  readonly componentType: string;

  /** Estado atual observado. */
  readonly state: ObservabilityStateValue;

  /** Momento da observação. */
  readonly observedAt: Date;
}
