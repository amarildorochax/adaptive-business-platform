/**
 * Dashboard — a superfície central de leitura consolidada de indicador, composta por Widget
 * individuais; expõe apenas leitura, nunca capacidade de escrita sobre dado de outro domínio
 * (Dashboards Are Read-Only, Blueprint ADR-002).
 * Estrutura definida em `ANALYTICS_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Dashboard {
  /** Identificador do Dashboard. */
  readonly dashboardId: string;

  /** Tenant ao qual o Dashboard pertence. */
  readonly tenantId: string;

  /** Nome do Dashboard. */
  readonly name: string;

  /** Widgets que compõem este Dashboard. */
  readonly widgetIds: readonly string[];

  /** Momento de criação. */
  readonly createdAt: Date;
}
