/**
 * Pipeline — estrutura que organiza um conjunto de Stage pelos quais uma Opportunity progride,
 * configurável por Empresa sem exigir alteração de Domain Model (Configuration-Driven Pipeline).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Pipeline {
  /** Identificador do Pipeline. */
  readonly pipelineId: string;

  /** Tenant ao qual o Pipeline pertence. */
  readonly tenantId: string;

  /** Nome do Pipeline, configurável por Empresa. */
  readonly name: string;

  /** Estágios que compõem este Pipeline, em ordem — ver Stage.ts. */
  readonly stageIds: readonly string[];
}
