/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor de pagamento (ex.:
 * PIX, boleto) — nenhum pagamento é executado nesta Sprint.
 */
export interface PaymentProvider {
  charge(amount: number, currency: string): Promise<void>;
}
