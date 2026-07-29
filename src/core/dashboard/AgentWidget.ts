import { agentCatalog } from "@/core/catalog/AgentCatalog";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

/**
 * Monta o AgentWidget — consulta exclusivamente `agentCatalog`
 * (`@/core/catalog/AgentCatalog.ts`, fachada pública, inalterada; nunca
 * `AgentCapabilityRegistry`/`AgentHealthMonitor` diretamente).
 */
export function buildAgentWidget(): DashboardWidget {
  const profiles = agentCatalog.list();
  const metrics = agentCatalog.getMetrics();

  return {
    id: "agent",
    title: "Agent Catalog",
    type: DashboardWidgetType.AGENT,
    status: profiles.length > 0 ? DashboardWidgetStatus.OK : DashboardWidgetStatus.EMPTY,
    data: {
      registeredAgents: metrics.registeredAgents,
      availableAgents: metrics.availableAgents,
      agentsByCategory: metrics.agentsByCategory,
      registeredCapabilities: metrics.registeredCapabilities,
      selectionsPerformed: metrics.selectionsPerformed,
    },
    updatedAt: new Date(),
  };
}
