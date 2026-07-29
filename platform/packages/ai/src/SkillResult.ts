/**
 * Skill Result — o formato esperado do resultado de uma Skill, sempre estruturado e previsível,
 * permitindo que o Reasoning Engine de um Agente o incorpore à sua Síntese e à sua Inferência.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface SkillResult {
  /** Skill à qual este formato de resultado se aplica. */
  readonly skillId: string;

  /** Descrição do formato estruturado e previsível esperado. */
  readonly resultFormat: string;
}
