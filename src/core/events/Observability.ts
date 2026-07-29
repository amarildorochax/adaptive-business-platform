import { eventBus } from "./EventBus";
import { EventTypes } from "./EventTypes";

let started = false;

/**
 * Assina o EventBus e produz logs estruturados para os eventos de
 * Boot/Runtime/Modules/Connectors/Automation/Queue/Dispatcher/Agents/
 * Provider/AI Gateway/Business Memory/Prompt Manager/Agent Orchestrator/
 * Workflow Engine/Agent Catalog/Knowledge Base/Dashboard/Marketing
 * Intelligence/CRM/Campaign/Finance/Automation/Notification Hub/
 * Analytics já emitidos pelo caminho real da plataforma.
 *
 * Responsabilidade (Sprint 0B — Integração do Runtime, substitui o que
 * antes era `EventBusTest.ts`/`startEventBusTest()`, que assinava
 * apenas eventos de Task e nunca era chamado por ninguém): ser o único
 * lugar que efetivamente escreve no console a partir de eventos — os
 * componentes que antes chamavam `console.log`/`console.error`
 * diretamente (TaskRunner, InitializeRuntimeStep, FinalizeRuntimeStep,
 * PlatformRuntime) agora publicam no EventBus; este subscriber é quem
 * decide o formato do log.
 *
 * Objetivo: centralizar toda a saída de log da plataforma em um único
 * ponto (Componentes → EventBus → Subscribers → Logs), sem alterar o
 * que é logado, apenas onde a decisão de logar acontece.
 *
 * Dependências: eventBus, EventTypes (mesmo submódulo events).
 *
 * Chamada uma única vez por `startPlatform()`, antes de `Platform` ser
 * construída, para que nenhum evento de boot seja perdido.
 */
