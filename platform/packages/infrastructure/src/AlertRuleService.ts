import type { AlertRule } from "./AlertRule.js";
import type { AlertRuleRepository } from "./AlertRuleRepository.js";

/** Alert Rule Service — administra o substrato declarativo de quando uma Metric deve gerar Alert. */
export class AlertRuleService {
  constructor(private readonly repository: AlertRuleRepository) {}

  async define(metricName: string, threshold: number): Promise<AlertRule> {
    const rule: AlertRule = { metricName, threshold };
    return this.repository.create(rule);
  }

  async listByMetricName(metricName: string): Promise<readonly AlertRule[]> {
    return this.repository.listByMetricName(metricName);
  }
}
