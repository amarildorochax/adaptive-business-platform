import { describe, expect, it } from 'vitest';
import { AlertRuleService } from './AlertRuleService';
import { AlertService } from './AlertService';
import { HealthCheckService } from './HealthCheckService';
import { IncidentService } from './IncidentService';
import { LogService } from './LogService';
import { MetricService } from './MetricService';
import { PlatformOperationsManager } from './PlatformOperationsManager';
import { ServiceLevelService } from './ServiceLevelService';
import { SpanService } from './SpanService';
import {
  FakeAlertRepository,
  FakeAlertRuleRepository,
  FakeHealthCheckRepository,
  FakeIncidentRepository,
  FakeLogRecordRepository,
  FakeMetricRepository,
  FakeServiceLevelIndicatorRepository,
  FakeServiceLevelObjectiveRepository,
  FakeSpanRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const alertRuleRepository = new FakeAlertRuleRepository();

  const manager = new PlatformOperationsManager({
    metrics: new MetricService(new FakeMetricRepository()),
    spans: new SpanService(new FakeSpanRepository()),
    alertRules: new AlertRuleService(alertRuleRepository),
    alerts: new AlertService(alertRuleRepository, new FakeAlertRepository()),
    serviceLevels: new ServiceLevelService(new FakeServiceLevelIndicatorRepository(), new FakeServiceLevelObjectiveRepository()),
    logs: new LogService(new FakeLogRecordRepository()),
    healthChecks: new HealthCheckService(new FakeHealthCheckRepository()),
    incidents: new IncidentService(new FakeIncidentRepository()),
  });

  return { manager };
}

describe('PlatformOperationsManager — Observability & Platform Operations Core', () => {
  it('recordMetric/recordLog/health/incident nunca carregam command nem events — nenhum catálogo aprovado existe para este Hub', async () => {
    const { manager } = buildManager();

    const operation = await manager.recordMetric('pipeline.latency', 50, 'corr-1');

    expect(operation.result.metric.value).toBe(50);
    expect('command' in operation).toBe(false);
    expect('events' in operation).toBe(false);
  });

  it('recordMetric dispara Alert automaticamente quando uma AlertRule já definida é ultrapassada', async () => {
    const { manager } = buildManager();
    await manager.defineAlertRule('pipeline.latency', 100);

    const operation = await manager.recordMetric('pipeline.latency', 150, 'corr-1');

    expect(operation.result.alerts).toHaveLength(1);
    expect(operation.result.alerts[0]?.observedValue).toBe(150);
  });

  it('startSpan/finishSpan/getTrace compõem o Distributed Trace de um Correlation ID', async () => {
    const { manager } = buildManager();
    const open = manager.startSpan('corr-1', 'finance-hub');
    await manager.finishSpan(open);

    const trace = await manager.getTrace('corr-1');

    expect(trace.result).toHaveLength(1);
    expect(trace.result[0]?.module).toBe('finance-hub');
  });

  it('fluxo completo de Incident: openIncident → classify → mitigate → resolve → review', async () => {
    const { manager } = buildManager();

    const opened = await manager.openIncident('alert:pipeline.latency');
    await manager.classifyIncident(opened.result.incidentId, 'alta');
    await manager.mitigateIncident(opened.result.incidentId);
    await manager.resolveIncident(opened.result.incidentId);
    const reviewed = await manager.reviewIncident(opened.result.incidentId);

    expect(reviewed.result.stage).toBe('Reviewed');
  });

  it('recordHealthCheck/isHealthy refletem a verificação mais recente do componente', async () => {
    const { manager } = buildManager();
    await manager.recordHealthCheck('finance-hub', true);
    await manager.recordHealthCheck('finance-hub', false);

    const healthy = await manager.isHealthy('finance-hub');

    expect(healthy.result).toBe(false);
  });

  it('defineServiceLevelIndicator/defineServiceLevelObjective registram SLI e SLO', async () => {
    const { manager } = buildManager();

    const indicator = await manager.defineServiceLevelIndicator('latencia-p99', 'pipeline.latency');
    const objective = await manager.defineServiceLevelObjective('latencia-p99', 200);

    expect(indicator.result.metricName).toBe('pipeline.latency');
    expect(objective.result.target).toBe(200);
  });
});
