/**
 * Agent Skill Association — o registro de que um Agente, ao preparar a execução de uma subtarefa,
 * associou-se a uma ou mais Skills já registradas (Component 21), através de identificador opaco, sem
 * redefinir `SkillDefinition`, `SkillCapability`, nem `AgentContract` (Component 18).
 * Diferente de `ReasoningCycleState` (Component 19), nenhum artefato já aprovado de Skill Runtime
 * referenciava `agentId` antes desta integração — este é o primeiro vínculo entre os dois componentes.
 * Artefato de integração INT-07, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-07.
 */
export interface AgentSkillAssociation {
  /** Agente que se associa às Skills. */
  readonly agentId: string;

  /** Subtarefa cuja preparação de execução motivou a associação. */
  readonly subtaskId: string;

  /** Skills associadas — identificadores opacos, sem redefinir SkillDefinition (Component 21). */
  readonly skillIds: readonly string[];

  /** Momento da associação. */
  readonly associatedAt: Date;
}
