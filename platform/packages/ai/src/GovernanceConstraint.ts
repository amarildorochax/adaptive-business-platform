/**
 * Governance Constraint — uma exceção sempre vinculada a uma Política de origem que ela modifica de
 * forma pontual; uma Política de Exceção nunca existe isoladamente.
 * Estrutura definida em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
export interface GovernanceConstraint {
  /** Política de origem à qual esta exceção está vinculada. */
  readonly policyId: string;

  /** Justificativa da exceção. */
  readonly justification: string;

  /** Aprovador da exceção. */
  readonly approvedBy: string;

  /** Momento de expiração da exceção. */
  readonly expiresAt: Date;
}
