import { describe, expect, it } from 'vitest';
import { DispatcherService } from './DispatcherService';
import { ExecutionContextService } from './ExecutionContextService';
import { ExecutionIsolationBoundaryService } from './ExecutionIsolationBoundaryService';
import { ExecutionLifecycleService } from './ExecutionLifecycleService';
import { RuntimeManager } from './RuntimeManager';
import { RuntimeObservabilityCollectorService } from './RuntimeObservabilityCollectorService';
import { RuntimeRetryCoordinatorService } from './RuntimeRetryCoordinatorService';
import {
  FakeDispatchMetricRepository,
  FakeDispatchResultRepository,
  FakeDispatchRetryAttemptRepository,
  FakeDispatchTargetRepository,
  FakeExecutionContextRepository,
  FakeExecutionIsolationBoundaryRepository,
  FakeExecutionLifecycleStateRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const manager = new RuntimeManager({
    executionContexts: new ExecutionContextService(new FakeExecutionContextRepository()),
    lifecycle: new ExecutionLifecycleService(new FakeExecutionLifecycleStateRepository()),
    dispatcher: new DispatcherService(new FakeDispatchTargetRepository(), new FakeDispatchResultRepository()),
    retryCoordinator: new RuntimeRetryCoordinatorService(new FakeDispatchRetryAttemptRepository()),
    isolation: new ExecutionIsolationBoundaryService(new FakeExecutionIsolationBoundaryRepository()),
    observability: new RuntimeObservabilityCollectorService(new FakeDispatchMetricRepository()),
  });

  return { manager };
}

describe('RuntimeManager — Runtime Core ("como uma solicitação é recebida, contextualizada, encaminhada e observada")', () => {
  it('receive/dispatch/markRunning/completeExecution nunca carregam command nem events — nenhum catálogo aprovado existe para este Hub', async () => {
    const { manager } = buildManager();

    const received = await manager.receive('corr-1', 'tenant-1', 'identity-1');

    expect(received.result.context.tenantId).toBe('tenant-1');
    expect(received.result.isolation.executionContextId).toBe(received.result.context.executionContextId);
    expect('command' in received).toBe(false);
    expect('events' in received).toBe(false);
  });

  it('fluxo completo bem-sucedido: receive → dispatch (sucesso) → markRunning → completeExecution', async () => {
    const { manager } = buildManager();
    const received = await manager.receive('corr-1', 'tenant-1', 'identity-1');
    const executionContextId = received.result.context.executionContextId;
    const target = await manager.registerDispatchTarget('AutomationEngine', 'workflow-engine');

    await manager.dispatch(executionContextId, target.result.dispatchTargetId, true, 12);
    await manager.markRunning(executionContextId);
    const completed = await manager.completeExecution(executionContextId);

    expect(completed.result.stage).toBe('Completed');
  });

  it('dispatch falho registra uma Retry Attempt e mantém o ciclo de vida em "Dispatched" até decisão explícita', async () => {
    const { manager } = buildManager();
    const received = await manager.receive('corr-1', 'tenant-1', 'identity-1');
    const executionContextId = received.result.context.executionContextId;
    const target = await manager.registerDispatchTarget('BusinessHub', 'finance-hub');

    await manager.dispatch(executionContextId, target.result.dispatchTargetId, false, 5);
    const stage = await manager.currentStage(executionContextId);

    expect(stage.result).toBe('Dispatched');
  });

  it('failExecution após retries esgotados registra "Failed" como falha definitiva de Dispatch', async () => {
    const { manager } = buildManager();
    const received = await manager.receive('corr-1', 'tenant-1', 'identity-1');
    const executionContextId = received.result.context.executionContextId;
    const target = await manager.registerDispatchTarget('AIHub', 'ai-hub-contract');

    await manager.dispatch(executionContextId, target.result.dispatchTargetId, false, 5);
    const failed = await manager.failExecution(executionContextId);

    expect(failed.result.stage).toBe('Failed');
  });

  it('nunca permite markRunning antes de um Dispatch — "Context Established" não pode ir direto para "Running"', async () => {
    const { manager } = buildManager();
    const received = await manager.receive('corr-1', 'tenant-1', 'identity-1');

    await expect(manager.markRunning(received.result.context.executionContextId)).rejects.toThrow();
  });
});
