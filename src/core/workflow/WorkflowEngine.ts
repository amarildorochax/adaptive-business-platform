import type { WorkflowDefinition } from "./WorkflowDefinition";
import type { WorkflowPlan } from "./WorkflowPlan";
import { WorkflowStatus } from "./WorkflowStatus";
import { WorkflowRegistry, type WorkflowDefinitionInput } from "./WorkflowRegistry";
import { WorkflowPlanner } from "./WorkflowPlanner";
import { WorkflowExecutor } from "./WorkflowExecutor";
import { WorkflowMetrics, type WorkflowMetricsSnapshot } from "./WorkflowMetrics";

/**
 * Fachada pública única do Workflow Engine (Tarefa 01).
 *
 * ```
 * Application
 *    ↓
 * WorkflowEngine.start(workflowId)   ← único ponto de entrada
 *    ↓
 * WorkflowRegistry.get(workflowId)   ← carrega a WorkflowDefinition
 *    ↓
 * WorkflowPlanner.plan(definition)   ← clona em um WorkflowPlan executável
 *    ↓
 * WorkflowExecutor.execute(plan)     ← percorre as etapas, uma por vez
 *    ↓ (por etapa)
 * AgentOrchestrator.execute(...)     ← já existente, inalterado
 *    ↓
 * ExecutionPlanner → PromptManager → ContextBuilder → BusinessMemory → AIGateway
 * ```
 *
 * Responsabilidade: nenhum módulo deve implementar seu próprio fluxo —
 * toda execução de múltiplas etapas/Agentes passa exclusivamente por
 * aqui. Reutiliza `AgentOrchestrator` já existente (inalterado) através
 * de `WorkflowExecutor` — o Workflow Engine nunca acessa
 * `AgentDispatcher`/`ExecutionPlanner`/`AgentSelector` diretamente.
 *
 * Runtime, BootPipeline, AI Gateway, Business Memory, Prompt Manager,
 * Agent Orchestrator, e Modules permanecem inteiramente inalterados —
 * consumidos apenas transitivamente, através de `agentOrchestrator`.
 *
 * Dependências: WorkflowRegistry, WorkflowPlanner, WorkflowExecutor,
 * WorkflowMetrics.
 *
 * Exemplo de uso:
 * ```ts
 * const plan = await workflowEngine.start("workflow-article-production");
 * console.log(plan.status, plan.steps.map((s) => s.output));
 * ```
 */
export class WorkflowEngine {
  private readonly registry = new WorkflowRegistry();

  private readonly planner = new WorkflowPlanner();

  private readonly executor = new WorkflowExecutor();

  private readonly metrics = new WorkflowMetrics();

  private readonly executions = new Map<string, WorkflowPlan>();

  /**
   * Carrega a WorkflowDefinition de `workflowId`, monta um WorkflowPlan,
   * e o executa do início ao fim (ou até a primeira falha).
   * @throws {Error} se `workflowId` não estiver registrado em WorkflowRegistry.
   */
  async start(workflowId: string): Promise<WorkflowPlan> {
    const definition = this.registry.get(workflowId);

    if (!definition) {
      throw new Error(`WorkflowEngine: workflow "${workflowId}" não está registrado.`);
    }

    const plan = this.planner.plan(definition);

    this.executions.set(plan.id, plan);

    const startedAt = Date.now();

    const result = await this.executor.execute(plan);

    this.metrics.recordExecution({
      workflowId: definition.id,
      durationMs: Date.now() - startedAt,
      stepCount: result.steps.length,
      failed: result.status === WorkflowStatus.FAILED,
    });

    return result;
  }

  /** Registra uma nova WorkflowDefinition — ver WorkflowRegistry.register(). */
  registerWorkflow(input: WorkflowDefinitionInput): WorkflowDefinition {
    return this.registry.register(input);
  }

  /** Remove uma WorkflowDefinition. */
  unregisterWorkflow(id: string): boolean {
    return this.registry.unregister(id);
  }

  /** Localiza uma WorkflowDefinition por `id`. */
  getWorkflow(id: string): WorkflowDefinition | undefined {
    return this.registry.get(id);
  }

  /** Lista todas as WorkflowDefinition já registradas. */
  listWorkflows(): WorkflowDefinition[] {
    return this.registry.list();
  }

  /** Atualiza uma WorkflowDefinition já registrada (parcial). */
  updateWorkflow(id: string, input: Partial<WorkflowDefinitionInput>): WorkflowDefinition | undefined {
    return this.registry.update(id, input);
  }

  /** Localiza uma execução (WorkflowPlan) já registrada por `id`. */
  getExecution(id: string): WorkflowPlan | undefined {
    return this.executions.get(id);
  }

  /** Lista todas as execuções já registradas. */
  listExecutions(): WorkflowPlan[] {
    return Array.from(this.executions.values());
  }

  /** Métricas agregadas de uso do Workflow Engine (Tarefa 09). */
  getMetrics(): WorkflowMetricsSnapshot {
    return this.metrics.snapshot();
  }
}

/** Instância única e compartilhada do WorkflowEngine para toda a plataforma. */
export const workflowEngine = new WorkflowEngine();
