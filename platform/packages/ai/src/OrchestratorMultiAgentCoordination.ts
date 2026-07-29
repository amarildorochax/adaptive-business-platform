/**
 * Orchestrator Multi-Agent Coordination — o registro de que uma solicitação, processada pelo
 * Orchestrator, envolveu um grupo de coordenação Multi-Agent (Component 23), através de identificador
 * opaco, sem redefinir `DecisionPipelineState` (Component 17) nem `MultiAgentIdentity`/
 * `MultiAgentDefinition` (Component 23).
 * Nenhum artefato já aprovado de Multi-Agent System referenciava `requestId` antes desta integração —
 * `MultiAgentIdentity`, `MultiAgentDefinition`, `MultiAgentState` e `MultiAgentRelationship` são todos
 * identificados exclusivamente por `groupId`/`agentIds`.
 * Artefato de integração INT-09, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-09.
 */
export interface OrchestratorMultiAgentCoordination {
  /** Solicitação para a qual a coordenação Multi-Agent foi acionada. */
  readonly requestId: string;

  /** Grupo de coordenação envolvido — identificador opaco, sem redefinir MultiAgentIdentity (Component 23). */
  readonly groupId: string;

  /** Momento em que a coordenação foi vinculada à solicitação. */
  readonly coordinatedAt: Date;
}
