import type { ExecutionIsolationBoundary } from "./ExecutionIsolationBoundary.js";

/**
 * Execution Isolation Boundary Repository — estabelecido uma única vez por Execution Context
 * ("Duas execuções... nunca compartilham Execution Context"); nunca `update` nem `remove`.
 */
export interface ExecutionIsolationBoundaryRepository {
  create(boundary: ExecutionIsolationBoundary): Promise<ExecutionIsolationBoundary>;
  findByExecutionContextId(executionContextId: string): Promise<ExecutionIsolationBoundary | undefined>;
}
