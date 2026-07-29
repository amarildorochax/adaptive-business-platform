/**
 * Funnel — o modelo das etapas entre potencial e conversão, usado para medir onde a perda de
 * conversão se concentra.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Funnel {
  /** Identificador do Funnel. */
  readonly funnelId: string;

  /** Tenant ao qual o Funnel pertence. */
  readonly tenantId: string;

  /** Etapas do Funnel, em ordem. */
  readonly stageNames: readonly string[];
}
