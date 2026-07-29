/**
 * Contrato de repetição de etapa (loop) futuro (Tarefa 11 — não
 * implementado nesta Sprint). `WorkflowExecutor` hoje executa cada
 * etapa no máximo uma vez.
 *
 * Responsabilidade reservada: repetir uma etapa até uma condição ser
 * satisfeita, ou por um número máximo de iterações. Nenhum componente
 * desta Sprint cria, lê, ou aplica um WorkflowLoop.
 */
export interface WorkflowLoop {
  stepOrder: number;
  maxIterations: number;
  untilContextKey?: string;
}
