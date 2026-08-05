import type { ServiceLevelIndicator, ServiceLevelObjective } from "./ServiceLevel.js";

export interface ServiceLevelIndicatorRepository {
  create(indicator: ServiceLevelIndicator): Promise<ServiceLevelIndicator>;
  list(): Promise<readonly ServiceLevelIndicator[]>;
}

export interface ServiceLevelObjectiveRepository {
  create(objective: ServiceLevelObjective): Promise<ServiceLevelObjective>;
  listByIndicator(indicatorName: string): Promise<readonly ServiceLevelObjective[]>;
}
