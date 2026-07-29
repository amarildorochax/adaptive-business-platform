/**
 * Activation Strategy — define a estratégia de como um Cliente recém-adquirido é levado a obter
 * valor inicial da Empresa; o Growth define o que caracteriza ativação e mede sua ocorrência, mas
 * nunca implementa diretamente a funcionalidade de produto que entrega esse valor (Blueprint,
 * Capítulo 5).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ActivationStrategy {
  /** Identificador da Activation Strategy. */
  readonly activationStrategyId: string;

  /** Tenant ao qual esta estratégia se aplica. */
  readonly tenantId: string;

  /** Descrição do critério de ativação. */
  readonly description: string;
}
