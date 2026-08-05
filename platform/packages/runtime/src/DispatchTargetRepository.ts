import type { DispatchTarget } from "./DispatchTarget.js";

export interface DispatchTargetRepository {
  create(target: DispatchTarget): Promise<DispatchTarget>;
  find(dispatchTargetId: string): Promise<DispatchTarget | undefined>;
}
