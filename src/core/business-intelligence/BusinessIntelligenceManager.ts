import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { Insight } from "./Insight";
import type { Recommendation } from "./Recommendation";
import type { Trend } from "./Trend";
import { BusinessIntelligenceService } from "./BusinessIntelligenceService";
import { BusinessIntelligenceMetrics, type BusinessIntelligenceMetricsSnapshot } from "./BusinessIntelligenceMetrics";

/**
 * Coordena a interpretação de AnalyticsReport (Tarefa 03) — delega a
 * BusinessIntelligenceService, registra BusinessIntelligenceMetrics e
 * emite os eventos de ciclo de vida (BI_ANALYSIS_STARTED/
 * BI_ANALYSIS_COMPLETED, Tarefa 07) — sempre os dois, mesmo quando
 * `reportId` não existir (o `payload` de `BI_ANALYSIS_COMPLETED`
 * indica `success: false` nesse caso).
 *
 * Consumido exclusivamente por BusinessIntelligence (fachada).
 */
export class BusinessIntelligenceManager {
  private readonly service = new BusinessIntelligenceService();

  private readonly metrics = new BusinessIntelligenceMetrics();

  /** Interpreta o AnalyticsReport de `reportId`. Retorna `undefined` se ele (ou sua snapshot) não existir. */
  analyzeReport(reportId: string): Insight[] | undefined {
    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.BI_ANALYSIS_STARTED,
      source: "BusinessIntelligenceManager",
      payload: { reportId },
      createdAt: new Date(),
    });

    const result = this.service.analyzeReport(reportId);

    if (result) {
      this.metrics.recordAnalysis(result.insights.length, result.recommendations.length, result.trends.length);
    }

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.BI_ANALYSIS_COMPLETED,
      source: "BusinessIntelligenceManager",
      payload: {
        reportId,
        success: result !== undefined,
        insightsGenerated: result?.insights.length ?? 0,
      },
      createdAt: new Date(),
    });

    return result?.insights;
  }

  /** Retorna todos os Insight já gerados. Registra consulta. */
  listInsights(): Insight[] {
    this.metrics.recordQuery();
    return this.service.listInsights();
  }

  /** Retorna todas as Recommendation já geradas. Registra consulta. */
  listRecommendations(): Recommendation[] {
    this.metrics.recordQuery();
    return this.service.listRecommendations();
  }

  /** Retorna todos os Trend já detectados. Registra consulta. */
  listTrends(): Trend[] {
    this.metrics.recordQuery();
    return this.service.listTrends();
  }

  /** Métricas agregadas de uso do Business Intelligence Engine. */
  getMetrics(): BusinessIntelligenceMetricsSnapshot {
    this.metrics.recordQuery();
    return this.metrics.snapshot();
  }
}
