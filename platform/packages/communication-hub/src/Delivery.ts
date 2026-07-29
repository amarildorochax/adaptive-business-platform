/**
 * Delivery — o registro de tentativa de entrega de uma Message específica, mantido separado da
 * Message em si porque uma mesma Message pode ter múltiplas tentativas de Delivery ao longo do
 * tempo, cada uma com seu próprio Delivery Status (Delivery is Independent).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type DeliveryStatus = "Pending" | "Delivered" | "Read" | "Failed";

export interface Delivery {
  /** Identificador da Delivery. */
  readonly deliveryId: string;

  /** Message à qual esta Delivery se refere. */
  readonly messageId: string;

  /** Estado atual da entrega. */
  readonly status: DeliveryStatus;

  /** Momento da tentativa. */
  readonly attemptedAt: Date;
}
