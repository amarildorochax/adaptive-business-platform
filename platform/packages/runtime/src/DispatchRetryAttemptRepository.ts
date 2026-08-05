import type { DispatchRetryAttempt } from "./DispatchRetryAttempt.js";

/** Dispatch Retry Attempt Repository — cada tentativa é um fato imutável; nunca `update` nem `remove`. */
export interface DispatchRetryAttemptRepository {
  create(attempt: DispatchRetryAttempt): Promise<DispatchRetryAttempt>;
  listByExecutionContextId(executionContextId: string): Promise<readonly DispatchRetryAttempt[]>;
}
