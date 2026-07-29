/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor real de envio de
 * WhatsApp — nenhum WhatsApp é enviado nesta Sprint.
 *
 * Nota de nomenclatura: mesma colisão de `EmailProvider.ts` desta
 * pasta — ver nota lá e em Notifications.ts.
 */
export interface WhatsAppProvider {
  send(phoneNumber: string, message: string): Promise<void>;
}
