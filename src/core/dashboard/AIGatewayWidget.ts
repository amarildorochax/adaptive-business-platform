import { aiMetrics } from "@/core/ai/AIMetrics";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

/**
 * Monta o AIGatewayWidget — consulta exclusivamente `aiMetrics`
 * (`@/core/ai/AIMetrics.ts`, singleton público, inalterado; nunca
 * `AIGateway`/`AIRouter`/`AIProviderFactory`/nenhum provider
 * diretamente — `AIGateway` em si não expõe métricas, apenas
 * `generate()`; `aiMetrics` é o ponto público já dedicado a isso desde
 * a Sprint AI Gateway).
 */
export function buildAIGatewayWidget(): DashboardWidget {
  const records = aiMetrics.getAll();

  const successCount = records.filter((record) => record.success).length;
  const averageLatencyMs =
    records.length === 0
      ? 0
      : records.reduce((sum, record) => sum + record.latencyMs, 0) / records.length;

  return {
    id: "ai-gateway",
    title: "AI Gateway",
    type: DashboardWidgetType.AI_GATEWAY,
    status: records.length > 0 ? DashboardWidgetStatus.OK : DashboardWidgetStatus.EMPTY,
    data: {
      totalRequests: aiMetrics.count(),
      successCount,
      failureCount: records.length - successCount,
      averageLatencyMs,
    },
    updatedAt: new Date(),
  };
}
