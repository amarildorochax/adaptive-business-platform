import type { Alert } from "./Alert.js";

/** Alert Repository — Alert é sempre um fato imutável (já disparado); nunca `update` nem `remove`. */
export interface AlertRepository {
  create(alert: Alert): Promise<Alert>;
  listByMetricName(metricName: string): Promise<readonly Alert[]>;
}
