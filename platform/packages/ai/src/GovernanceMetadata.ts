/**
 * Governance Metadata — o metadado obrigatório de toda Política registrada; imutável após a
 * publicação de uma versão específica.
 * Estrutura definida em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
export interface GovernanceMetadata {
  /** Política à qual este metadado pertence. */
  readonly policyId: string;

  /** Classificação temática da Política. */
  readonly category: string;

  /** Escopos aos quais a Política se aplica. */
  readonly appliesTo: readonly string[];

  /** Princípio ou ADR de origem. */
  readonly sourceOfTruth: string;

  /** Políticas relacionadas, com sobreposição de escopo. */
  readonly relatedPolicies: readonly string[];
}
