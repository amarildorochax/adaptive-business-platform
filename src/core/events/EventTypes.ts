/**
 * Catálogo central dos tipos de evento (`Event.type`) já previstos pela
 * plataforma, organizados por domínio.
 *
 * Nota (Sprint 0B — Integração do Runtime): a categoria "Platform/Boot"
 * e "Execution" abaixo passaram a ser efetivamente emitidas via
 * `eventBus.emit()` pelo caminho real de boot e de execução (ver
 * PlatformRuntime, InitializeRuntimeStep, TaskRunner) — a observabilidade
 * estruturada (src/core/events/Observability.ts) assina todas elas.
 *
 * Nota (Sprint AI Gateway): categoria "AI Gateway" adicionada — emitida
 * por AIGateway.ts a cada chamada de `generate()`, também assinada por
 * Observability.ts.
 *
 * Nota (Sprint Business Memory): categoria "Business Memory" adicionada
 * — emitida por MemoryManager.ts a cada operação de CRUD/consulta,
 * também assinada por Observability.ts.
 *
 * Nota (Sprint Prompt Manager): categoria "Prompt Manager" adicionada —
 * emitida por PromptRegistry.ts (registro/atualização/remoção) e por
 * PromptManager.ts (criação/renderização), também assinada por
 * Observability.ts.
 *
 * Nota (Sprint Agent Orchestrator): categoria "Agent Orchestrator"
 * adicionada — emitida por AgentOrchestrator.ts a cada `execute()` e a
 * cada ExecutionStep, também assinada por Observability.ts.
 *
 * Nota (Sprint Workflow Engine): categoria "Workflow Engine" adicionada
 * — emitida por WorkflowExecutor.ts a cada `execute()` e a cada
 * WorkflowStep, também assinada por Observability.ts.
 *
 * Nota (Sprint Agent Catalog): categoria "Agent Catalog" adicionada —
 * emitida por AgentCatalog.ts (registro/atualização/remoção),
 * AgentSelector.ts (seleção, `@/core/orchestrator`, alteração pontual
 * autorizada por esta Sprint), e AgentHealthMonitor.ts (saúde), também
 * assinada por Observability.ts.
 *
 * Nota (Sprint Knowledge Base): categoria "Knowledge Base" adicionada —
 * emitida por KnowledgeManager.ts (CRUD/consulta/busca), também
 * assinada por Observability.ts.
 *
 * Nota (Sprint Adaptive Dashboard): `DASHBOARD_OPENED`/
 * `DASHBOARD_REFRESHED`/`DASHBOARD_WIDGET_UPDATED` adicionados à
 * categoria "Dashboard" já existente — emitidos por Dashboard.ts/
 * DashboardManager.ts (`@/core/dashboard`), também assinados por
 * Observability.ts. `DASHBOARD_REFRESH`/`KPI_UPDATED` já existiam desde
 * antes da Sprint 0A (escritório Phaser) e permanecem inalterados —
 * nomes distintos, sem colisão.
 *
 * Nota (Sprint 10 — Marketing Intelligence): categoria "Marketing
 * Intelligence" adicionada — emitida por MarketingManager.ts
 * (`@/core/marketing`) a cada `analyze()`, segmento e recomendação,
 * também assinada por Observability.ts. Esta Sprint pressupunha um
 * "CRM Core" (`src/core/crm/`) já consolidado, que não existe neste
 * projeto; Marketing Intelligence opera sobre dados simulados (ver
 * MarketingSimulatedData.ts) — decisão confirmada com o usuário.
 *
 * Nota (Sprint 10A — CRM Core): categoria "CRM" adicionada — emitida
 * por CRMManager.ts (`@/core/crm`) a cada operação de Customer/
 * Interaction/Opportunity, também assinada por Observability.ts. Cria a
 * fonte oficial de dados comerciais da plataforma — Marketing
 * Intelligence (Sprint 10) permanece inalterado nesta Sprint; a futura
 * substituição de MarketingSimulatedData por um CampaignProvider
 * conectado a este CRM é trabalho de uma Sprint futura.
 *
 * Nota (Sprint 10B — CRM ↔ Marketing Integration): `MARKETING_PROVIDER_
 * CONNECTED` adicionado à categoria "Marketing Intelligence" já
 * existente — emitido por MarketingManager.ts uma única vez, na
 * primeira análise, provando que CampaignProvider está de fato
 * consultando o CRM Core. MarketingSimulatedData.ts foi removido nesta
 * Sprint.
 *
 * Nota (Sprint 11 — Campaign Management): categoria "Campaign"
 * adicionada — emitida por CampaignManager.ts (`@/core/campaign`) a
 * cada operação de CampaignRecord, também assinada por Observability.ts.
 * Cria a fonte oficial de campanhas da plataforma — CRM e Marketing
 * permanecem inalterados nesta Sprint; a futura substituição de
 * `CampaignProvider.listCampaigns()` (hoje sempre `[]`, `@/core/
 * marketing`) por uma leitura real deste módulo é trabalho de uma
 * Sprint futura.
 *
 * (Sprint 12 — Campaign ↔ Marketing Integration: nenhum evento novo;
 * `CampaignProvider.listCampaigns()` passou a consultar `campaign.
 * listCampaigns()`/`listResults()` em vez de retornar `[]`.)
 *
 * Nota (Sprint 13 — Finance Intelligence): categoria "Finance"
 * adicionada — emitida por FinanceManager.ts (`@/core/finance`) a cada
 * RevenueRecord/ExpenseRecord registrado e a cada FinancialSnapshot
 * calculado, também assinada por Observability.ts. Cria a fonte oficial
 * de dados financeiros da plataforma — nenhum cálculo depende de
 * CRM/Campaign/Marketing; CRM/Campaign/Marketing permanecem inalterados
 * nesta Sprint.
 *
 * Nota (Sprint 14 — Automation Center): categoria "Automation"
 * adicionada — emitida por AutomationManager.ts a cada operação de
 * AutomationRule, também assinada por Observability.ts. Implementada em
 * `src/core/automations/` (plural) — `src/core/automation/` (singular)
 * já existia desde a Sprint 0A (stubs `IAutomation` legados:
 * WorkflowEngine/RuleEngine/TriggerManager/HookManager/PolicyManager,
 * nunca implementados, sem nenhum consumidor real) e permanece
 * completamente intocado, mesmo princípio já aplicado à colisão
 * `WorkflowEngine` na Sprint Workflow Engine.
 *
 * Nota (Sprint 15 — Notification Hub): categoria "Notification Hub"
 * adicionada com apenas `NOTIFICATION_UPDATED`/
 * `NOTIFICATION_DELIVERY_REGISTERED` — `NOTIFICATION_CREATED` **não**
 * foi duplicado: já existia na categoria "System" desde a Sprint 0A
 * (nunca antes emitido por nenhum caminho real), e passou a ser
 * reaproveitado, com o mesmo nome e valor, por NotificationManager.ts
 * (`@/core/notifications`) — todos os três, também assinados por
 * Observability.ts.
 *
 * Nota (Sprint 16 — Business Analytics): categoria "Analytics"
 * adicionada — emitida por AnalyticsManager.ts (`@/core/analytics`) a
 * cada AnalyticsMetric coletada, AnalyticsSnapshot criada e
 * AnalyticsReport gerado, também assinada por Observability.ts. Nenhum
 * módulo anterior é lido diretamente por Analytics — métricas chegam
 * apenas via `Analytics.collectMetric()`, chamado por quem já consultou
 * a fachada pública do domínio de origem.
 *
 * Nota (Sprint 17 — Analytics Integration): `ANALYTICS_SYNC_STARTED`/
 * `ANALYTICS_SYNC_COMPLETED` adicionados à categoria "Analytics" já
 * existente — emitidos por AnalyticsProvider.ts (`@/core/analytics`,
 * não por AnalyticsManager.ts — exceção documentada em
 * AnalyticsProvider.ts), também assinados por Observability.ts.
 * AnalyticsProvider passou a sincronizar automaticamente CRM/Campaign/
 * Marketing/Finance/Automation/Notification Hub via suas fachadas
 * públicas `getMetrics()` — nenhum dos seis foi alterado.
 *
 * Nota (Sprint 18 — Dashboard Integration): `DASHBOARD_REFRESH_STARTED`/
 * `DASHBOARD_REFRESH_COMPLETED` adicionados à categoria "Dashboard" já
 * existente — emitidos exclusivamente por DashboardAnalyticsProvider.ts
 * (`@/core/dashboard`), também assinados por Observability.ts.
 * Distintos de `DASHBOARD_REFRESHED` (Sprint 8, emitido por
 * `Dashboard.refresh()` ao reexecutar os widgets) — estes dois novos
 * cobrem especificamente o ciclo de `DashboardAnalyticsProvider.
 * refresh()` (carregar snapshot/reports do Business Analytics), uma
 * operação distinta e independente. `@/core/analytics` foi lido
 * exclusivamente por `analytics.getSnapshot()`/`analytics.
 * listReports()` — inalterado nesta Sprint.
 *
 * Nota (Sprint 19 — Business Intelligence Engine): categoria "Business
 * Intelligence" adicionada — `BI_ANALYSIS_STARTED`/`BI_ANALYSIS_
 * COMPLETED` emitidos exclusivamente por BusinessIntelligenceManager.ts
 * (`@/core/business-intelligence`), também assinados por
 * Observability.ts. Interpreta AnalyticsReport via `analytics.
 * listReports()`/`analytics.getSnapshot()` — Analytics e Dashboard
 * permanecem inalterados nesta Sprint.
 *
 * Nota (Sprint 20 — Business Intelligence ↔ Automation Integration):
 * `BI_AUTOMATION_SYNC_STARTED`/`BI_AUTOMATION_SYNC_COMPLETED`
 * adicionados à categoria "Business Intelligence" já existente —
 * emitidos exclusivamente por
 * BusinessIntelligenceAutomationProvider.ts (`@/core/
 * business-intelligence`), também assinados por Observability.ts.
 * Converte Recommendation em AutomationRule sempre desabilitada
 * (`enabled: false`) via `businessIntelligence.listRecommendations()`/
 * `automation.createTrigger()`/`createAction()`/`createRule()` — todos
 * públicos. Automation Center, Business Analytics, Dashboard, CRM,
 * Campaign, Marketing e Finance permanecem inalterados nesta Sprint.
 *
 * Nota (Sprint 21 — Execution Orchestration): categoria "Execution"
 * adicionada — `EXECUTION_REQUESTED`/`EXECUTION_CANCELLED`/
 * `EXECUTION_APPROVED` emitidos exclusivamente por
 * ExecutionManager.ts (`@/core/execution`), também assinados por
 * Observability.ts. Consulta exclusivamente `automation.getRule()` —
 * nenhuma execução real ocorre nesta Sprint. Automation Center e
 * Business Intelligence permanecem inalterados.
 *
 * Nota (Sprint 22 — Execution Scheduling & Approval): categoria
 * "Execution Scheduling" adicionada — `EXECUTION_SCHEDULED`/
 * `EXECUTION_SCHEDULE_APPROVED`/`EXECUTION_SCHEDULE_REJECTED`
 * emitidos exclusivamente por ExecutionSchedulingManager.ts
 * (`@/core/execution-scheduling`), também assinados por
 * Observability.ts. Consulta exclusivamente `execution.getExecution()`
 * — nenhuma execução real ocorre nesta Sprint. Execution, Automation,
 * Business Intelligence, Analytics e Dashboard permanecem inalterados.
 *
 * Nota (Sprint 23 — Execution Engine): `EXECUTION_STARTED`/
 * `EXECUTION_COMPLETED`/`EXECUTION_FAILED` adicionados à categoria
 * "Execution" já existente — emitidos exclusivamente por
 * ExecutionEngineManager.ts (`@/core/execution-engine`), também
 * assinados por Observability.ts. `EXECUTION_CANCELLED` **não** foi
 * duplicado: já existia nesta mesma categoria desde a Sprint 21, e
 * passou a ser reaproveitado, com o mesmo nome e valor, por
 * ExecutionEngineManager.ts também. Consulta exclusivamente
 * `executionScheduling.getSchedule()` — nenhuma execução real ocorre
 * nesta Sprint. Execution, Execution Scheduling, Automation, Business
 * Intelligence, Analytics e Dashboard permanecem inalterados.
 */
