/**
 * Governance Risk — as três categorias de RiskTier segundo as quais toda ação de Inteligência
 * Artificial desta plataforma é classificada.
 * Estrutura definida em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
export type RiskTier =
  | "BaixoImpacto"
  | "ImpactoFinanceiroOuEstrategico"
  | "ImpactoDeSeguranca";

export interface GovernanceRisk {
  /** Política classificada. */
  readonly policyId: string;

  /** Classificação de risco. */
  readonly riskTier: RiskTier;
}
