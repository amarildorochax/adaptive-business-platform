import type { DispatchResult } from "./DispatchResult.js";
import { DispatcherService } from "./DispatcherService.js";
import type { DispatchTargetKind } from "./DispatchTarget.js";
import type { ExecutionContext } from "./ExecutionContext.js";
import { ExecutionContextService } from "./ExecutionContextService.js";
import type { ExecutionIsolationBoundary } from "./ExecutionIsolationBoundary.js";
import { ExecutionIsolationBoundaryService } from "./ExecutionIsolationBoundaryService.js";
import { ExecutionLifecycleService } from "./ExecutionLifecycleService.js";
import { RuntimeObservabilityCollectorService } from "./RuntimeObservabilityCollectorService.js";
import { RuntimeRetryCoordinatorService } from "./RuntimeRetryCoordinatorService.js";

export interface RuntimeManagerDependencies {
  readonly executionContexts: ExecutionContextService;
  readonly lifecycle: ExecutionLifecycleService;
  readonly dispatcher: DispatcherService;
  readonly retryCoordinator: RuntimeRetryCoordinatorService;
  readonly isolation: ExecutionIsolationBoundaryService;
  readonly observability: RuntimeObservabilityCollectorService;
}

/**
 * Resultado de uma operação de RuntimeManager. **Nunca tem um campo `command` nem um campo
 * `events`** — `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 20 (Conformidade com as Phases 1–6),
 * Phase 1: "Nenhum novo Command, Evento, ou Query definido". Mesma ausência já confirmada para AI
 * Hub (IMP-010), IAM (IMP-011) e Observability (IMP-012).
 */
export interface RuntimeOperationResult<TEntity> {
  readonly result: TEntity;
}

/**
 * RuntimeManager — implementa o "Runtime Manager" (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4):
 * "Ponto de entrada único de toda solicitação de execução... não contém lógica de negócio nem de
 * automação." Aplica literalmente o Ciclo de Vida de Execução da Seção 6: Received →
 * Context Established → Dispatched → Running → Completed | Failed.
 *
 * `dispatch()` pode ser chamado mais de uma vez para o mesmo Execution Context — cada chamada após a
 * primeira é uma nova tentativa de transporte (Seção 13, "Falha de Dispatch"); a transição de estágio
 * `ContextEstablished → Dispatched` ocorre apenas na primeira chamada, nunca reaplicada. Este Manager
 * nunca decide quantas tentativas realizar nem qual estratégia de backoff aplicar — "Nenhuma decisão
 * de tecnologia concreta de hospedagem, de transporte, ou de observabilidade é tomada" pela
 * arquitetura desta Sprint (Seção 16); essa decisão permanece do chamador.
 */
export class RuntimeManager {
  constructor(private readonly deps: RuntimeManagerDependencies) {}

  async receive(correlationId: string, tenantId: string, identityId: string): Promise<RuntimeOperationResult<{ context: ExecutionContext; isolation: ExecutionIsolationBoundary }>> {
    const context = await this.deps.executionContexts.establish(correlationId, tenantId, identityId);
    await this.deps.lifecycle.start(context.executionContextId);
    await this.deps.lifecycle.advance(context.executionContextId, "ContextEstablished");
    const isolation = await this.deps.isolation.establish(context.executionContextId, tenantId);
    await this.deps.observability.record("DispatchVolume", 1);

    return { result: { context, isolation } };
  }

  async registerDispatchTarget(kind: DispatchTargetKind, targetDescription: string) {
    const target = await this.deps.dispatcher.registerTarget(kind, targetDescription);
    return { result: target };
  }

  /** Encaminha (ou reencaminha, em nova tentativa) a solicitação já contextualizada ao seu destino. */
  async dispatch(executionContextId: string, dispatchTargetId: string, succeeded: boolean, latencyMs: number): Promise<RuntimeOperationResult<DispatchResult>> {
    const stage = await this.deps.lifecycle.currentStage(executionContextId);
    if (stage === "ContextEstablished") {
      await this.deps.lifecycle.advance(executionContextId, "Dispatched");
    }

    const result = await this.deps.dispatcher.dispatch(executionContextId, dispatchTargetId, succeeded);

    await this.deps.observability.record("DispatchLatency", latencyMs);
    await this.deps.observability.record("DispatchSuccessRate", succeeded ? 1 : 0);

    if (!succeeded) {
      await this.deps.retryCoordinator.recordAttempt(executionContextId, dispatchTargetId);
    }

    return { result };
  }

  /** Marca o início do processamento de domínio, após um Dispatch bem-sucedido. */
  async markRunning(executionContextId: string) {
    const state = await this.deps.lifecycle.advance(executionContextId, "Running");
    return { result: state };
  }

  /** Falha definitiva — de Dispatch (retries esgotados) ou de domínio (processamento já em Running). */
  async failExecution(executionContextId: string) {
    const state = await this.deps.lifecycle.advance(executionContextId, "Failed");
    return { result: state };
  }

  async completeExecution(executionContextId: string) {
    const state = await this.deps.lifecycle.advance(executionContextId, "Completed");
    return { result: state };
  }

  async currentStage(executionContextId: string) {
    const stage = await this.deps.lifecycle.currentStage(executionContextId);
    return { result: stage };
  }
}
