/**
 * Tipo de canal — mesmo vocabulário dos cinco contratos futuros da
 * Tarefa 12 (EmailProvider/WhatsAppProvider/PushProvider/SmsProvider/
 * WebhookProvider), para que um NotificationChannel.type já indique,
 * sem ambiguidade, qual contrato futuro o implementaria.
 */
export type NotificationChannelType = "email" | "whatsapp" | "push" | "sms" | "webhook";

/**
 * Canal de entrega reutilizável — descreve **onde** uma notificação
 * poderia ser entregue, nunca envia nada de fato (Tarefa 05).
 * Referenciado por `NotificationRecipient.channelId`.
 *
 * `configuration` é deliberadamente `Record<string, unknown>` —
 * nenhuma integração externa é feita nesta Sprint, então nenhum código
 * interpreta seu conteúdo (ver contratos futuros, Tarefa 12).
 */
export interface NotificationChannel {
  id: string;

  type: NotificationChannelType;

  enabled: boolean;

  configuration: Record<string, unknown>;
}
