/**
 * Contrato futuro (Tarefa 08) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma predição via Machine Learning
 * — fora do escopo desta Sprint (toda detecção aqui é determinística).
 */
export interface MLProvider {
  predict(input: Record<string, unknown>): Promise<unknown>;
}
