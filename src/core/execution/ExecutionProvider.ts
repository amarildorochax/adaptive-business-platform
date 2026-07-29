/**
 * Contrato futuro (Tarefa 09) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um executor real de
 * ExecutionRequest — esta Sprint nunca executa nada de fato.
 */
export interface ExecutionProvider {
  execute(requestId: string): Promise<void>;
}
