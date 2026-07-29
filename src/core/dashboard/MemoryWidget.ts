import { businessMemory } from "@/core/memory/BusinessMemory";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

/**
 * Monta o MemoryWidget — consulta exclusivamente `businessMemory`
 * (`@/core/memory/BusinessMemory.ts`, fachada pública, inalterada;
 * nunca `MemoryManager`/`MemoryStore`/`MemoryIndex` diretamente).
 */
export function buildMemoryWidget(): DashboardWidget {
  const records = businessMemory.getAll();
  const metrics = businessMemory.getMetrics();

  return {
    id: "memory",
    title: "Business Memory",
    type: DashboardWidgetType.MEMORY,
    status: records.length > 0 ? DashboardWidgetStatus.OK : DashboardWidgetStatus.EMPTY,
    data: {
      totalRecords: metrics.totalRecords,
      recordsByCategory: metrics.recordsByCategory,
      totalQueries: metrics.totalQueries,
      averageQueryTimeMs: metrics.averageQueryTimeMs,
    },
    updatedAt: new Date(),
  };
}
