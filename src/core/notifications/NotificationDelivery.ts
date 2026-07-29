/** Status de uma NotificationDelivery — nunca reflete um envio real (ver nota em NotificationService.ts). */
export type NotificationDeliveryStatus = "pending" | "delivered" | "failed";

/**
 * Registro de entrega — liga uma NotificationRecord a um
 * NotificationRecipient (Tarefa 07). Criada sempre com `status:
 * "pending"` por `NotificationService.registerDelivery()`; `status`
 * muda ao longo do tempo via `NotificationService.
 * updateDeliveryStatus()` — a única entidade mutável deste módulo
 * além da criação (nenhuma das outras três tem `updatedAt`).
 *
 * `deliveredAt` só é preenchida quando `status` passa a `"delivered"`.
 */
export interface NotificationDelivery {
  id: string;

  notificationId: string;

  recipientId: string;

  status: NotificationDeliveryStatus;

  createdAt: Date;

  deliveredAt?: Date;

  logs: string[];
}
