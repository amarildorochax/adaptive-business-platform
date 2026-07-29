import type { NotificationRecord } from "./NotificationRecord";
import type { NotificationChannel } from "./NotificationChannel";
import type { NotificationRecipient } from "./NotificationRecipient";
import type { NotificationDelivery } from "./NotificationDelivery";

/**
 * Armazenamento de NotificationRecord/NotificationChannel/
 * NotificationRecipient/NotificationDelivery — exclusivamente em
 * memória (`Map`), sem persistência (Tarefa 08). Único Store desta
 * Sprint — guarda as quatro entidades do domínio, cada uma em seu
 * próprio `Map`, indexado por `id`.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * regra de negócio (isso é responsabilidade de NotificationService) e
 * nenhuma emissão de evento (isso é responsabilidade de
 * NotificationManager).
 *
 * Consumido exclusivamente por NotificationService.
 */
export class NotificationStore {
  private notifications = new Map<string, NotificationRecord>();

  private channels = new Map<string, NotificationChannel>();

  private recipients = new Map<string, NotificationRecipient>();

  private deliveries = new Map<string, NotificationDelivery>();

  /** Adiciona uma nova NotificationRecord. */
  addNotification(record: NotificationRecord): void {
    this.notifications.set(record.id, record);
  }

  /** Retorna a NotificationRecord de `id`, ou `undefined` se não existir. */
  getNotification(id: string): NotificationRecord | undefined {
    return this.notifications.get(id);
  }

  /** Retorna todas as NotificationRecord já registradas. */
  getAllNotifications(): NotificationRecord[] {
    return Array.from(this.notifications.values());
  }

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um NotificationChannel. */
  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel);
  }

  /** Retorna todos os NotificationChannel já cadastrados. */
  getAllChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  /** Adiciona um novo NotificationRecipient. */
  addRecipient(recipient: NotificationRecipient): void {
    this.recipients.set(recipient.id, recipient);
  }

  /** Retorna todos os NotificationRecipient já cadastrados. */
  getAllRecipients(): NotificationRecipient[] {
    return Array.from(this.recipients.values());
  }

  /** Adiciona (ou substitui, se já existir o mesmo `id`) uma NotificationDelivery. */
  addDelivery(delivery: NotificationDelivery): void {
    this.deliveries.set(delivery.id, delivery);
  }

  /** Retorna a NotificationDelivery de `id`, ou `undefined` se não existir. */
  getDelivery(id: string): NotificationDelivery | undefined {
    return this.deliveries.get(id);
  }

  /** Retorna todas as NotificationDelivery já registradas. */
  getAllDeliveries(): NotificationDelivery[] {
    return Array.from(this.deliveries.values());
  }

  /** Remove todos os dados armazenados (as quatro entidades). */
  clear(): void {
    this.notifications.clear();
    this.channels.clear();
    this.recipients.clear();
    this.deliveries.clear();
  }
}
