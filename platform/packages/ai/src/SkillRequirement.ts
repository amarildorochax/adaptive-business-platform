/**
 * Skill Requirement — os requisitos que devem estar satisfeitos antes de uma Skill poder ser
 * invocada, incluindo escopo de Permission exigido e aplicabilidade de Execution Policy.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface SkillRequirement {
  /** Skill à qual este requisito se aplica. */
  readonly skillId: string;

  /** Escopo de Permission exigido do Agente solicitante. */
  readonly permissionScope: readonly string[];

  /** Se uma Execution Policy é aplicável antes da invocação efetiva. */
  readonly executionPolicyRequired: boolean;
}
