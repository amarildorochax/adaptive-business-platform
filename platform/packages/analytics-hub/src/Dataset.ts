/**
 * Dataset — o conjunto de dado bruto, já consolidado a partir de Evento de outros domínios, sobre o
 * qual uma Aggregation opera; sempre reconstruível a partir do histórico completo de Evento
 * consumido (Blueprint, Capítulo 12).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Dataset {
  /** Identificador do Dataset. */
  readonly datasetId: string;

  /** Tenant ao qual o Dataset pertence. */
  readonly tenantId: string;

  /** Momento da última atualização a partir de novo Evento consumido. */
  readonly refreshedAt: Date;
}
