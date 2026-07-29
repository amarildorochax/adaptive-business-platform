/**
 * Task — trabalho pendente, ainda não realizado, atribuído a um responsável específico, associado a
 * exatamente um Relationship; distinto de Activity por sua natureza prospectiva, não retrospectiva.
 * Estrutura definida em `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Task {
  /** Identificador do Task. */
  readonly taskId: string;

  /** Tenant ao qual o Task pertence. */
  readonly tenantId: string;

  /** Relationship ao qual este Task está associado. */
  readonly relationshipId: string;

  /** Descrição do trabalho pendente. */
  readonly description: string;

  /** Identificador opaco do responsável atribuído. */
  readonly assigneeId: string;

  /** Se o Task já foi concluído. */
  readonly completed: boolean;

  /** Prazo, quando aplicável. */
  readonly dueAt?: Date;

  /** Momento de conclusão, quando aplicável. */
  readonly completedAt?: Date;
}
