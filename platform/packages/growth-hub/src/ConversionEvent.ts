/**
 * Conversion Event — o registro concreto de que uma Conversion Goal foi atingida; uma vez registrado,
 * nunca é removido ou alterado, ainda que a Campaign ou o Funnel associado seja posteriormente
 * encerrado (Blueprint, Capítulo 12).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ConversionEvent {
  /** Identificador do Conversion Event. */
  readonly conversionEventId: string;

  /** Conversion Goal atingido. */
  readonly conversionGoalId: string;

  /** Campaign ou Experiment de origem, quando aplicável — identificador opaco. */
  readonly sourceId?: string;

  /** Momento do registro — imutável a partir deste ponto. */
  readonly registeredAt: Date;
}