export function startObservability(): void {
  if (started) {
    return;
  }

  started = true;

  const structuredLog = (label: string) => (event: { type: string; payload?: unknown }) => {
    console.log(`[${label}]`, event.type, event.payload ?? "");
  };

  // Boot / Runtime
  eventBus.subscribe(EventTypes.PLATFORM_BOOT_STARTED, structuredLog("Boot"));
  eventBus.subscribe(EventTypes.PLATFORM_BOOT_COMPLETED, structuredLog("Boot"));
  eventBus.subscribe(EventTypes.PLATFORM_BOOT_FAILED, structuredLog("Boot"));

  // Modules / Connectors / Automation
  eventBus.subscribe(EventTypes.MODULE_LOADED, structuredLog("Modules"));
  eventBus.subscribe(EventTypes.CONNECTOR_LOADED, structuredLog("Connectors"));
  eventBus.subscribe(EventTypes.AUTOMATION_LOADED, structuredLog("Automation"));

  // Dispatcher / Provider (execução de Agent)
  eventBus.subscribe(EventTypes.AGENT_EXECUTION_STARTED, structuredLog("Dispatcher"));
  eventBus.subscribe(EventTypes.AGENT_EXECUTION_COMPLETED, structuredLog("Provider"));
  eventBus.subscribe(EventTypes.AGENT_EXECUTION_FAILED, structuredLog("Dispatcher"));

  // AI Gateway (Sprint AI Gateway)
  eventBus.subscribe(EventTypes.AI_REQUEST_STARTED, structuredLog("AI Gateway"));
  eventBus.subscribe(EventTypes.AI_REQUEST_COMPLETED, structuredLog("AI Gateway"));
  eventBus.subscribe(EventTypes.AI_REQUEST_FAILED, structuredLog("AI Gateway"));

  // Business Memory (Sprint Business Memory)
  eventBus.subscribe(EventTypes.MEMORY_CREATED, structuredLog("Business Memory"));
  eventBus.subscribe(EventTypes.MEMORY_UPDATED, structuredLog("Business Memory"));
  eventBus.subscribe(EventTypes.MEMORY_REMOVED, structuredLog("Business Memory"));
  eventBus.subscribe(EventTypes.MEMORY_ACCESSED, structuredLog("Business Memory"));

  // Prompt Manager (Sprint Prompt Manager)
  eventBus.subscribe(EventTypes.PROMPT_CREATED, structuredLog("Prompt Manager"));
  eventBus.subscribe(EventTypes.PROMPT_RENDERED, structuredLog("Prompt Manager"));
  eventBus.subscribe(EventTypes.PROMPT_REGISTERED, structuredLog("Prompt Manager"));
  eventBus.subscribe(EventTypes.PROMPT_UPDATED, structuredLog("Prompt Manager"));
  eventBus.subscribe(EventTypes.PROMPT_REMOVED, structuredLog("Prompt Manager"));

  // Agent Orchestrator (Sprint Agent Orchestrator)
  eventBus.subscribe(EventTypes.ORCHESTRATION_STARTED, structuredLog("Agent Orchestrator"));
  eventBus.subscribe(EventTypes.STEP_STARTED, structuredLog("Agent Orchestrator"));
  eventBus.subscribe(EventTypes.STEP_COMPLETED, structuredLog("Agent Orchestrator"));
  eventBus.subscribe(EventTypes.STEP_FAILED, structuredLog("Agent Orchestrator"));
  eventBus.subscribe(EventTypes.ORCHESTRATION_COMPLETED, structuredLog("Agent Orchestrator"));

  // Workflow Engine (Sprint Workflow Engine)
  eventBus.subscribe(EventTypes.WORKFLOW_STARTED, structuredLog("Workflow Engine"));
  eventBus.subscribe(EventTypes.WORKFLOW_STEP_STARTED, structuredLog("Workflow Engine"));
  eventBus.subscribe(EventTypes.WORKFLOW_STEP_COMPLETED, structuredLog("Workflow Engine"));
  eventBus.subscribe(EventTypes.WORKFLOW_FAILED, structuredLog("Workflow Engine"));
  eventBus.subscribe(EventTypes.WORKFLOW_COMPLETED, structuredLog("Workflow Engine"));

  // Agent Catalog (Sprint Agent Catalog)
  eventBus.subscribe(EventTypes.AGENT_REGISTERED, structuredLog("Agent Catalog"));
  eventBus.subscribe(EventTypes.AGENT_UPDATED, structuredLog("Agent Catalog"));
  eventBus.subscribe(EventTypes.AGENT_REMOVED, structuredLog("Agent Catalog"));
  eventBus.subscribe(EventTypes.AGENT_SELECTED, structuredLog("Agent Catalog"));
  eventBus.subscribe(EventTypes.AGENT_HEALTH_UPDATED, structuredLog("Agent Catalog"));

  // Knowledge Base (Sprint Knowledge Base)
  eventBus.subscribe(EventTypes.KNOWLEDGE_CREATED, structuredLog("Knowledge Base"));
  eventBus.subscribe(EventTypes.KNOWLEDGE_UPDATED, structuredLog("Knowledge Base"));
  eventBus.subscribe(EventTypes.KNOWLEDGE_REMOVED, structuredLog("Knowledge Base"));
  eventBus.subscribe(EventTypes.KNOWLEDGE_SEARCHED, structuredLog("Knowledge Base"));
  eventBus.subscribe(EventTypes.KNOWLEDGE_ACCESSED, structuredLog("Knowledge Base"));

  // Dashboard (Sprint Adaptive Dashboard)
  eventBus.subscribe(EventTypes.DASHBOARD_OPENED, structuredLog("Dashboard"));
  eventBus.subscribe(EventTypes.DASHBOARD_REFRESHED, structuredLog("Dashboard"));
  eventBus.subscribe(EventTypes.DASHBOARD_WIDGET_UPDATED, structuredLog("Dashboard"));

  // Marketing Intelligence (Sprint 10)
  eventBus.subscribe(EventTypes.MARKETING_ANALYSIS_STARTED, structuredLog("Marketing Intelligence"));
  eventBus.subscribe(EventTypes.MARKETING_ANALYSIS_COMPLETED, structuredLog("Marketing Intelligence"));
  eventBus.subscribe(EventTypes.MARKETING_SEGMENT_CREATED, structuredLog("Marketing Intelligence"));
  eventBus.subscribe(EventTypes.MARKETING_INSIGHT_GENERATED, structuredLog("Marketing Intelligence"));
  eventBus.subscribe(EventTypes.MARKETING_PROVIDER_CONNECTED, structuredLog("Marketing Intelligence"));

  // CRM (Sprint 10A)
  eventBus.subscribe(EventTypes.CRM_CUSTOMER_CREATED, structuredLog("CRM"));
  eventBus.subscribe(EventTypes.CRM_CUSTOMER_UPDATED, structuredLog("CRM"));
  eventBus.subscribe(EventTypes.CRM_CUSTOMER_REMOVED, structuredLog("CRM"));
  eventBus.subscribe(EventTypes.CRM_INTERACTION_CREATED, structuredLog("CRM"));
  eventBus.subscribe(EventTypes.CRM_OPPORTUNITY_CREATED, structuredLog("CRM"));
  eventBus.subscribe(EventTypes.CRM_OPPORTUNITY_UPDATED, structuredLog("CRM"));

  // Campaign (Sprint 11)
  eventBus.subscribe(EventTypes.CAMPAIGN_CREATED, structuredLog("Campaign"));
  eventBus.subscribe(EventTypes.CAMPAIGN_UPDATED, structuredLog("Campaign"));
  eventBus.subscribe(EventTypes.CAMPAIGN_REMOVED, structuredLog("Campaign"));
  eventBus.subscribe(EventTypes.CAMPAIGN_STARTED, structuredLog("Campaign"));
  eventBus.subscribe(EventTypes.CAMPAIGN_FINISHED, structuredLog("Campaign"));

  // Finance (Sprint 13)
  eventBus.subscribe(EventTypes.FINANCE_REVENUE_RECORDED, structuredLog("Finance"));
  eventBus.subscribe(EventTypes.FINANCE_EXPENSE_RECORDED, structuredLog("Finance"));
  eventBus.subscribe(EventTypes.FINANCE_SNAPSHOT_UPDATED, structuredLog("Finance"));

  // Automation (Sprint 14)
  eventBus.subscribe(EventTypes.AUTOMATION_RULE_CREATED, structuredLog("Automation"));
  eventBus.subscribe(EventTypes.AUTOMATION_RULE_UPDATED, structuredLog("Automation"));
  eventBus.subscribe(EventTypes.AUTOMATION_RULE_REMOVED, structuredLog("Automation"));
  eventBus.subscribe(EventTypes.AUTOMATION_RULE_ENABLED, structuredLog("Automation"));
  eventBus.subscribe(EventTypes.AUTOMATION_RULE_DISABLED, structuredLog("Automation"));
  eventBus.subscribe(EventTypes.AUTOMATION_RULE_EXECUTED, structuredLog("Automation"));

  // Notification Hub (Sprint 15)
  eventBus.subscribe(EventTypes.NOTIFICATION_CREATED, structuredLog("Notification Hub"));
  eventBus.subscribe(EventTypes.NOTIFICATION_UPDATED, structuredLog("Notification Hub"));
  eventBus.subscribe(EventTypes.NOTIFICATION_DELIVERY_REGISTERED, structuredLog("Notification Hub"));

  // Analytics (Sprint 16)
  eventBus.subscribe(EventTypes.ANALYTICS_METRIC_COLLECTED, structuredLog("Analytics"));
  eventBus.subscribe(EventTypes.ANALYTICS_SNAPSHOT_CREATED, structuredLog("Analytics"));
  eventBus.subscribe(EventTypes.ANALYTICS_REPORT_CREATED, structuredLog("Analytics"));
  eventBus.subscribe(EventTypes.ANALYTICS_SYNC_STARTED, structuredLog("Analytics"));
  eventBus.subscribe(EventTypes.ANALYTICS_SYNC_COMPLETED, structuredLog("Analytics"));

  // Dashboard Analytics Integration (Sprint 18)
  eventBus.subscribe(EventTypes.DASHBOARD_REFRESH_STARTED, structuredLog("Dashboard"));
  eventBus.subscribe(EventTypes.DASHBOARD_REFRESH_COMPLETED, structuredLog("Dashboard"));

  // Business Intelligence (Sprint 19)
  eventBus.subscribe(EventTypes.BI_ANALYSIS_STARTED, structuredLog("Business Intelligence"));
  eventBus.subscribe(EventTypes.BI_ANALYSIS_COMPLETED, structuredLog("Business Intelligence"));
  eventBus.subscribe(EventTypes.BI_AUTOMATION_SYNC_STARTED, structuredLog("Business Intelligence"));
  eventBus.subscribe(EventTypes.BI_AUTOMATION_SYNC_COMPLETED, structuredLog("Business Intelligence"));

  // Execution (Sprint 21)
  eventBus.subscribe(EventTypes.EXECUTION_REQUESTED, structuredLog("Execution"));
  eventBus.subscribe(EventTypes.EXECUTION_CANCELLED, structuredLog("Execution"));
  eventBus.subscribe(EventTypes.EXECUTION_APPROVED, structuredLog("Execution"));

  // Execution Engine (Sprint 23) — EXECUTION_CANCELLED reaproveitado (já assinado acima, Sprint 21)
  eventBus.subscribe(EventTypes.EXECUTION_STARTED, structuredLog("Execution Engine"));
  eventBus.subscribe(EventTypes.EXECUTION_COMPLETED, structuredLog("Execution Engine"));
  eventBus.subscribe(EventTypes.EXECUTION_FAILED, structuredLog("Execution Engine"));

  // Execution Scheduling (Sprint 22)
  eventBus.subscribe(EventTypes.EXECUTION_SCHEDULED, structuredLog("Execution Scheduling"));
  eventBus.subscribe(EventTypes.EXECUTION_SCHEDULE_APPROVED, structuredLog("Execution Scheduling"));
  eventBus.subscribe(EventTypes.EXECUTION_SCHEDULE_REJECTED, structuredLog("Execution Scheduling"));

  // Queue
  eventBus.subscribe(EventTypes.TASK_CREATED, structuredLog("Queue"));
  eventBus.subscribe(EventTypes.TASK_STARTED, structuredLog("Queue"));
  eventBus.subscribe(EventTypes.TASK_COMPLETED, structuredLog("Queue"));
  eventBus.subscribe(EventTypes.TASK_FAILED, structuredLog("Queue"));

  // Agents
  eventBus.subscribe(EventTypes.AGENT_ONLINE, structuredLog("Agents"));
  eventBus.subscribe(EventTypes.AGENT_OFFLINE, structuredLog("Agents"));
  eventBus.subscribe(EventTypes.AGENT_BUSY, structuredLog("Agents"));
  eventBus.subscribe(EventTypes.AGENT_IDLE, structuredLog("Agents"));
}
