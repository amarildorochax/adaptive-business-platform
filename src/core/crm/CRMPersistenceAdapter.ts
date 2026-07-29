/**
 * Contrato futuro (Tarefa 15) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um backend de persistência real
 * para CustomerStore/InteractionStore/OpportunityStore (hoje
 * exclusivamente em memória).
 */
export interface CRMPersistenceAdapter {
  save(): Promise<void>;
  load(): Promise<void>;
}
