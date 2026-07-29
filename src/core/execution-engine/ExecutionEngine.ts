import type { ExecutionRun } from "./ExecutionRun";
import { ExecutionEngineManager } from "./ExecutionEngineManager";
import type { ExecutionEngineMetricsSnapshot } from "./ExecutionEngineMetrics";

/**
 * Fachada pública única do Execution Engine (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * ExecutionEngine.startExecution/cancelExecution/getExecutionRun/
 *                 listExecutionRuns/getMetrics          ← única fachada
 *    ↓
 * ExecutionEngineManager   ← coordena; emite eventos; registra métricas
 *    ↓
 * ExecutionEngineService     ← inicia, registra, acompanha, finaliza, produz resultado
 *    ↓ executionScheduling.getSchedule()
 * ExecutionEngineStore
 *    ↓
 * ExecutionRun · ExecutionStep · ExecutionResult
 * ```
 *
 * O motor interno de execução — inicia, registra, acompanha e finaliza
 * ExecutionRun, produzindo um ExecutionResult ao final. Nunca executa
 * Workflow, IA, Provider, notificação, API, webhook ou Automation
 * Action de verdade (ver WorkflowExecutorProvider/AgentExecutorProvider/
 * NotificationExecutorProvider, contratos futuros, Tarefa 10).
 *
 * `startExecution()` valida `executionScheduling.getSchedule(scheduleId)`
 * (precisa existir e estar `"approved"`), cria o ExecutionRun, cria um
 * ExecutionStep (sempre um único step sintético nesta Sprint — nenhuma
 * API alcançável expõe os passos reais de um plano; ver nota em
 * ExecutionStep.ts), marca tudo `"completed"`, e produz o
 * ExecutionResult — tudo em uma única chamada síncrona.
 *
 * Nota de nomenclatura: `ExecutionStep` colide de nome com
 * `@/core/orchestrator/ExecutionStep.ts` (Sprint Agent Orchestrator,
 * formato totalmente distinto). Resolvido excluindo
 * `./execution-engine` do `export *` de `core/index.ts` — mesmo
 * princípio já usado cinco vezes nesta série (`WorkflowEngine`,
 * `EmailProvider`/`WhatsAppProvider`, `notifications`, `execution`,
 * `execution-scheduling`). Este módulo, em si, permanece completo e
 * correto; apenas o barrel de topo não o agrega.
 *
 * Este módulo não consome nenhum outro domínio além de
 * `executionScheduling.getSchedule()` — nem `ExecutionSchedulingStore`,
 * nem Automation Center, nem Business Intelligence, nem Analytics, nem
 * Dashboard.
 *
 * Responsabilidade: nenhum consumidor deve importar
 * ExecutionEngineManager, ExecutionEngineService ou ExecutionEngineStore
 * diretamente — todos usam exclusivamente esta fachada.
 *
 * Dependências: ExecutionEngineManager.
 */
export class ExecutionEngine {
  private readonly manager = new ExecutionEngineManager();

  /** Inicia e conclui uma execução para `scheduleId`. Retorna `undefined` se o agendamento não existir ou não estiver aprovado. */
  startExecution(scheduleId: string): ExecutionRun | undefined {
    return this.manager.startExecution(scheduleId);
  }

  /** Cancela um ExecutionRun. */
  cancelExecution(id: string): ExecutionRun | undefined {
    return this.manager.cancelExecution(id);
  }

  /** Recupera um ExecutionRun por `id`, ou `undefined` se não existir. */
  getExecutionRun(id: string): ExecutionRun | undefined {
    return this.manager.getExecutionRun(id);
  }

  /** Retorna todos os ExecutionRun já registrados. */
  listExecutionRuns(): ExecutionRun[] {
    return this.manager.listExecutionRuns();
  }

  /** Métricas agregadas de uso do Execution Engine. */
  getMetrics(): ExecutionEngineMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do ExecutionEngine para toda a plataforma. */
export const executionEngine = new ExecutionEngine();
