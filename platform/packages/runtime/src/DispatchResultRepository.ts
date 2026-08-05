import type { DispatchResult } from "./DispatchResult.js";

/** Dispatch Result Repository — cada encaminhamento é um fato imutável; nunca `update` nem `remove`. */
export interface DispatchResultRepository {
  create(result: DispatchResult): Promise<DispatchResult>;
  listByExecutionContextId(executionContextId: string): Promise<readonly DispatchResult[]>;
}
