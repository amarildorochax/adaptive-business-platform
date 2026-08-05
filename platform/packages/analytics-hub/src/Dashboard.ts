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

  /**
   * Se o Dashboard foi arquivado. Campo adicionado por necessidade estrutural do próprio Blueprint —
   * `ArchiveDashboard` é um dos dezesseis Commands já aprovados (`AnalyticsCommand.ts`), mas o
   * Dashboard, como declarado originalmente, não tinha nenhum campo capaz de representar esse estado
   * (mesmo critério já usado em IMP-006 para `Campaign`/`Audience`).
   */
  readonly archived: boolean;
}
