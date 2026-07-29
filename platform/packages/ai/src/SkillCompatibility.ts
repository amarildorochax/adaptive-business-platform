/**
 * Skill Compatibility — as versões com as quais uma Skill permanece compatível; uma mudança de
 * contrato exige nova versão, preservando compatibilidade com Agentes que dependam da anterior.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface SkillCompatibility {
  /** Skill à qual esta compatibilidade se aplica. */
  readonly skillId: string;

  /** Versões com as quais esta Skill permanece compatível. */
  readonly compatibleVersions: readonly string[];
}
