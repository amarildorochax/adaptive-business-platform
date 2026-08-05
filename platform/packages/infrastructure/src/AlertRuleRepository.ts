import type { AlertRule } from "./AlertRule.js";

export interface AlertRuleRepository {
  create(rule: AlertRule): Promise<AlertRule>;
  listByMetricName(metricName: string): Promise<readonly AlertRule[]>;
}
