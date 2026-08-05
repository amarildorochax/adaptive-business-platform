import type { OversightCheckpoint } from "./OversightCheckpoint.js";

/**
 * Oversight Checkpoint Repository — tem `update`: um checkpoint evolui de `"Pending"` para
 * `"Approved"` ou `"Denied"` mediante confirmação humana explícita; nunca `remove`.
 */
export interface OversightCheckpointRepository {
  create(checkpoint: OversightCheckpoint): Promise<OversightCheckpoint>;
  update(checkpoint: OversightCheckpoint): Promise<OversightCheckpoint>;
  find(oversightCheckpointId: string): Promise<OversightCheckpoint | undefined>;
  findByTaskResultId(agentTaskResultId: string): Promise<OversightCheckpoint | undefined>;
}
