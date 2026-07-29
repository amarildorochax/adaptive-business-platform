/**
 * Webhook Event — o registro bruto de notificação recebida de um Canal externo, antes de sua
 * tradução em Message ou em atualização de Delivery Status; nunca aplicado diretamente sem essa
 * tradução (Anti-Corruption Layer, Blueprint ADR-008).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface WebhookEvent {
  /** Identificador do Webhook Event. */
  readonly webhookEventId: string;

  /** Channel Account de origem. */
  readonly channelAccountId: string;

  /** Momento de recebimento. */
  readonly receivedAt: Date;

  /** Momento em que o Webhook Event foi traduzido em Message ou em atualização de Delivery Status. */
  readonly translatedAt?: Date;
}
