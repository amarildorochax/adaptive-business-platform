/**
 * Agent Delegation Record — criado e mantido pelo Delegation Coordinator, registra que uma Agent
 * Capability Request já foi encaminhada ao contrato externo do AI Hub
 * (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seções 4, 5 e 12). Nenhum tipo de `@abp/ai` é referenciado
 * por este arquivo — o AI Hub é consumido exclusivamente por identificador opaco, consistente com
 * `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 007.
 * `correlationId` é opcional e, quando presente, é o mesmo identificador de correlação já propagado
 * por um Execution Context do Runtime (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 11) — nunca um
 * novo mecanismo de correlação paralelo.
 * `AgentDelegationStatus` é o ciclo de vida externo de uma delegação, deliberadamente distinto e mais
 * simples que o `AgentLifecycleStage` (nove estágios) já implementado em `@abp/ai` para o próprio
 * Agente — uma delegação pode estar `"Completed"` enquanto o Agente que a processou permanece, do
 * ponto de vista do AI Core, em seu próprio estágio `"Execução"`, atendendo a outras solicitações — os
 * dois ciclos de vida existem em níveis de abstração distintos (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`,
 * Seção 6).
 * Estrutura definida em `AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seções 5 e 6.
 */
export type AgentDelegationStatus =
  | "Requested"
  | "Delegated"
  | "InProgress"
  | "Completed"
  | "Failed";

export interface AgentDelegationRecord {
  /** Identificador do Agent Delegation Record. */
  readonly agentDelegationRecordId: string;

  /** Agent Capability Request de origem — ver AgentCapabilityRequest.ts. */
  readonly agentCapabilityRequestId: string;

  /** Identificador de correlação, opcional — quando presente, propagado por um Execution Context do Runtime. */
  readonly correlationId?: string;

  /** Estado atual da delegação. */
  readonly status: AgentDelegationStatus;

  /** Momento em que a delegação foi encaminhada ao contrato externo do AI Hub. */
  readonly delegatedAt: Date;
}
