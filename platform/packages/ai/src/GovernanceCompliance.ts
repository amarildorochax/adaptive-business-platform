/**
 * Governance Compliance — o estado de conformidade de uma Política, avaliado em uma de duas
 * dimensões complementares; conformidade é um estado contínuo, nunca um marco pontual.
 * Estrutura definida em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
export type ComplianceDimension = "Execucao" | "Estrutural";

export interface GovernanceCompliance {
  /** Política avaliada. */
  readonly policyId: string;

  /** Dimensão avaliada. */
  readonly dimension: ComplianceDimension;

  /** Se a Política está em conformidade nesta dimensão. */
  readonly compliant: boolean;
}
