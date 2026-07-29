/**
 * Opportunity — possibilidade de negócio em progressão, sempre associada a um Customer ou a uma
 * Organization através de um Relationship, nunca a um Lead ainda não convertido, nem diretamente a um
 * Supplier ou Partner isolado (Blueprint, Capítulo 7 e ADR-007).
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type OpportunityOutcome = "Open" | "Won" | "Lost";

export interface Opportunity {
  /** Identificador da Opportunity. */
  readonly opportunityId: string;

  /** Tenant ao qual a Opportunity pertence. */
  readonly tenantId: string;

  /** Relationship ao qual esta Opportunity está associada — sempre de partyType Customer ou Organization. */
  readonly relationshipId: string;

  /** Pipeline pelo qual esta Opportunity progride. */
  readonly pipelineId: string;

  /** Estágio atual dentro do Pipeline. */
  readonly stageId: string;

  /** Partner referenciado como colaborador, quando aplicável — nunca o titular da Opportunity. */
  readonly partnerId?: string;

  /** Resultado atual da Opportunity. */
  readonly outcome: OpportunityOutcome;

  /** Motivo registrado quando encerrada sem resultado. */
  readonly lostReason?: string;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento de encerramento (Won ou Lost), quando aplicável. */
  readonly closedAt?: Date;
}
