/**
 * Governance Policy — uma regra formal, versionada e explícita que declara uma condição, uma
 * restrição ou uma permissão aplicável a um comportamento de Inteligência Artificial; nunca contém
 * lógica de negócio.
 * Estrutura, regras e invariantes definidas em AI_GOVERNANCE_CONCRETE_STRUCTURE.md.
 */
import type { GovernanceLifecycleStage } from "./GovernanceLifecycle.js";

export interface GovernancePolicy {
  /** Identificador único e imutável da Política. */
  readonly policyId: string;

  /** Nome da Política. */
  readonly name: string;

  /** Escopo — global, Empresa, módulo, Capability, Agente, ou Skill. */
  readonly scope: string;

  /** Versão da Política. */
  readonly version: string;

  /** Estágio atual do ciclo de vida. */
  readonly status: GovernanceLifecycleStage;

  /** Prioridade da Política. */
  readonly priority: number;

  /** Responsável formal e accountável pela Política. */
  readonly owner: string;

  /** Início da vigência. */
  readonly effectiveFrom: Date;

  /** Fim da vigência, quando aplicável. */
  readonly effectiveUntil?: Date;
}
