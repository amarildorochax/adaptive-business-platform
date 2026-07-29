/**
 * Skill Tool Precondition — o registro de que, antes de uma Ferramenta (Component 22) ser utilizada
 * por uma Skill já associada a ela (`SkillToolAssociation`), foi verificado que a Ferramenta está no
 * estágio "Registered" de seu ciclo de vida (`ToolLifecycleStage`) e que o escopo de Permission
 * herdado da solicitação original é respeitado, sem redefinir `ToolLifecycle`, `ToolRequirement`, nem
 * implementar a verificação, a chamada externa, ou a execução da Ferramenta em si.
 * Duas dimensões, não uma única, porque `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-08,
 * já nomeia ambas explicitamente como critério de aceitação — diferente da dimensão única já usada em
 * INT-06 e INT-07, fundamentadas em um único elemento binário do Agent Contract.
 * Artefato de integração INT-08, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6.
 */
export interface SkillToolPrecondition {
  /** Skill que pretende utilizar a Ferramenta. */
  readonly skillId: string;

  /** Ferramenta cuja utilização está sendo validada — identificador opaco, sem redefinir ToolIdentity (Component 22). */
  readonly toolId: string;

  /** Se a Ferramenta está no estágio "Registered" de seu ciclo de vida. */
  readonly toolRegistered: boolean;

  /** Se o escopo de Permission herdado da solicitação original é respeitado. */
  readonly permissionScopeRespected: boolean;

  /** Momento em que a verificação foi concluída. */
  readonly validatedAt: Date;
}
