/**
 * Snapshot — o registro imutável do estado de um indicador em um ponto específico no tempo; uma vez
 * criado, nunca é alterado ou removido (Snapshot Is Immutable, Blueprint ADR-011).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Snapshot {
  /** Identificador do Snapshot. */
  readonly snapshotId: string;

  /** Metric ou KPI ao qual este Snapshot se refere — identificador opaco. */
  readonly indicatorId: string;

  /** Valor registrado, imutável a partir deste ponto. */
  readonly value: number;

  /** Momento do registro. */
  readonly recordedAt: Date;
}
