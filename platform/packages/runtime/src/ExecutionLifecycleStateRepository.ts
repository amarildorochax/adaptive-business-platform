import type { ExecutionLifecycleState } from "./ExecutionLifecycleState.js";

/**
 * Execution Lifecycle State Repository — cada transição de estágio é um fato imutável, um novo
 * registro (`ExecutionLifecycleState` não tem identificador próprio — apenas `executionContextId` +
 * `stage` + `enteredAt`); nunca `update` nem `remove`. O estágio atual é sempre o último em ordem de
 * inserção (ver `ExecutionLifecycleService.currentStage`).
 */
export interface ExecutionLifecycleStateRepository {
  create(state: ExecutionLifecycleState): Promise<ExecutionLifecycleState>;
  listByExecutionContextId(executionContextId: string): Promise<readonly ExecutionLifecycleState[]>;
}
