/**
 * Cohort — um agrupamento de Clientes por critério temporal ou comportamental de crescimento; imutável
 * após fechamento, preservando a integridade de qualquer comparação futura que o utilize como
 * referência (Blueprint, Capítulo 12).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Cohort {
  /** Identificador do Cohort. */
  readonly cohortId: string;

  /** Tenant ao qual o Cohort pertence. */
  readonly tenantId: string;

  /** Critério de agrupamento. */
  readonly criterion: string;

  /** Se o Cohort já foi fechado — composição imutável a partir deste ponto. */
  readonly closed: boolean;
}
