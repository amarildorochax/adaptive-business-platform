import type { DispatchMetric } from "./DispatchMetric.js";

/** Dispatch Metric Repository — cada observação é um fato imutável; nunca `update` nem `remove`. */
export interface DispatchMetricRepository {
  create(metric: DispatchMetric): Promise<DispatchMetric>;
  listByKind(kind: DispatchMetric["kind"]): Promise<readonly DispatchMetric[]>;
}