export const EventTypes = {
  // Platform / Boot
  PLATFORM_BOOT_STARTED: "PLATFORM_BOOT_STARTED",
  PLATFORM_BOOT_COMPLETED: "PLATFORM_BOOT_COMPLETED",
  PLATFORM_BOOT_FAILED: "PLATFORM_BOOT_FAILED",
  MODULE_LOADED: "MODULE_LOADED",
  CONNECTOR_LOADED: "CONNECTOR_LOADED",
  AUTOMATION_LOADED: "AUTOMATION_LOADED",

  // Execution
  AGENT_EXECUTION_STARTED: "AGENT_EXECUTION_STARTED",
  AGENT_EXECUTION_COMPLETED: "AGENT_EXECUTION_COMPLETED",
  AGENT_EXECUTION_FAILED: "AGENT_EXECUTION_FAILED",

  // AI Gateway
  AI_REQUEST_STARTED: "AI_REQUEST_STARTED",
  AI_REQUEST_COMPLETED: "AI_REQUEST_COMPLETED",
  AI_REQUEST_FAILED: "AI_REQUEST_FAILED",

  // Business Memory
  MEMORY_CREATED: "MEMORY_CREATED",
  MEMORY_UPDATED: "MEMORY_UPDATED",
  MEMORY_REMOVED: "MEMORY_REMOVED",
  MEMORY_ACCESSED: "MEMORY_ACCESSED",

  // Prompt Manager
  PROMPT_CREATED: "PROMPT_CREATED",
  PROMPT_RENDERED: "PROMPT_RENDERED",
  PROMPT_REGISTERED: "PROMPT_REGISTERED",
  PROMPT_UPDATED: "PROMPT_UPDATED",
  PROMPT_REMOVED: "PROMPT_REMOVED",

  // Agent Orchestrator
  ORCHESTRATION_STARTED: "ORCHESTRATION_STARTED",
  STEP_STARTED: "STEP_STARTED",
  STEP_COMPLETED: "STEP_COMPLETED",
  STEP_FAILED: "STEP_FAILED",
  ORCHESTRATION_COMPLETED: "ORCHESTRATION_COMPLETED",

  // Workflow Engine
  WORKFLOW_STARTED: "WORKFLOW_STARTED",
  WORKFLOW_STEP_STARTED: "WORKFLOW_STEP_STARTED",
  WORKFLOW_STEP_COMPLETED: "WORKFLOW_STEP_COMPLETED",
  WORKFLOW_FAILED: "WORKFLOW_FAILED",
  WORKFLOW_COMPLETED: "WORKFLOW_COMPLETED",

  // Agent Catalog
  AGENT_REGISTERED: "AGENT_REGISTERED",
  AGENT_UPDATED: "AGENT_UPDATED",
  AGENT_REMOVED: "AGENT_REMOVED",
  AGENT_SELECTED: "AGENT_SELECTED",
  AGENT_HEALTH_UPDATED: "AGENT_HEALTH_UPDATED",

  // Knowledge Base
  KNOWLEDGE_CREATED: "KNOWLEDGE_CREATED",
  KNOWLEDGE_UPDATED: "KNOWLEDGE_UPDATED",
  KNOWLEDGE_REMOVED: "KNOWLEDGE_REMOVED",
  KNOWLEDGE_SEARCHED: "KNOWLEDGE_SEARCHED",
  KNOWLEDGE_ACCESSED: "KNOWLEDGE_ACCESSED",

  // Tasks
  TASK_CREATED: "TASK_CREATED",
  TASK_STARTED: "TASK_STARTED",
  TASK_COMPLETED: "TASK_COMPLETED",
  TASK_FAILED: "TASK_FAILED",

  // Agents
  AGENT_ONLINE: "AGENT_ONLINE",
  AGENT_OFFLINE: "AGENT_OFFLINE",
  AGENT_BUSY: "AGENT_BUSY",
  AGENT_IDLE: "AGENT_IDLE",

  // Squads
  SQUAD_SELECTED: "SQUAD_SELECTED",
  SQUAD_UPDATED: "SQUAD_UPDATED",

  // Blog
  BLOG_CREATED: "BLOG_CREATED",
  BLOG_UPDATED: "BLOG_UPDATED",
  BLOG_PUBLISHED: "BLOG_PUBLISHED",

  // Pinterest
  PIN_CREATED: "PIN_CREATED",
  PIN_PUBLISHED: "PIN_PUBLISHED",

  // CRM
  LEAD_RECEIVED: "LEAD_RECEIVED",
  CUSTOMER_CREATED: "CUSTOMER_CREATED",
  SALE_COMPLETED: "SALE_COMPLETED",

  // Traffic
  META_ANALYZED: "META_ANALYZED",
  GOOGLE_ANALYZED: "GOOGLE_ANALYZED",
  PINTEREST_ANALYZED: "PINTEREST_ANALYZED",

  // Dashboard
  DASHBOARD_REFRESH: "DASHBOARD_REFRESH",
  KPI_UPDATED: "KPI_UPDATED",
  DASHBOARD_OPENED: "DASHBOARD_OPENED",
  DASHBOARD_REFRESHED: "DASHBOARD_REFRESHED",
  DASHBOARD_WIDGET_UPDATED: "DASHBOARD_WIDGET_UPDATED",
  DASHBOARD_REFRESH_STARTED: "DASHBOARD_REFRESH_STARTED",
  DASHBOARD_REFRESH_COMPLETED: "DASHBOARD_REFRESH_COMPLETED",

  // Business Intelligence
  BI_ANALYSIS_STARTED: "BI_ANALYSIS_STARTED",
  BI_ANALYSIS_COMPLETED: "BI_ANALYSIS_COMPLETED",
  BI_AUTOMATION_SYNC_STARTED: "BI_AUTOMATION_SYNC_STARTED",
  BI_AUTOMATION_SYNC_COMPLETED: "BI_AUTOMATION_SYNC_COMPLETED",

  // Execution
  EXECUTION_REQUESTED: "EXECUTION_REQUESTED",
  EXECUTION_CANCELLED: "EXECUTION_CANCELLED",
  EXECUTION_APPROVED: "EXECUTION_APPROVED",
  EXECUTION_STARTED: "EXECUTION_STARTED",
  EXECUTION_COMPLETED: "EXECUTION_COMPLETED",
  EXECUTION_FAILED: "EXECUTION_FAILED",

  // Execution Scheduling
  EXECUTION_SCHEDULED: "EXECUTION_SCHEDULED",
  EXECUTION_SCHEDULE_APPROVED: "EXECUTION_SCHEDULE_APPROVED",
  EXECUTION_SCHEDULE_REJECTED: "EXECUTION_SCHEDULE_REJECTED",

  // Marketing Intelligence
  MARKETING_ANALYSIS_STARTED: "MARKETING_ANALYSIS_STARTED",
  MARKETING_ANALYSIS_COMPLETED: "MARKETING_ANALYSIS_COMPLETED",
  MARKETING_SEGMENT_CREATED: "MARKETING_SEGMENT_CREATED",
  MARKETING_INSIGHT_GENERATED: "MARKETING_INSIGHT_GENERATED",
  MARKETING_PROVIDER_CONNECTED: "MARKETING_PROVIDER_CONNECTED",

  // CRM
  CRM_CUSTOMER_CREATED: "CRM_CUSTOMER_CREATED",
  CRM_CUSTOMER_UPDATED: "CRM_CUSTOMER_UPDATED",
  CRM_CUSTOMER_REMOVED: "CRM_CUSTOMER_REMOVED",
  CRM_INTERACTION_CREATED: "CRM_INTERACTION_CREATED",
  CRM_OPPORTUNITY_CREATED: "CRM_OPPORTUNITY_CREATED",
  CRM_OPPORTUNITY_UPDATED: "CRM_OPPORTUNITY_UPDATED",

  // Campaign
  CAMPAIGN_CREATED: "CAMPAIGN_CREATED",
  CAMPAIGN_UPDATED: "CAMPAIGN_UPDATED",
  CAMPAIGN_REMOVED: "CAMPAIGN_REMOVED",
  CAMPAIGN_STARTED: "CAMPAIGN_STARTED",
  CAMPAIGN_FINISHED: "CAMPAIGN_FINISHED",

  // Finance
  FINANCE_REVENUE_RECORDED: "FINANCE_REVENUE_RECORDED",
  FINANCE_EXPENSE_RECORDED: "FINANCE_EXPENSE_RECORDED",
  FINANCE_SNAPSHOT_UPDATED: "FINANCE_SNAPSHOT_UPDATED",

  // Automation
  AUTOMATION_RULE_CREATED: "AUTOMATION_RULE_CREATED",
  AUTOMATION_RULE_UPDATED: "AUTOMATION_RULE_UPDATED",
  AUTOMATION_RULE_REMOVED: "AUTOMATION_RULE_REMOVED",
  AUTOMATION_RULE_ENABLED: "AUTOMATION_RULE_ENABLED",
  AUTOMATION_RULE_DISABLED: "AUTOMATION_RULE_DISABLED",
  AUTOMATION_RULE_EXECUTED: "AUTOMATION_RULE_EXECUTED",

  // Notification Hub
  NOTIFICATION_UPDATED: "NOTIFICATION_UPDATED",
  NOTIFICATION_DELIVERY_REGISTERED: "NOTIFICATION_DELIVERY_REGISTERED",

  // Analytics
  ANALYTICS_METRIC_COLLECTED: "ANALYTICS_METRIC_COLLECTED",
  ANALYTICS_SNAPSHOT_CREATED: "ANALYTICS_SNAPSHOT_CREATED",
  ANALYTICS_REPORT_CREATED: "ANALYTICS_REPORT_CREATED",
  ANALYTICS_SYNC_STARTED: "ANALYTICS_SYNC_STARTED",
  ANALYTICS_SYNC_COMPLETED: "ANALYTICS_SYNC_COMPLETED",

  // System
  ERROR_OCCURRED: "ERROR_OCCURRED",
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
} as const;

export type EventType =
  (typeof EventTypes)[keyof typeof EventTypes];
