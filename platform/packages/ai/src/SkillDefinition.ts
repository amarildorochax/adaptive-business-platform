/**
 * Skill Definition — a identidade declarativa de uma Skill, capacidade nomeada e reutilizável
 * descoberta e invocada por um Agente, nunca pertencente exclusivamente a um único Agente.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface SkillDefinition {
  /** Identificador da Skill. */
  readonly skillId: string;

  /** Nome da Skill. */
  readonly name: string;
}
