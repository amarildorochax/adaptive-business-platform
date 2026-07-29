/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor de envio de WhatsApp —
 * nenhuma integração externa é feita nesta Sprint.
 */
export interface WhatsAppProvider {
  send(phoneNumber: string, message: string): Promise<void>;
}
