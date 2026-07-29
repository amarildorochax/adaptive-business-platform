/** Prioridade de uma NotificationRecord. */
export type NotificationPriority = "low" | "medium" | "high";

/**
 * Notificação registrada — entidade central do Notification Hub
 * (Tarefa 04). Não possui `updatedAt`: nesta Sprint, NotificationRecord
 * nunca é atualizada após criada (apenas NotificationDelivery.status
 * muda ao longo do tempo — ver NotificationDelivery.ts).
 */
export interface NotificationRecord {
  id: string;

  title: string;

  message: string;

  priority: NotificationPriority;

  createdAt: Date;

  metadata: Record<string, unknown>;
}
