/**
 * Contrato futuro (Tarefa 11) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma sincronização com um data
 * warehouse externo — nenhuma persistência ou integração externa é
 * feita nesta Sprint (AnalyticsStore é exclusivamente em memória).
 */
export interface DataWarehouseProvider {
  sync(): Promise<void>;
}
