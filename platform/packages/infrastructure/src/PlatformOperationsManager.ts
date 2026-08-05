import type { Alert } from "./Alert.js";
import { AlertRuleService } from "./AlertRuleService.js";
import { AlertService } from "./AlertService.js";
import type { AlertRule } from "./AlertRule.js";
import type { CorrelationId } from "./CorrelationId.js";
import type { HealthCheck } from "./HealthCheck.js";
import { HealthCheckService } from "./HealthCheckService.js";
import type { Incident } from "./Incident.js";
import { IncidentService } from "./IncidentService.js";
import type { LogLevel, LogRecord } from "./LogRecord.js";
import { LogService } from "./LogService.js";
import type { Metric } from "./Metric.js";
import { MetricService } from "./MetricService.js";
import type { ServiceLevelIndicator, ServiceLevelObjective } from "./ServiceLevel.js";
import { ServiceLevelService } from "./ServiceLevelService.js";
import type { Span } from "./Span.js";
import { SpanService, type OpenSpan } from "./SpanService.js";

export interface PlatformOperationsManagerDependencies {
  readonly metrics: MetricService;
  readonly spans: SpanService;
  readonly alertRules: AlertRuleService;
  readonly alerts: AlertService;
  readonly serviceLevels: ServiceLevelService;
  readonly logs: LogService;
  readonly healthChecks: HealthCheckService;
  readonly incidents: IncidentService;
}

/**
 * Resultado de uma operação de PlatformOperationsManager. **Nunca tem um campo `command` nem um
 * campo `events`** — `SYSTEM_BLUEPRINT.md` (Capítulo 7, Event Map) cataloga catorze Eventos, todos de
 * propriedade de um Business Hub específico; nenhum é de propriedade da Observability, que é camada de
 * infraestrutura transversal (Capítulo 3: "INFRASTRUCTURE LAYER: Event Bus · Queues · Cache · Workers
 * · Observability"), nunca um Hub com Event Map próprio. `DOMAIN_OWNERSHIP_MATRIX.md` confirma:
 * nenhuma linha da Ownership Matrix atribui um conceito a "Observability" ou "Platform Operations".
 * Mesma ausência já confirmada para o AI Hub (IMP-010) e para o IAM (IMP-011).
 */
export interface PlatformOperationsResult<TEntity> {
  readonly result: TEntity;
}

/**
 * PlatformOperationsManager — orquestrador único da Observability & Platform Operations Core
 * (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulos 5, 9 e 13). Nunca contém, ele mesmo, regra de negócio
 * de nenhum componente individual — apenas coordena os Services.
 *
 * `recordMetric` é a única orquestração de múltiplos Services deste Manager: toda Metric registrada é
 * imediatamente avaliada contra as AlertRule já definidas para seu nome, dando efeito real a "Alertas
 * são disparados quando uma Metric ultrapassa um limite configurado" (Capítulo 9) — sem essa
 * orquestração, AlertRule e Alert permaneceriam desconectados de qualquer Metric real.
 */
export class PlatformOperationsManager {
  constructor(private readonly deps: PlatformOperationsManagerDependencies) {}

  async recordMetric(name: string, value: number, correlationId: CorrelationId): Promise<PlatformOperationsResult<{ metric: Metric; alerts: readonly Alert[] }>> {
    const metric = await this.deps.metrics.record(name, value, correlationId);
    const alerts = await this.deps.alerts.evaluate(metric);

    return { result: { metric, alerts } };
  }

  async recordLog(module: string, level: LogLevel, message: string, correlationId: CorrelationId): Promise<PlatformOperationsResult<LogRecord>> {
    const record = await this.deps.logs.record(module, level, message, correlationId);
    return { result: record };
  }

  startSpan(correlationId: CorrelationId, module: string): OpenSpan {
    return this.deps.spans.start(correlationId, module);
  }

  async finishSpan(open: OpenSpan): Promise<PlatformOperationsResult<Span>> {
    const span = await this.deps.spans.finish(open);
    return { result: span };
  }

  async getTrace(correlationId: CorrelationId): Promise<PlatformOperationsResult<readonly Span[]>> {
    const spans = await this.deps.spans.getTrace(correlationId);
    return { result: spans };
  }

  async defineAlertRule(metricName: string, threshold: number): Promise<PlatformOperationsResult<AlertRule>> {
    const rule = await this.deps.alertRules.define(metricName, threshold);
    return { result: rule };
  }

  async defineServiceLevelIndicator(name: string, metricName: string): Promise<PlatformOperationsResult<ServiceLevelIndicator>> {
    const indicator = await this.deps.serviceLevels.defineIndicator(name, metricName);
    return { result: indicator };
  }

  async defineServiceLevelObjective(indicatorName: string, target: number): Promise<PlatformOperationsResult<ServiceLevelObjective>> {
    const objective = await this.deps.serviceLevels.defineObjective(indicatorName, target);
    return { result: objective };
  }

  async recordHealthCheck(component: string, healthy: boolean): Promise<PlatformOperationsResult<HealthCheck>> {
    const check = await this.deps.healthChecks.record(component, healthy);
    return { result: check };
  }

  async isHealthy(component: string): Promise<PlatformOperationsResult<boolean | undefined>> {
    const healthy = await this.deps.healthChecks.isHealthy(component);
    return { result: healthy };
  }

  async openIncident(triggeredBy: string): Promise<PlatformOperationsResult<Incident>> {
    const incident = await this.deps.incidents.open(triggeredBy);
    return { result: incident };
  }

  async classifyIncident(incidentId: string, severity: string): Promise<PlatformOperationsResult<Incident>> {
    const incident = await this.deps.incidents.classify(incidentId, severity);
    return { result: incident };
  }

  async mitigateIncident(incidentId: string): Promise<PlatformOperationsResult<Incident>> {
    const incident = await this.deps.incidents.mitigate(incidentId);
    return { result: incident };
  }

  async resolveIncident(incidentId: string): Promise<PlatformOperationsResult<Incident>> {
    const incident = await this.deps.incidents.resolve(incidentId);
    return { result: incident };
  }

  async reviewIncident(incidentId: string): Promise<PlatformOperationsResult<Incident>> {
    const incident = await this.deps.incidents.review(incidentId);
    return { result: incident };
  }
}
