import { knowledgeBase } from "@/core/knowledge/KnowledgeBase";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

/**
 * Monta o KnowledgeWidget — consulta exclusivamente `knowledgeBase`
 * (`@/core/knowledge/KnowledgeBase.ts`, fachada pública, inalterada;
 * nunca `KnowledgeManager`/`KnowledgeStore`/`KnowledgeSearch`/
 * `KnowledgeIndex` diretamente).
 */
export function buildKnowledgeWidget(): DashboardWidget {
  const documents = knowledgeBase.list();
  const metrics = knowledgeBase.getMetrics();

  return {
    id: "knowledge",
    title: "Knowledge Base",
    type: DashboardWidgetType.KNOWLEDGE,
    status: documents.length > 0 ? DashboardWidgetStatus.OK : DashboardWidgetStatus.EMPTY,
    data: {
      documentsRegistered: metrics.documentsRegistered,
      documentsByCategory: metrics.documentsByCategory,
      totalQueries: metrics.totalQueries,
      averageSearchTimeMs: metrics.averageSearchTimeMs,
    },
    updatedAt: new Date(),
  };
}
