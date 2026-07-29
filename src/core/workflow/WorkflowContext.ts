/**
 * Contêiner de dados compartilhado entre as etapas de um mesmo
 * WorkflowPlan (Tarefa 07).
 *
 * Responsabilidade: ser o único lugar onde a saída de uma WorkflowStep
 * fica disponível para as etapas seguintes do mesmo workflow.
 *
 * Integração com ExecutionContext, sem duplicar responsabilidades
 * (Tarefa 07): `ExecutionContext` (`@/core/orchestrator`, inalterado) é
 * criado e vive inteiramente **dentro** de uma única chamada a
 * `AgentOrchestrator.execute()` — nunca é exposto ao chamador, e cada
 * WorkflowStep desta Sprint dispara sua **própria** chamada
 * independente a `agentOrchestrator.execute()` (ver WorkflowExecutor.ts).
 * `WorkflowContext` opera um nível acima: agrega a **saída já
 * finalizada** de cada uma dessas chamadas independentes, para que a
 * etapa seguinte do workflow possa referenciá-la — nunca acessa nem
 * reimplementa o `ExecutionContext` interno de nenhuma delas. Mesmo
 * formato de API (`set`/`get`/`has`/`getAll`) por familiaridade, nunca
 * por herança ou composição direta.
 *
 * Um WorkflowContext novo é criado por WorkflowExecutor a cada
 * `execute()` — nunca reutilizado entre execuções distintas.
 */
export class WorkflowContext {
  private readonly data = new Map<string, unknown>();

  constructor(
    readonly workflowPlanId: string,
    readonly correlationId: string
  ) {}

  /** Registra um valor sob `key`, disponível para qualquer etapa seguinte do mesmo workflow. */
  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  /** Recupera o valor registrado sob `key`, ou `undefined` se nunca foi definido. */
  get<T = unknown>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  /** `true` se algum valor já foi registrado sob `key`. */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /** Retorna uma cópia de todos os dados já compartilhados neste workflow. */
  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.data);
  }
}
