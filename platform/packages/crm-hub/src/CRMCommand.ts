/**
 * CRM Command — os onze Comandos que mudam estado dentro do CRM Hub, cada um idempotente através de
 * um identificador de operação único (Idempotent Commands, `CRM_HUB.md` Capítulo 5).
 * Estrutura definida em `CRM_HUB.md`, Capítulo 10.
 */
export type CRMCommandType =
  | "CreateLead"
  | "ConvertLead"
  | "CreateCustomer"
  | "UpdateCustomer"
  | "AssignOwner"
  | "CreateOpportunity"
  | "MoveOpportunity"
  | "CreateTask"
  | "CompleteTask"
  | "MergeCustomer"
  | "ArchiveCustomer";

export interface CRMCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: CRMCommandType;

  /** Momento em que o Comando foi recebido pelo CRM Manager. */
  readonly requestedAt: Date;
}
