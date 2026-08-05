import type { HealthCheck } from "./HealthCheck.js";

/** Health Check Repository — cada verificação é um fato imutável; nunca `update` nem `remove`. */
export interface HealthCheckRepository {
  create(check: HealthCheck): Promise<HealthCheck>;
  listByComponent(component: string): Promise<readonly HealthCheck[]>;
}
