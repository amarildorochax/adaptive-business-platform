/**
 * Multi-Agent Participation Precondition — o registro de que, antes de um Agente participar de um
 * grupo de coordenação (`MultiAgentRelationship`, Component 23), foi verificado que essa participação
 * decorre de uma delegação de subtarefa já registrada pelo Orchestrator (`AgentSelection`,
 * Component 17), nunca de um vínculo espontâneo ou direto entre Agentes.
 * Preserva, por construção, o princípio já fixado em `MultiAgentRelationship` — a colaboração acontece
 * exclusivamente através de `MediatedByOrchestrator`, `SharedWorkflow`, ou `SharedRecord`, nunca por
 * referência direta entre dois Agentes: este artefato vincula cada Agente ao grupo e à sua própria
 * subtarefa delegada, nunca a outro Agente do mesmo grupo.
 * Sem redefinir `AgentSelection`, `MultiAgentDefinition`, ou `MultiAgentRelationship`, e sem
 * implementar comunicação, fila, evento, consenso, ou coordenação distribuída real.
 * Artefato de integração INT-09, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-09.
 */
export interface MultiAgentParticipationPrecondition {
  /** Grupo de coordenação ao qual a participação se refere. */
  readonly groupId: string;

  /** Agente cuja participação está sendo validada — nunca referenciado em relação a outro Agente do mesmo grupo. */
  readonly agentId: string;

  /** Subtarefa cuja delegação, já registrada pelo Orchestrator, fundamenta esta participação. */
  readonly subtaskId: string;

  /** Se a delegação de subtarefa correspondente já foi confirmada pelo Orchestrator. */
  readonly delegationConfirmed: boolean;

  /** Momento em que a verificação foi concluída. */
  readonly validatedAt: Date;
}
