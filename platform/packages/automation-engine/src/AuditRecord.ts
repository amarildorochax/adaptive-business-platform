/**
 * Audit Record — o registro imutável, preservado pelo Audit Engine, de toda mudança relevante de
 * Workflow (criação, edição, ativação, desativação) e de toda aprovação humana concedida ou negada
 * através do Approval Engine (`AUTOMATION_ENGINE.md`, Capítulos 7 e 16).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 16.
 */
export type AuditedOperation =
  | "WorkflowCreated"
  | "WorkflowEdited"
  | "WorkflowActivated"
  | "WorkflowDeactivated"
  | "ApprovalGranted"
  | "ApprovalDenied";

export interface AuditRecord {
  /** Identificador do Audit Record. */
  readonly auditRecordId: string;

  /** Operação auditada. */
  readonly operation: AuditedOperation;

  /** Workflow ou Approval Checkpoint ao qual esta operação se refere — identificador opaco. */
  readonly subjectId: string;

  /** Identidade que realizou a operação — identificador opaco do Identity Hub. */
  readonly performedByIdentityId: string;

  /** Momento em que a operação ocorreu — imutável a partir deste ponto. */
  readonly occurredAt: Date;
}
