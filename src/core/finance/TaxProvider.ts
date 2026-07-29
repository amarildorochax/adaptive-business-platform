/**
 * Contrato futuro (Tarefa 12) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um cálculo de impostos sobre um
 * valor — nenhum cálculo tributário é feito nesta Sprint.
 */
export interface TaxProvider {
  calculate(amount: number): Promise<number>;
}
