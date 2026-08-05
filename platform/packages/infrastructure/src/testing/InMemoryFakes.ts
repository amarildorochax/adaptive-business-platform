import type { Alert } from '../Alert';
import type { AlertRepository } from '../AlertRepository';
import type { AlertRule } from '../AlertRule';
import type { AlertRuleRepository } from '../AlertRuleRepository';
import type { CorrelationId } from '../CorrelationId';
import type { HealthCheck } from '../HealthCheck';
import type { HealthCheckRepository } from '../HealthCheckRepository';
import type { Incident } from '../Incident';
import type { IncidentRepository } from '../IncidentRepository';
import type { LogRecord } from '../LogRecord';
import type { LogRecordRepository } from '../LogRecordRepository';
import type { Metric } from '../Metric';
import type { MetricRepository } from '../MetricRepository';
import type { ServiceLevelIndicator, ServiceLevelObjective } from '../ServiceLevel';
import type { ServiceLevelIndicatorRepository, ServiceLevelObjectiveRepository } from '../ServiceLevelRepository';
import type { Span } from '../Span';
import type { SpanRepository } from '../SpanRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-012, Etapa de Testes). Mesmo padrão já usado
 * pelos onze domínios anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakeMetricRepository implements MetricRepository {
  private readonly rows: Metric[] = [];
  async create(metric: Metric) {
    this.rows.push(metric);
    return metric;
  }
  async listByName(name: string) {
    return this.rows.filter((m) => m.name === name);
  }
}

export class FakeSpanRepository implements SpanRepository {
  private readonly rows: Span[] = [];
  async create(span: Span) {
    this.rows.push(span);
    return span;
  }
  async listByCorrelationId(correlationId: CorrelationId) {
    return this.rows.filter((s) => s.correlationId === correlationId);
  }
}

export class FakeAlertRuleRepository implements AlertRuleRepository {
  private readonly rows: AlertRule[] = [];
  async create(rule: AlertRule) {
    this.rows.push(rule);
    return rule;
  }
  async listByMetricName(metricName: string) {
    return this.rows.filter((r) => r.metricName === metricName);
  }
}

export class FakeAlertRepository implements AlertRepository {
  private readonly rows: Alert[] = [];
  async create(alert: Alert) {
    this.rows.push(alert);
    return alert;
  }
  async listByMetricName(metricName: string) {
    return this.rows.filter((a) => a.metricName === metricName);
  }
}

export class FakeServiceLevelIndicatorRepository implements ServiceLevelIndicatorRepository {
  private readonly rows: ServiceLevelIndicator[] = [];
  async create(indicator: ServiceLevelIndicator) {
    this.rows.push(indicator);
    return indicator;
  }
  async list() {
    return this.rows;
  }
}

export class FakeServiceLevelObjectiveRepository implements ServiceLevelObjectiveRepository {
  private readonly rows: ServiceLevelObjective[] = [];
  async create(objective: ServiceLevelObjective) {
    this.rows.push(objective);
    return objective;
  }
  async listByIndicator(indicatorName: string) {
    return this.rows.filter((o) => o.indicator === indicatorName);
  }
}

export class FakeLogRecordRepository implements LogRecordRepository {
  private readonly rows: LogRecord[] = [];
  async create(record: LogRecord) {
    this.rows.push(record);
    return record;
  }
  async listByCorrelationId(correlationId: CorrelationId) {
    return this.rows.filter((r) => r.correlationId === correlationId);
  }
}

export class FakeHealthCheckRepository implements HealthCheckRepository {
  private readonly rows: HealthCheck[] = [];
  async create(check: HealthCheck) {
    this.rows.push(check);
    return check;
  }
  async listByComponent(component: string) {
    return this.rows.filter((c) => c.component === component);
  }
}

export class FakeIncidentRepository implements IncidentRepository {
  private readonly rows = new Map<string, Incident>();
  async create(incident: Incident) {
    this.rows.set(incident.incidentId, incident);
    return incident;
  }
  async update(incident: Incident) {
    this.rows.set(incident.incidentId, incident);
    return incident;
  }
  async find(incidentId: string) {
    return this.rows.get(incidentId);
  }
  async list() {
    return [...this.rows.values()];
  }
}
