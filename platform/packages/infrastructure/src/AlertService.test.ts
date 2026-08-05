import { describe, expect, it } from 'vitest';
import { AlertRuleService } from './AlertRuleService';
import { AlertService } from './AlertService';
import { MetricService } from './MetricService';
import { FakeAlertRepository, FakeAlertRuleRepository, FakeMetricRepository } from './testing/InMemoryFakes';

describe('AlertService — "Alertas são disparados quando uma Metric ultrapassa um limite configurado"', () => {
  it('dispara um Alert quando o valor da Metric ultrapassa o threshold da AlertRule', async () => {
    const ruleRepository = new FakeAlertRuleRepository();
    const alertRepository = new FakeAlertRepository();
    const alertRuleService = new AlertRuleService(ruleRepository);
    const alertService = new AlertService(ruleRepository, alertRepository);
    const metrics = new MetricService(new FakeMetricRepository());

    await alertRuleService.define('pipeline.latency', 100);
    const metric = await metrics.record('pipeline.latency', 150, 'corr-1');

    const fired = await alertService.evaluate(metric);

    expect(fired).toHaveLength(1);
    expect(fired[0]?.observedValue).toBe(150);
    expect(fired[0]?.correlationId).toBe('corr-1');
  });

  it('nunca dispara Alert quando o valor não ultrapassa o threshold (limite igual não é "ultrapassar")', async () => {
    const ruleRepository = new FakeAlertRuleRepository();
    const alertRepository = new FakeAlertRepository();
    const alertRuleService = new AlertRuleService(ruleRepository);
    const alertService = new AlertService(ruleRepository, alertRepository);
    const metrics = new MetricService(new FakeMetricRepository());

    await alertRuleService.define('pipeline.latency', 100);
    const metric = await metrics.record('pipeline.latency', 100, 'corr-1');

    const fired = await alertService.evaluate(metric);

    expect(fired).toHaveLength(0);
  });
});
