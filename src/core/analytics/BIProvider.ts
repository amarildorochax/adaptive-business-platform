/**
 * Contrato futuro (Tarefa 11) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de uma consulta livre a uma
 * ferramenta de Business Intelligence externa — nenhuma integração
 * externa é feita nesta Sprint.
 */
export interface BIProvider {
  query(expression: string): Promise<unknown>;
}
