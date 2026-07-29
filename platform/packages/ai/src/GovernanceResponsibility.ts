/**
 * Governance Responsibility — a atribuição de um papel de governança a um responsável, para uma
 * Política específica, sustentando a verificação de Segregação de Funções.
 * Estrutura definida em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
import type { GovernanceRole } from "./GovernanceRole.js";

export interface GovernanceResponsibility {
  /** Política à qual esta responsabilidade se refere. */
  readonly policyId: string;

  /** Papel atribuído. */
  readonly role: GovernanceRole;

  /** Responsável pelo papel atribuído. */
  readonly assigneeId: string;
}
