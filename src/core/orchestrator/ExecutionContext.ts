/**
 * Contêiner de dados compartilhado entre as etapas de uma mesma
 * ExecutionPlan (Tarefa 04).
 *
 * Responsabilidade: ser o único lugar onde dados produzidos por uma
 * etapa ficam disponíveis para etapas seguintes — nenhum Agent
 * compartilha estado diretamente com outro; toda troca passa por aqui,
 * escrita exclusivamente por AgentOrchestrator após cada
 * ExecutionStep concluir.
 *
 * Um ExecutionContext novo é criado por AgentOrchestrator a cada
 * `execute()` — nunca reutilizado entre execuções distintas.
 *
 * Mesmo princípio de desacoplamento já aplicado a PipelineContext
 * (src/core/pipeline/PipelineContext.ts) para o boot da plataforma —
 * aqui aplicado ao nível de orquestração de Agentes.
 */
export class ExecutionContext {
  private readonly data = new Map<string, unknown>();

  constructor(
    readonly executionPlanId: string,
    readonly correlationId: string
  ) {}

  /** Registra um valor sob `key`, disponível para qualquer etapa seguinte. */
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

  /** Retorna uma cópia de todos os dados já compartilhados nesta execução. */
  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.data);
  }
}
