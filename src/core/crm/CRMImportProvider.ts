/**
 * Contrato futuro (Tarefa 15) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma importação em massa de
 * Customer a partir de uma fonte externa (ex.: planilha, outro CRM).
 */
export interface CRMImportProvider {
  importCustomers(source: string): Promise<number>;
}
