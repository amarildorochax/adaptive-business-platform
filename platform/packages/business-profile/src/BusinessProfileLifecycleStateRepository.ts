import type { BusinessProfileLifecycleState } from "./BusinessProfileLifecycleState.js";

/**
 * Business Profile Lifecycle State Repository — cada transição de estágio é um fato imutável, um novo
 * registro; nunca `update` nem `remove`. O estágio atual é sempre o último em ordem de inserção (ver
 * `BusinessProfileLifecycleService.currentStage`).
 */
export interface BusinessProfileLifecycleStateRepository {
  create(state: BusinessProfileLifecycleState): Promise<BusinessProfileLifecycleState>;
  listByProfileId(profileId: string): Promise<readonly BusinessProfileLifecycleState[]>;
}
