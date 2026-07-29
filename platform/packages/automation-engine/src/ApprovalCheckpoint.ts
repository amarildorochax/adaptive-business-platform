/**
 * Approval Checkpoint — o ponto de checkpoint humano administrado pelo Approval Engine: quando um
 * Workflow alcança uma Action classificada como de alto impacto, o Approval Engine pausa a execução,
 * notifica o Usuário responsável, e retoma a execução apenas após confirmação explícita, nunca
 * prosseguindo silenciosamente na ausência de resposta (Human Approval When Needed,
 * `AUTOMATION_ENGINE.md`, Capítulo 5, ADR-005).
 * Uma Execution é considerada pausada para aprovação quando referenciada por um Approval Checkpoint
 * de status "Pending" — `Execution.status` (Sprint 6.3) permanece intencionalmente inalterado, nunca
 * modificado retroativamente para acomodar este conceito.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type ApprovalStatus = "Pending" | "Approved" | "Denied";

export interface ApprovalCheckpoint {
  /** Identificador do Approval Checkpoint. */
  readonly approvalCheckpointId: string;

  /** Execution Step de alto impacto que exige aprovação — ver ExecutionStep.ts (Sprint 6.3). */
  readonly executionStepId: string;

  /** Estado atual do checkpoint. */
  readonly status: ApprovalStatus;

  /** Identidade responsável pela resolução, quando já resolvido — identificador opaco do Identity Hub. */
  readonly resolvedByIdentityId?: string;

  /** Momento da solicitação. */
  readonly requestedAt: Date;

  /** Momento da resolução, quando aplicável. */
  readonly resolvedAt?: Date;
}
