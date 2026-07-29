/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma sincronização com sistema
 * contábil externo — nenhuma integração contábil é feita nesta Sprint.
 */
export interface AccountingProvider {
  sync(): Promise<void>;
}
