/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de emissão de nota fiscal a partir de
 * uma RevenueRecord — nenhuma nota fiscal é emitida nesta Sprint.
 */
export interface InvoiceProvider {
  issue(revenueId: string): Promise<void>;
}
