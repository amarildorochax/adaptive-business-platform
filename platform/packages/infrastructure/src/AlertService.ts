import type { Alert } from "./Alert.js";
import type { AlertRepository } from "./AlertRepository.js";
import type { AlertRuleRepository } from "./AlertRuleRepository.js";
import type { Metric } from "./Metric.js";

/**
 * Alert Service — "Alertas são disparados quando uma Metric ultrapassa um limite configurado"
 * (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9; NFR-036). `evaluate` é a única regra de negócio
 * deste arquivo: dispara um Alert para cada AlertRule cujo limite a Metric já ultrapassou (`>`,
 * nunca `>=` — o texto usa "ultrapassa", nunca "atinge").
 */
export class AlertService {
  constructor(
    private readonly rules: AlertRuleRepository,
    private readonly repository: AlertRepository,
  ) {}

  async evaluate(metric: Metric): Promise<readonly Alert[]> {
    const applicableRules = await this.rules.listByMetricName(metric.name);
    const breached = applicableRules.filter((rule) => metric.value > rule.threshold);

    const fired: Alert[] = [];
    for (const rule of breached) {
      const alert: Alert = {
        metricName: rule.metricName,
        observedValue: metric.value,
        correlationId: metric.correlationId,
        triggeredAt: new Date(),
      };
      fired.push(await this.repository.create(alert));
    }

    return fired;
  }

  async listByMetricName(metricName: string): Promise<readonly Alert[]> {
    return this.repository.listByMetricName(metricName);
  }
}
