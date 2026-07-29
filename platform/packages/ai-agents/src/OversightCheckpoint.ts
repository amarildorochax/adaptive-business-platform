/**
 * Oversight Checkpoint — o ponto de checkpoint humano administrado pelo Oversight Gate: quando um
 * Agent Task Result já é classificado como de alto impacto — financeiro, jurídico, reputacional, ou
 * qualquer outra categoria já definida pela política da plataforma —, o Oversight Gate retém sua
 * liberação ao domínio solicitante até confirmação humana explícita, nunca liberando silenciosamente
 * (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 17). Mesmo princípio Human Oversight já central a
 * `AI_MANIFESTO.md`, já aplicado a `AI_HUB.md`, Capítulo 5, e a `AUTOMATION_ENGINE.md`, ADR-005 (Human
 * Approval When Needed).
 *
 * Deliberadamente distinto de `ApprovalCheckpoint` (`@abp/automation-engine`, Sprint 6.4): aquele
 * referencia um `executionStepId` — uma etapa de um Workflow em execução, de propriedade exclusiva do
 * Automation Engine; este referencia um `agentTaskResultId` — o resultado de uma delegação a uma
 * capacidade apoiada por Agente, de propriedade exclusiva de AI Agents. Os dois checkpoints nunca se
 * referenciam mutuamente, e nenhum dos dois é redefinido ou generalizado pelo outro.
 *
 * `AgentTaskResult.ts` (Sprint 8.1) permanece intencionalmente inalterado — o mesmo princípio já
 * aplicado a `Execution.status`, nunca modificado retroativamente para acomodar `ApprovalCheckpoint`.
 * Um Agent Task Result é considerado retido para confirmação quando referenciado por um Oversight
 * Checkpoint de status `"Pending"`.
 * Estrutura definida em `AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seções 4 e 17.
 */
export type OversightStatus = "Pending" | "Approved" | "Denied";

export interface OversightCheckpoint {
  /** Identificador do Oversight Checkpoint. */
  readonly oversightCheckpointId: string;

  /** Agent Task Result de alto impacto que exige confirmação — ver AgentTaskResult.ts (Sprint 8.1). */
  readonly agentTaskResultId: string;

  /** Estado atual do checkpoint. */
  readonly status: OversightStatus;

  /** Identidade responsável pela resolução, quando já resolvido — identificador opaco do Identity Hub. */
  readonly resolvedByIdentityId?: string;

  /** Momento da solicitação. */
  readonly requestedAt: Date;

  /** Momento da resolução, quando aplicável. */
  readonly resolvedAt?: Date;
}
