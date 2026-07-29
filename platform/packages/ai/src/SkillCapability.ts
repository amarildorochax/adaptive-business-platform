/**
 * Skill Capability — as Capabilities às quais uma Skill é relevante; um Agente consulta o conjunto de
 * Skills já registradas relevantes à Capability em curso.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface SkillCapability {
  /** Skill associada. */
  readonly skillId: string;

  /** Capabilities às quais esta Skill é relevante. */
  readonly capabilityIds: readonly string[];
}
