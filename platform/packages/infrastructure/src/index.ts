/**
 * Barrel export do pacote @abp/infrastructure.
 * Gerado como infraestrutura de fundação (IMP-001) — reexporta cada
 * contrato já existente neste pacote, sem alterar nenhum tipo.
 * Estendido pela IMP-012 (Observability & Platform Operations Core) com Repository, Service e
 * Manager para os contratos de Observability já existentes (AlertRule, CorrelationId, Metric,
 * ServiceLevel, Span) e com os quatro Entities novos que preenchem lacunas do Blueprint (Alert,
 * HealthCheck, Incident, LogRecord). Backup/ConnectorProtection/Consistency/DataLifecycle/
 * DataVersion/MigrationPlan/QueuedMessage/Reconciliation/WebhookValidation pertencem a outro
 * documento de Concrete Structure (DATA_CONCRETE_STRUCTURE.md / INTEGRATION_RESILIENCE_CONCRETE_STRUCTURE.md)
 * e permanecem fora do escopo desta Sprint — ver OBSERVABILITY_PLATFORM_CORE_MIGRATION_REPORT.md.
 */
export * from './AlertRule';
export * from './Backup';
export * from './ConnectorProtection';
export * from './Consistency';
export * from './CorrelationId';
export * from './DataLifecycle';
export * from './DataVersion';
export * from './Metric';
export * from './MigrationPlan';
export * from './QueuedMessage';
export * from './Reconciliation';
export * from './ServiceLevel';
export * from './Span';
export * from './WebhookValidation';

// IMP-012 — Observability & Platform Operations Core
export * from './Alert';
export * from './AlertRepository';
export * from './AlertRuleRepository';
export * from './AlertRuleService';
export * from './AlertService';
export * from './HealthCheck';
export * from './HealthCheckRepository';
export * from './HealthCheckService';
export * from './Incident';
export * from './IncidentRepository';
export * from './IncidentService';
export * from './LogRecord';
export * from './LogRecordRepository';
export * from './LogService';
export * from './MetricRepository';
export * from './MetricService';
export * from './PlatformOperationsManager';
export * from './ServiceLevelRepository';
export * from './ServiceLevelService';
export * from './SpanRepository';
export * from './SpanService';
