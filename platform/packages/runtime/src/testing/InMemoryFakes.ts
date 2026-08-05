import type { DispatchMetric } from '../DispatchMetric';
import type { DispatchMetricRepository } from '../DispatchMetricRepository';
import type { DispatchResult } from '../DispatchResult';
import type { DispatchResultRepository } from '../DispatchResultRepository';
import type { DispatchRetryAttempt } from '../DispatchRetryAttempt';
import type { DispatchRetryAttemptRepository } from '../DispatchRetryAttemptRepository';
import type { DispatchTarget } from '../DispatchTarget';
import type { DispatchTargetRepository } from '../DispatchTargetRepository';
import type { ExecutionContext } from '../ExecutionContext';
import type { ExecutionContextRepository } from '../ExecutionContextRepository';
import type { ExecutionIsolationBoundary } from '../ExecutionIsolationBoundary';
import type { ExecutionIsolationBoundaryRepository } from '../ExecutionIsolationBoundaryRepository';
import type { ExecutionLifecycleState } from '../ExecutionLifecycleState';
import type { ExecutionLifecycleStateRepository } from '../ExecutionLifecycleStateRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-013, Etapa de Testes). Mesmo padrão já usado
 * pelos doze domínios anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakeExecutionContextRepository implements ExecutionContextRepository {
  private readonly rows = new Map<string, ExecutionContext>();
  async create(context: ExecutionContext) {
    this.rows.set(context.executionContextId, context);
    return context;
  }
  async find(executionContextId: string) {
    return this.rows.get(executionContextId);
  }
}

export class FakeExecutionLifecycleStateRepository implements ExecutionLifecycleStateRepository {
  private readonly rows: ExecutionLifecycleState[] = [];
  async create(state: ExecutionLifecycleState) {
    this.rows.push(state);
    return state;
  }
  async listByExecutionContextId(executionContextId: string) {
    return this.rows.filter((s) => s.executionContextId === executionContextId);
  }
}

export class FakeDispatchTargetRepository implements DispatchTargetRepository {
  private readonly rows = new Map<string, DispatchTarget>();
  async create(target: DispatchTarget) {
    this.rows.set(target.dispatchTargetId, target);
    return target;
  }
  async find(dispatchTargetId: string) {
    return this.rows.get(dispatchTargetId);
  }
}

export class FakeDispatchResultRepository implements DispatchResultRepository {
  private readonly rows: DispatchResult[] = [];
  async create(result: DispatchResult) {
    this.rows.push(result);
    return result;
  }
  async listByExecutionContextId(executionContextId: string) {
    return this.rows.filter((r) => r.executionContextId === executionContextId);
  }
}

export class FakeDispatchRetryAttemptRepository implements DispatchRetryAttemptRepository {
  private readonly rows: DispatchRetryAttempt[] = [];
  async create(attempt: DispatchRetryAttempt) {
    this.rows.push(attempt);
    return attempt;
  }
  async listByExecutionContextId(executionContextId: string) {
    return this.rows.filter((a) => a.executionContextId === executionContextId);
  }
}

export class FakeExecutionIsolationBoundaryRepository implements ExecutionIsolationBoundaryRepository {
  private readonly rows = new Map<string, ExecutionIsolationBoundary>();
  async create(boundary: ExecutionIsolationBoundary) {
    this.rows.set(boundary.executionContextId, boundary);
    return boundary;
  }
  async findByExecutionContextId(executionContextId: string) {
    return this.rows.get(executionContextId);
  }
}

export class FakeDispatchMetricRepository implements DispatchMetricRepository {
  private readonly rows: DispatchMetric[] = [];
  async create(metric: DispatchMetric) {
    this.rows.push(metric);
    return metric;
  }
  async listByKind(kind: DispatchMetric['kind']) {
    return this.rows.filter((m) => m.kind === kind);
  }
}
