import type { ExecutionContext } from "./ExecutionContext.js";

/** Execution Context Repository — o contexto é estabelecido uma única vez; nunca `update` nem `remove`. */
export interface ExecutionContextRepository {
  create(context: ExecutionContext): Promise<ExecutionContext>;
  find(executionContextId: string): Promise<ExecutionContext | undefined>;
}
