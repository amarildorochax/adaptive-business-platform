/**
 * Skill Metadata — metadado estrutural de uma Skill, sustentando a mesma disciplina de
 * rastreabilidade já aplicada aos demais componentes de AI Core.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface SkillMetadata {
  /** Identificador da Skill. */
  readonly skillId: string;

  /** Momento de criação da Skill. */
  readonly createdAt: Date;

  /** Versão da Skill. */
  readonly version: string;
}
