/**
 * Retention Strategy — define a estratégia de como um Cliente já ativo é mantido engajado ao longo
 * do tempo; o Growth identifica risco de perda de engajamento, mas a ação de comunicação decorrente
 * é sempre delegada ao Communication Hub através de Evento e de Automation Engine (Blueprint,
 * Capítulo 5).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface RetentionStrategy {
  /** Identificador da Retention Strategy. */
  readonly retentionStrategyId: string;

  /** Tenant ao qual esta estratégia se aplica. */
  readonly tenantId: string;

  /** Descrição da estratégia de retenção. */
  readonly description: string;
}
