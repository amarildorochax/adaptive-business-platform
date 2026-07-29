/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor real de envio de SMS —
 * nenhum SMS é enviado nesta Sprint.
 */
export interface SmsProvider {
  send(phoneNumber: string, message: string): Promise<void>;
}
