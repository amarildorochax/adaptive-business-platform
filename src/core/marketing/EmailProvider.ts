/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor de envio de e-mail —
 * nenhuma integração externa é feita nesta Sprint.
 */
export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<void>;
}
