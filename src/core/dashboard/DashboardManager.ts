import { agentCatalog } from "@/core/catalog/AgentCatalog";
import { workflowEngine } from "@/core/workflow/WorkflowEngine";
import { knowledgeBase } from "@/core/knowledge/KnowledgeBase";
import { businessMemory } from "@/core/memory/BusinessMemory";
import { promptManager } from "@/core/prompt/PromptManager";
import { aiMetrics } from "@/core/ai/AIMetrics";
import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { DashboardRefresher } from "./DashboardRefresher";
import { DashboardMetrics, type DashboardMetricsSnapshot } from "./DashboardMetrics";
import type { DashboardWidget } from "./DashboardWidget";
import type { DashboardOverview } from "./DashboardOverview";
import { buildRuntimeWidget, getPlatformStatus } from "./RuntimeWidget";
import { buildEventBusWidget, getTrackedEventTotal } from "./EventBusWidget";
import { buildMemoryWidget } from "./MemoryWidget";
import { buildWorkflowWidget } from "./WorkflowWidget";
import { buildAgentWidget } from "./AgentWidget";
import { buildKnowledgeWidget } from "./KnowledgeWidget";
import { buildAIGatewayWidget } from "./AIGatewayWidget";
import { buildAnalyticsWidget } from "./AnalyticsWidget";

const widgetBuilders: Array<() => DashboardWidget> = [
  buildRuntimeWidget,
  buildEventBusWidget,
  buildMemoryWidget,
  buildWorkflowWidget,
  buildAgentWidget,
  buildKnowledgeWidget,
  buildAIGatewayWidget,
  buildAnalyticsWidget,
];

/**
 * Coordena a coleta dos oito widgets (sete desde a Sprint 8, mais
 * AnalyticsWidget desde a Sprint 18) e o cálculo da DashboardOverview
 * (Tarefa 03). Nenhuma lógica de negócio própria: apenas orquestra
 * chamadas às APIs públicas já existentes (`agentCatalog`,
 * `workflowEngine`, `knowledgeBase`, `businessMemory`, `promptManager`,
 * `aiMetrics`) e aos oito `build*Widget()` (via DashboardRefresher).
 * `buildAnalyticsWidget()`, por sua vez, nunca consulta essas fachadas
 * — consulta exclusivamente `dashboardAnalyticsProvider`, que consulta
 * exclusivamente `analytics` (`@/core/analytics`).
 *
 * Nunca interpreta `DashboardWidget.data` (permanece opaco — ver nota em
 * DashboardWidget.ts); os totais de DashboardOverview vêm de consultas
 * diretas às mesmas fachadas públicas que os widgets também consultam
 * (ou, para Event Bus/Runtime, de pequenos acessores dedicados expostos
 * por EventBusWidget.ts/RuntimeWidget.ts — `getTrackedEventTotal()`/
 * `getPlatformStatus()` — nenhum deles é cast, nenhum lê `data`).
 *
 * Consumido exclusivamente por Dashboard (fachada).
 */
export class DashboardManager {
  private readonly refresher = new DashboardRefresher();

  private readonly metrics = new DashboardMetrics();

  private widgets: DashboardWidget[] = [];

  /** Widgets atualmente em cache; coleta uma primeira vez se ainda vazio. */
  getWidgets(): DashboardWidget[] {
    this.metrics.recordQuery();

    if (this.widgets.length === 0) {
      this.refresh();
    }

    return this.widgets;
  }

  /** Reexecuta os sete widgets via DashboardRefresher, atualiza o cache e emite DASHBOARD_WIDGET_UPDATED por widget. */
  refresh(): DashboardWidget[] {
    const startedAt = Date.now();

    this.widgets = this.refresher.refresh(widgetBuilders);

    const durationMs = Date.now() - startedAt;
    this.metrics.recordRefresh(durationMs, this.widgets.length);

    for (const widget of this.widgets) {
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.DASHBOARD_WIDGET_UPDATED,
        source: "DashboardManager",
        payload: { widgetId: widget.id, status: widget.status },
        createdAt: new Date(),
      });
    }

    return this.widgets;
  }

  /** Calcula a DashboardOverview a partir das APIs públicas dos subsistemas — sempre recalculada, nunca lida de `widget.data`. */
  getOverview(): DashboardOverview {
    this.metrics.recordQuery();

    const aiRecords = aiMetrics.getAll();
    const averageAiLatencyMs =
      aiRecords.length === 0
        ? undefined
        : aiRecords.reduce((sum, record) => sum + record.latencyMs, 0) / aiRecords.length;

    return {
      totalAgents: agentCatalog.list().length,
      totalWorkflows: workflowEngine.listWorkflows().length,
      totalDocuments: knowledgeBase.list().length,
      totalEvents: getTrackedEventTotal(),
      totalMemories: businessMemory.getAll().length,
      totalPrompts: promptManager.listTemplates().length,
      averageAiLatencyMs,
      platformStatus: getPlatformStatus(),
      generatedAt: new Date(),
    };
  }

  /** Métricas de uso do próprio Dashboard. */
  getMetricsSnapshot(): DashboardMetricsSnapshot {
    this.metrics.recordQuery();
    return this.metrics.snapshot();
  }
}
