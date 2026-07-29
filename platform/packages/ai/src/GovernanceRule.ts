/**
 * Governance Rule — a condição sob a qual uma Política é avaliada, e o efeito resultante dessa
 * avaliação.
 * Estrutura definida em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
export type GovernanceEffect =
  | "Permitir"
  | "Bloquear"
  | "ExigirAprovacaoAdicional"
  | "ExigirRegistroAdicional";

export interface GovernanceRule {
  /** Política à qual esta regra pertence. */
  readonly policyId: string;

  /** Circunstância sob a qual a Política é avaliada. */
  readonly condition: string;

  /** Resultado da avaliação desta regra. */
  readonly effect: GovernanceEffect;
}
