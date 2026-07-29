import type { NotificationRecord } from "./NotificationRecord";
import type { NotificationChannel } from "./NotificationChannel";
import type { NotificationRecipient } from "./NotificationRecipient";
import type { NotificationDelivery, NotificationDeliveryStatus } from "./NotificationDelivery";
import { NotificationManager } from "./NotificationManager";
import type {
  NotificationInput,
  NotificationChannelInput,
  NotificationRecipientInput,
  RegisterDeliveryInput,
} from "./NotificationService";
import type { NotificationMetricsSnapshot } from "./NotificationMetrics";

/**
 * Fachada pública única do Notification Hub (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * Notifications.createNotification/getNotification/listNotifications/
 *               registerDelivery/getMetrics             ← única fachada
 *               (+ createChannel/createRecipient/updateDeliveryStatus/
 *                  listChannels/listRecipients/listDeliveries, além do mínimo)
 *    ↓
 * NotificationManager   ← coordena; nunca executa envio real
 *    ↓
 * NotificationService     ← cadastro, consultas, registro de entregas, atualização de status
 *    ↓
 * NotificationStore
 *    ↓
 * NotificationRecord · NotificationChannel · NotificationRecipient · NotificationDelivery
 * ```
 *
 * Registra notificações, gerencia destinatários, controla status e
 * seleciona canais — nunca envia e-mail, WhatsApp, push, SMS ou
 * webhook de verdade (ver contratos futuros, Tarefa 12).
 *
 * Este módulo não consome nenhum outro domínio da plataforma — nenhum
 * deles é importado aqui, direta ou indiretamente.
 *
 * Nota de projeto: `NOTIFICATION_CREATED` já existia em `EventTypes.ts`
 * (categoria "System", desde a Sprint 0A, nunca antes emitido por
 * nenhum caminho real) — reaproveitado aqui, não duplicado. Também
 * houve colisão de nome com `EmailProvider`/`WhatsAppProvider`
 * (`@/core/marketing`, Sprint 10) — resolvida excluindo `./notifications`
 * do `export *` de `core/index.ts` (mesmo princípio já usado na colisão
 * `WorkflowEngine`, Sprint Workflow Engine); este módulo, em si,
 * permanece completo e correto — apenas o barrel de topo não o agrega.
 *
 * Responsabilidade: nenhum consumidor deve importar NotificationManager,
 * NotificationService ou NotificationStore diretamente — todos usam
 * exclusivamente esta fachada.
 *
 * Dependências: NotificationManager.
 */
export class Notifications {
  private readonly manager = new NotificationManager();

  /** Registra uma nova NotificationRecord. */
  createNotification(input: NotificationInput): NotificationRecord {
    return this.manager.createNotification(input);
  }

  /** Recupera uma NotificationRecord por `id`, ou `undefined` se não existir. */
  getNotification(id: string): NotificationRecord | undefined {
    return this.manager.getNotification(id);
  }

  /** Retorna todas as NotificationRecord já registradas. */
  listNotifications(): NotificationRecord[] {
    return this.manager.listNotifications();
  }

  /** Registra uma nova NotificationDelivery. */
  registerDelivery(input: RegisterDeliveryInput): NotificationDelivery {
    return this.manager.registerDelivery(input);
  }

  /** Cria um novo NotificationChannel, reutilizável por múltiplos NotificationRecipient. */
  createChannel(input: NotificationChannelInput): NotificationChannel {
    return this.manager.createChannel(input);
  }

  /** Retorna todos os NotificationChannel cadastrados. */
  listChannels(): NotificationChannel[] {
    return this.manager.listChannels();
  }

  /** Cria um novo NotificationRecipient. */
  createRecipient(input: NotificationRecipientInput): NotificationRecipient {
    return this.manager.createRecipient(input);
  }

  /** Retorna todos os NotificationRecipient cadastrados. */
  listRecipients(): NotificationRecipient[] {
    return this.manager.listRecipients();
  }

  /** Atualiza o status de uma NotificationDelivery. */
  updateDeliveryStatus(id: string, status: NotificationDeliveryStatus): NotificationDelivery | undefined {
    return this.manager.updateDeliveryStatus(id, status);
  }

  /** Retorna as NotificationDelivery de uma NotificationRecord (ou todas, se `notificationId` omitido). */
  listDeliveries(notificationId?: string): NotificationDelivery[] {
    return this.manager.listDeliveries(notificationId);
  }

  /** Métricas agregadas de uso do Notification Hub. */
  getMetrics(): NotificationMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do Notifications para toda a plataforma. */
export const notifications = new Notifications();
