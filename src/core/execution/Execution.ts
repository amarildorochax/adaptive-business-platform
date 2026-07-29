import type { ExecutionRequest } from "./ExecutionRequest";
import { ExecutionManager } from "./ExecutionManager";
import type { ExecutionMetricsSnapshot } from "./ExecutionMetrics";

/**
 * Fachada pública única do Execution Orchestrator (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * Execution.requestExecution/cancelExecution/getExecution/
 *           listExecutions/getMetrics                    ← única fachada
 *           (+ approveExecution, além do mínimo — ver nota abaixo)
 *    ↓
 * ExecutionManager   ← coordena; emite eventos; registra métricas
 *    ↓
 * ExecutionService     ← registra, valida pré-condições, controla estados
 *    ↓ automation.getRule()
 * ExecutionStore
 *    ↓
 * ExecutionRequest · ExecutionPlan
 * ```
 *
 * Registra solicitações de execução, controla seus estados
 * (`ExecutionStatus`), valida pré-condições (a AutomationRule
 * referenciada precisa existir) e encaminha execuções futuras — nunca
 * executa Workflows, IA, notificações, scheduler ou integrações
 * externas nesta Sprint (ver ExecutionProvider/
 * SchedulerExecutionProvider/WorkflowExecutionProvider, contratos
 * futuros, Tarefa 09).
 *
 * `approveExecution()` foi adicionado além do mínimo pedido pela
 * Tarefa 02 — sem ele, `EXECUTION_APPROVED` (Tarefa 08) e o estado
 * `"approved"` (Tarefa 06) não teriam nenhum caminho de disparo. Mesmo
 * princípio já usado em Sprints anteriores desta série.
 *
 * Nota de nomenclatura: `ExecutionPlan`/`ExecutionStatus`
 * (`@/core/execution`) colidem de nome com `@/core/orchestrator/
 * ExecutionPlan.ts`/`ExecutionStatus.ts` (Sprint Agent Orchestrator,
 * formatos totalmente distintos), e `WorkflowExecutionProvider`
 * (Tarefa 09) colide com `@/core/automations/
 * WorkflowExecutionProvider.ts` (Sprint 14). Resolvido excluindo
 * `./execution` do `export *` de `core/index.ts` — mesmo princípio já
 * usado três vezes nesta série (`WorkflowEngine`, `EmailProvider`/
 * `WhatsAppProvider`, `notifications`). Este módulo, em si, permanece
 * completo e correto; apenas o barrel de topo não o agrega.
 *
 * Este módulo não consome nenhum outro domínio além de
 * `automation.getRule()` — nem `AutomationStore`, nem Business
 * Intelligence, nem nenhum outro.
 *
 * Responsabilidade: nenhum consumidor deve importar ExecutionManager,
 * ExecutionService ou ExecutionStore diretamente — todos usam
 * exclusivamente esta fachada.
 *
 * Dependências: ExecutionManager.
 */
export class Execution {
  private readonly manager = new ExecutionManager();

  /** Registra uma nova solicitação de execução para `ruleId`. Retorna `undefined` se a AutomationRule não existir. */
  requestExecution(ruleId: string, metadata: Record<string, unknown> = {}): ExecutionRequest | undefined {
    return this.manager.requestExecution(ruleId, metadata);
  }

  /** Cancela um ExecutionRequest. */
  cancelExecution(id: string): ExecutionRequest | undefined {
    return this.manager.cancelExecution(id);
  }

  /** Aprova um ExecutionRequest. */
  approveExecution(id: string): ExecutionRequest | undefined {
    return this.manager.approveExecution(id);
  }

  /** Recupera um ExecutionRequest por `id`, ou `undefined` se não existir. */
  getExecution(id: string): ExecutionRequest | undefined {
    return this.manager.getExecution(id);
  }

  /** Retorna todos os ExecutionRequest já registrados. */
  listExecutions(): ExecutionRequest[] {
    return this.manager.listExecutions();
  }

  /** Métricas agregadas de uso do Execution Orchestrator. */
  getMetrics(): ExecutionMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do Execution para toda a plataforma. */
export const execution = new Execution();
