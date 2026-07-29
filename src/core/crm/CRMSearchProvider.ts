import type { Customer } from "./Customer";

/**
 * Contrato futuro (Tarefa 15) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma busca avançada de Customer
 * (hoje `CRM.listCustomers()` retorna sempre a lista completa, sem
 * filtro/texto livre).
 */
export interface CRMSearchProvider {
  search(query: string): Promise<Customer[]>;
}
