/**
 * Skill Constraint — uma restrição arquitetural aplicável a uma Skill, incluindo a garantia de
 * Isolamento — nenhuma Skill produz efeito colateral não documentado sobre outra Skill ou Agente.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface SkillConstraint {
  /** Skill à qual esta restrição se aplica. */
  readonly skillId: string;

  /** Descrição da restrição arquitetural. */
  readonly description: string;
}
