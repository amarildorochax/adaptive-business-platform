/**
 * Contrato futuro (Tarefa 08) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um Insight gerado por IA
 * generativa — fora do escopo desta Sprint (todo texto de Insight/
 * Recommendation aqui é determinístico, montado por interpolação
 * simples de string).
 */
export interface AIInsightProvider {
  generateInsight(context: string): Promise<string>;
}
