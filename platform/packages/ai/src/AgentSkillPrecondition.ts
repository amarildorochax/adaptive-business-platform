/**
 * Agent Skill Precondition — o registro de que, antes de uma Skill (Component 21) ser utilizada por um
 * Agente já associado a ela (`AgentSkillAssociation`), foi verificado que esse Agente declara contrato
 * de descoberta e invocação de Skill em seu Agent Contract
 * (`AgentContract.skillInvocationDeclared`, Component 18), sem redefinir nenhum dos dois contratos e
 * sem implementar a verificação, o carregamento, ou a execução da Skill em si.
 * Mesmo padrão já aplicado por `AgentReasoningPrecondition` (INT-06), reaplicado por analogia direta.
 * Artefato de integração INT-07, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-07.
 */
export interface AgentSkillPrecondition {
  /** Agente que pretende utilizar a Skill. */
  readonly agentId: string;

  /** Skill cuja utilização está sendo validada — identificador opaco, sem redefinir SkillDefinition (Component 21). */
  readonly skillId: string;

  /** Se o Agente declara contrato de descoberta e invocação de Skill. */
  readonly skillInvocationDeclared: boolean;

  /** Momento em que a verificação foi concluída. */
  readonly validatedAt: Date;
}
