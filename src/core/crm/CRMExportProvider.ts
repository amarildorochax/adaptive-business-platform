/**
 * Contrato futuro (Tarefa 15) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de exportação de Customer para uso
 * futuro (ex.: CSV/JSON).
 */
export interface CRMExportProvider {
  exportCustomers(format: "csv" | "json"): Promise<Blob>;
}
