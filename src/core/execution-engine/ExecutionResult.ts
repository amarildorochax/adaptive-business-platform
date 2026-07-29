/**
 * Resultado consolidado de um ExecutionRun já concluído (Tarefa 06,
 * refinada pela Tarefa 12) — contagens internas do próprio
 * ExecutionRun, nunca métricas externas de nenhum outro domínio.
 *
 * Nesta Sprint, `success` é sempre `true`, `errors` sempre `[]` e
 * `failures` sempre `0` — nenhuma execução real ocorre, então nenhum
 * caminho de falha genuína existe ainda (reservado a
 * WorkflowExecutorProvider/AgentExecutorProvider/
 * NotificationExecutorProvider, contratos futuros, Tarefa 10).
 */
export interface ExecutionResult {
  id: string;

  runId: string;

  success: boolean;

  duration: number;

  errors: string[];

  metadata: Record<string, unknown>;

  /** Quantidade de etapas executadas (Tarefa 12). */
  stepsExecuted: number;

  /** Quantidade de etapas concluídas (Tarefa 12). */
  stepsCompleted: number;

  /** Quantidade de falhas (Tarefa 12). */
  failures: number;
}
