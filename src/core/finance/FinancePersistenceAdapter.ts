/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um backend de persistência real
 * para FinanceStore (hoje exclusivamente em memória).
 */
export interface FinancePersistenceAdapter {
  save(): Promise<void>;
  load(): Promise<void>;
}
