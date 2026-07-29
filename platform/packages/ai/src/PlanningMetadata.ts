/**
 * Planning Metadata — metadado estrutural de um plano, sustentando a mesma disciplina de
 * rastreabilidade já aplicada aos demais componentes de AI Core.
 * Estrutura definida em PLANNING_CONCRETE_STRUCTURE.md.
 */
export interface PlanningMetadata {
  /** Identificador do plano. */
  readonly planId: string;

  /** Momento de criação do plano. */
  readonly createdAt: Date;

  /** Versão do plano. */
  readonly version: string;
}
