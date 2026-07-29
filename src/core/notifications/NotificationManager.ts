import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { NotificationRecord } from "./NotificationRecord";
import type { NotificationChannel } from "./NotificationChannel";
import type { NotificationRecipient } from "./NotificationRecipient";
import type { NotificationDelivery, NotificationDeliveryStatus } from "./NotificationDelivery";
import {
  NotificationService,
  type NotificationInput,
  type NotificationChannelInput,
  type NotificationRecipientInput,
  type RegisterDeliveryInput,
} from "./NotificationService";
import { NotificationMetrics, type NotificationMetricsSnapshot } from "./NotificationMetrics";

/**
 * Coordena todas as operações do Notification Hub (Tarefa 03) — delega
 * cadastro/consulta/registro de entregas/atualização de status a
 * NotificationService, registra NotificationMetrics e emite os eventos
 * de ciclo de vida (NOTIFICATION_CREATED/NOTIFICATION_UPDATED/
 * NOTIFICATION_DELIVERY_REGISTERED).
 *
 * Nunca executa envio real (e-mail/WhatsApp/push/SMS/webhook) — apenas
 * coordena NotificationService e a infraestrutura cross-cutting
 * (EventBus, NotificationMetrics). Não emite evento para
 * `createChannel()`/`createRecipient()` — apenas os três eventos
 * explicitamente pedidos pela Tarefa 11.
 *
 * `NOTIFICATION_UPDATED` é emitido por `updateDeliveryStatus()` — a
 * única mutação pós-criação deste módulo (NotificationRecord/
 * NotificationChannel/NotificationRecipient não têm `updatedAt`; apenas
 * NotificationDelivery.status muda ao longo do tempo).
 *
 * Consumido exclusivamente por Notifications (fachada).
 */
export class NotificationManager {
  private readonly service = new NotificationService();

  private readonly metrics = new NotificationMetrics();

  /** Registra uma nova NotificationRecord. */
  createNotification(input: NotificationInput): NotificationRecord {
    const record = this.service.createNotification(input);
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.NOTIFICATION_CREATED,
      source: "NotificationManager",
      payload: { id: record.id, priority: record.priority },
      createdAt: record.createdAt,
    });

    return record;
  }

  /** Retorna a NotificationRecord de `id`, ou `undefined` se não existir. Registra consulta. */
  getNotification(id: string): NotificationRecord | undefined {
    this.metrics.recordQuery();
    return this.service.getNotification(id);
  }

  /** Retorna todas as NotificationRecord já registradas. Registra consulta. */
  listNotifications(): NotificationRecord[] {
    this.metrics.recordQuery();
    return this.service.listNotifications();
  }

  /** Cria um novo NotificationChannel. */
  createChannel(input: NotificationChannelInput): NotificationChannel {
    const channel = this.service.createChannel(input);
    this.metrics.recordMutation();
    return channel;
  }

  /** Retorna todos os NotificationChannel cadastrados. Registra consulta. */
  listChannels(): NotificationChannel[] {
    this.metrics.recordQuery();
    return this.service.listChannels();
  }

  /** Cria um novo NotificationRecipient. */
  createRecipient(input: NotificationRecipientInput): NotificationRecipient {
    const recipient = this.service.createRecipient(input);
    this.metrics.recordMutation();
    return recipient;
  }

  /** Retorna todos os NotificationRecipient cadastrados. Registra consulta. */
  listRecipients(): NotificationRecipient[] {
    this.metrics.recordQuery();
    return this.service.listRecipients();
  }

  /** Registra uma nova NotificationDelivery. */
  registerDelivery(input: RegisterDeliveryInput): NotificationDelivery {
    const delivery = this.service.registerDelivery(input);
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.NOTIFICATION_DELIVERY_REGISTERED,
      source: "NotificationManager",
      payload: { id: delivery.id, notificationId: delivery.notificationId, recipientId: delivery.recipientId },
      createdAt: delivery.createdAt,
    });

    return delivery;
  }

  /** Atualiza o status de uma NotificationDelivery. Retorna `undefined` se não existir. */
  updateDeliveryStatus(id: string, status: NotificationDeliveryStatus): NotificationDelivery | undefined {
    const updated = this.service.updateDeliveryStatus(id, status);

    if (updated) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.NOTIFICATION_UPDATED,
        source: "NotificationManager",
        payload: { id: updated.id, status: updated.status },
        createdAt: updated.deliveredAt ?? new Date(),
      });
    }

    return updated;
  }

  /** Retorna as NotificationDelivery de uma NotificationRecord (ou todas, se `notificationId` omitido). Registra consulta. */
  listDeliveries(notificationId?: string): NotificationDelivery[] {
    this.metrics.recordQuery();
    return this.service.listDeliveries(notificationId);
  }

  /** Métricas agregadas de uso do Notification Hub. */
  getMetrics(): NotificationMetricsSnapshot {
    return this.metrics.snapshot({
      notifications: this.service.listNotifications().length,
      deliveries: this.service.listDeliveries().length,
      channels: this.service.listChannels().length,
      recipients: this.service.listRecipients().length,
    });
  }
}
