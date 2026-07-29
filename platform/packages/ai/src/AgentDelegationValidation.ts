/**
 * Agent Delegation Validation — o registro de que, antes da etapa Agent Delegation ser concluída para
 * uma subtarefa, a completude do Agent Contract (Component 18) do Agente já selecionado por
 * `AgentSelection` foi verificada, sem redefinir a estrutura do contrato (`AgentContract`) nem
 * implementar a verificação em si.
 * `AGENT_FRAMEWORK.md`, Capítulo 5, trata a ausência de qualquer um dos dezessete elementos do Agent
 * Contract como especificação incompleta, nunca como variação legítima — este artefato registra
 * apenas o resultado dessa checagem estrutural, nunca a execução de um Agente.
 * Artefato de integração INT-05, fixado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 6, e
 * `AI_CORE_INTEGRATION_IMPLEMENTATION_BACKLOG.md`, item INT-05.
 */
export interface AgentDelegationValidation {
  /** Subtarefa cuja delegação está sendo validada — mesmo identificador de `AgentSelection`. */
  readonly subtaskId: string;

  /** Agente selecionado — identificador opaco, mesmo de `AgentSelection.agentId`, sem redefinir AgentContract (Component 18). */
  readonly agentId: string;

  /** Se os dezessete elementos obrigatórios do Agent Contract estão presentes. */
  readonly contractComplete: boolean;

  /** Momento em que a verificação foi concluída. */
  readonly validatedAt: Date;
}
