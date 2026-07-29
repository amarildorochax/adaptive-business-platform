/**
 * Skill State — os três estágios pré-execução do ciclo de vida de uma Skill; Descoberta, Autorização
 * e Execução permanecem deliberadamente fora deste componente, por serem mecanismos de runtime.
 * Estrutura definida em SKILL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export type SkillLifecycleStage = "Implemented" | "Registered" | "Deprecated";

export interface SkillState {
  /** Skill à qual este estado se refere. */
  readonly skillId: string;

  /** Estágio atual do ciclo de vida. */
  readonly stage: SkillLifecycleStage;

  /** Momento em que a Skill entrou neste estágio. */
  readonly enteredAt: Date;
}
