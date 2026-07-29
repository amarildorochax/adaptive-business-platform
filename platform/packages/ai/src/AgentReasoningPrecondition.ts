/**
 * Agent Reasoning Precondition — o registro de que, antes de um Agente iniciar um ciclo de raciocínio
 * (`ReasoningCycleState`, Component 19), foi verificado que esse Agente declara contrato de raciocínio
 * especializado em seu Agent Contract (`AgentContract.reasoningInterfaceDeclared`, Component 18), sem
 * redefinir nenhum dos dois contratos e sem implementar a verificação, a inferência, ou o ciclo em si.
 * `ReasoningCycleState` (Component 19) já vincula `agentId` e `subtaskId` por identificador opaco —
 * este artefato não duplica esse vínculo, apenas registra a checagem de pré-condição que o precede.
 * Artefato de integração INT-06, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-06.
 */
export interface AgentReasoningPrecondition {
  /** Agente que pretende iniciar o ciclo de raciocínio — mesmo identificador de `ReasoningCycleState.agentId`. */
  readonly agentId: string;

  /** Subtarefa sobre a qual o raciocínio seria aplicado — mesmo identificador de `ReasoningCycleState.subtaskId`. */
  readonly subtaskId: string;

  /** Se o Agente declara contrato de raciocínio especializado em seu Agent Contract. */
  readonly reasoningInterfaceDeclared: boolean;

  /** Momento em que a verificação foi concluída. */
  readonly validatedAt: Date;
}
