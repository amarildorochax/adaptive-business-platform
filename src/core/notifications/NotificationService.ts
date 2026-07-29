import type { NotificationRecord } from "./NotificationRecord";
import type { NotificationChannel } from "./NotificationChannel";
import type { NotificationRecipient } from "./NotificationRecipient";
import type { NotificationDelivery, NotificationDeliveryStatus } from "./NotificationDelivery";
import { NotificationStore } from "./NotificationStore";

/** Campos aceitos por `NotificationService.createNotification()`. */
export type NotificationInput = Pick<NotificationRecord, "title" | "message" | "priority" | "metadata">;

/** Campos aceitos por `NotificationService.createChannel()`. */
export type NotificationChannelInput = Pick<NotificationChannel, "type" | "enabled" | "configuration">;

/** Campos aceitos por `NotificationService.createRecipient()`. */
export type NotificationRecipientInput = Pick<NotificationRecipient, "destination" | "channelId">;

/** Campos aceitos por `NotificationService.registerDelivery()`. */
export type RegisterDeliveryInput = Pick<NotificationDelivery, "notificationId" | "recipientId">;

/**
 * Cadastro, consultas, registro de entregas e atualização de status
 * (Tarefa 09). **Nenhum envio real ocorre nesta Sprint** —
 * `registerDelivery()`/`updateDeliveryStatus()` apenas registram dados,
 * nunca chamam nenhum canal (e-mail/WhatsApp/push/SMS/webhook) de
 * verdade; esses contratos existem apenas como interfaces futuras (ver
 * EmailProvider.ts/WhatsAppProvider.ts/PushProvider.ts/SmsProvider.ts/
 * WebhookProvider.ts, Tarefa 12).
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * NotificationManager.
 *
 * Dependências: NotificationStore (própria instância).
 *
 * Consumido exclusivamente por NotificationManager.
 */
export class NotificationService {
  private readonly store = new NotificationStore();

  /** Registra uma nova NotificationRecord. */
  createNotification(input: NotificationInput): NotificationRecord {
    const record: NotificationRecord = {
      id: crypto.randomUUID(),
      title: input.title,
      message: input.message,
      priority: input.priority,
      metadata: input.metadata,
      createdAt: new Date(),
    };

    this.store.addNotification(record);

    return record;
  }

  /** Retorna a NotificationRecord de `id`, ou `undefined` se não existir. */
  getNotification(id: string): NotificationRecord | undefined {
    return this.store.getNotification(id);
  }

  /** Retorna todas as NotificationRecord já registradas. */
  listNotifications(): NotificationRecord[] {
    return this.store.getAllNotifications();
  }

  /** Cria um novo NotificationChannel, reutilizável por múltiplos NotificationRecipient. */
  createChannel(input: NotificationChannelInput): NotificationChannel {
    const channel: NotificationChannel = {
      id: crypto.randomUUID(),
      type: input.type,
      enabled: input.enabled,
      configuration: input.configuration,
    };

    this.store.addChannel(channel);

    return channel;
  }

  /** Retorna todos os NotificationChannel já cadastrados. */
  listChannels(): NotificationChannel[] {
    return this.store.getAllChannels();
  }

  /** Cria um novo NotificationRecipient. */
  createRecipient(input: NotificationRecipientInput): NotificationRecipient {
    const recipient: NotificationRecipient = {
      id: crypto.randomUUID(),
      destination: input.destination,
      channelId: input.channelId,
      createdAt: new Date(),
    };

    this.store.addRecipient(recipient);

    return recipient;
  }

  /** Retorna todos os NotificationRecipient já cadastrados. */
  listRecipients(): NotificationRecipient[] {
    return this.store.getAllRecipients();
  }

  /** Registra uma nova NotificationDelivery — `status` inicia sempre em `"pending"`. */
  registerDelivery(input: RegisterDeliveryInput): NotificationDelivery {
    const delivery: NotificationDelivery = {
      id: crypto.randomUUID(),
      notificationId: input.notificationId,
      recipientId: input.recipientId,
      status: "pending",
      createdAt: new Date(),
      logs: [],
    };

    this.store.addDelivery(delivery);

    return delivery;
  }

  /**
   * Atualiza o status de uma NotificationDelivery já registrada.
   * `deliveredAt` é preenchida apenas quando `status` passa a
   * `"delivered"`. Retorna `undefined` se a entrega não existir.
   */
  updateDeliveryStatus(id: string, status: NotificationDeliveryStatus): NotificationDelivery | undefined {
    const existing = this.store.getDelivery(id);

    if (!existing) {
      return undefined;
    }

    const updated: NotificationDelivery = {
      ...existing,
      status,
      deliveredAt: status === "delivered" ? new Date() : existing.deliveredAt,
      logs: [...existing.logs, `Status atualizado para "${status}".`],
    };

    this.store.addDelivery(updated);

    return updated;
  }

  /** Retorna as NotificationDelivery já registradas — todas, ou apenas de `notificationId` quando informado. */
  listDeliveries(notificationId?: string): NotificationDelivery[] {
    const all = this.store.getAllDeliveries();

    return notificationId === undefined ? all : all.filter((delivery) => delivery.notificationId === notificationId);
  }
}
