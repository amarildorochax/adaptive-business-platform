import { analytics } from "@/core/analytics/Analytics";
import type { AnalyticsSnapshot } from "@/core/analytics/AnalyticsSnapshot";
import type { AnalyticsMetric } from "@/core/analytics/AnalyticsMetric";
import type { Insight, InsightSeverity } from "./Insight";
import type { Recommendation } from "./Recommendation";
import type { Trend, TrendDirection } from "./Trend";
import { BusinessIntelligenceStore } from "./BusinessIntelligenceStore";

/** Resultado de uma análise bem-sucedida — o que `analyzeReport()` produziu. */
export interface AnalysisResult {
  insights: Insight[];
  recommendations: Recommendation[];
  trends: Trend[];
}

/**
 * Interpreta AnalyticsReport, identifica tendências, detecta anomalias
 * simples e gera recomendações estruturadas (Tarefa 03).
 *
 * Consulta exclusivamente `analytics.listReports()`/`analytics.
 * getSnapshot()` — nunca `AnalyticsManager`/`AnalyticsService`/
 * `AnalyticsStore`. `Analytics` não expõe "buscar report por id"
 * diretamente (apenas `listReports()`, sem filtro) — resolvido
 * filtrando a lista já pública por `id`, sem adicionar nenhum método a
 * `Analytics` (proibido pela Tarefa 09).
 *
 * **Detecção de tendência (Tarefa 06)**: para cada `AnalyticsMetric.name`
 * que aparece mais de uma vez dentro da mesma AnalyticsSnapshot,
 * compara a primeira e a última ocorrência (por `collectedAt`) — a
 * diferença relativa define `direction`/`confidence`. Determinístico,
 * sem estatística avançada, sem ML.
 *
 * **Detecção de anomalia simples (Tarefa "detectar anomalias
 * simples")**: cada Trend com `direction !== "stable"` gera um Insight
 * — a "anomalia" é a própria mudança de valor detectada; `severity` é
 * derivada de `confidence` (ver `classifySeverity()`). Nenhuma IA,
 * nenhuma previsão.
 *
 * **Recomendação (Tarefa "gerar recomendações estruturadas")**: todo
 * Insight com `severity !== "low"` gera uma Recommendation associada
 * (`insightId`), com texto determinístico — nunca gerado por IA.
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * BusinessIntelligenceManager.
 *
 * Dependências: BusinessIntelligenceStore (própria instância).
 *
 * Consumido exclusivamente por BusinessIntelligenceManager.
 */
export class BusinessIntelligenceService {
  private readonly store = new BusinessIntelligenceStore();

  /**
   * Interpreta o AnalyticsReport de `reportId` — detecta tendências,
   * gera insights e recomendações. Retorna `undefined` se o report (ou
   * a snapshot que ele referencia) não existir.
   */
  analyzeReport(reportId: string): AnalysisResult | undefined {
    const report = analytics.listReports().find((candidate) => candidate.id === reportId);

    if (!report) {
      return undefined;
    }

    const snapshot = analytics.getSnapshot(report.snapshotId);

    if (!snapshot) {
      return undefined;
    }

    const trends = this.detectTrends(snapshot).map((trendInput) => this.createTrend(trendInput));
    const insights: Insight[] = [];
    const recommendations: Recommendation[] = [];

    for (const trend of trends) {
      if (trend.direction === "stable") {
        continue;
      }

      const severity = this.classifySeverity(trend.confidence);
      const insight = this.createInsight({
        title: `Tendência detectada: ${trend.metricName}`,
        description: `O indicador "${trend.metricName}" está em ${trend.direction === "up" ? "alta" : "baixa"} (confiança: ${(trend.confidence * 100).toFixed(0)}%).`,
        severity,
        metadata: { reportId, snapshotId: snapshot.id, trendId: trend.id },
      });
      insights.push(insight);

      if (severity !== "low") {
        recommendations.push(
          this.createRecommendation({
            insightId: insight.id,
            title: `Investigar ${trend.metricName}`,
            description: `Revisar a causa da tendência em "${trend.metricName}" antes que se agrave.`,
            priority: severity === "high" ? "high" : "medium",
          }),
        );
      }
    }

    return { insights, recommendations, trends };
  }

  /** Retorna todos os Insight já gerados. */
  listInsights(): Insight[] {
    return this.store.getAllInsights();
  }

  /** Retorna todas as Recommendation já geradas. */
  listRecommendations(): Recommendation[] {
    return this.store.getAllRecommendations();
  }

  /** Retorna todos os Trend já detectados. */
  listTrends(): Trend[] {
    return this.store.getAllTrends();
  }

  private detectTrends(snapshot: AnalyticsSnapshot): Array<Pick<Trend, "metricName" | "direction" | "confidence">> {
    const byName = new Map<string, AnalyticsMetric[]>();

    for (const metric of snapshot.metrics) {
      const existing = byName.get(metric.name) ?? [];
      existing.push(metric);
      byName.set(metric.name, existing);
    }

    const detected: Array<Pick<Trend, "metricName" | "direction" | "confidence">> = [];

    for (const [metricName, metrics] of byName) {
      if (metrics.length < 2) {
        continue;
      }

      const sorted = [...metrics].sort((a, b) => a.collectedAt.getTime() - b.collectedAt.getTime());
      const first = sorted[0].value;
      const last = sorted[sorted.length - 1].value;
      const delta = last - first;

      const direction: TrendDirection = delta > 0 ? "up" : delta < 0 ? "down" : "stable";
      const confidence = Math.min(1, Math.abs(delta) / (Math.abs(first) || 1));

      detected.push({ metricName, direction, confidence });
    }

    return detected;
  }

  private classifySeverity(confidence: number): InsightSeverity {
    if (confidence >= 0.5) return "high";
    if (confidence >= 0.2) return "medium";
    return "low";
  }

  private createInsight(input: Pick<Insight, "title" | "description" | "severity" | "metadata">): Insight {
    const insight: Insight = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      severity: input.severity,
      metadata: input.metadata,
      createdAt: new Date(),
    };

    this.store.addInsight(insight);

    return insight;
  }

  private createRecommendation(
    input: Pick<Recommendation, "insightId" | "title" | "description" | "priority">,
  ): Recommendation {
    const recommendation: Recommendation = {
      id: crypto.randomUUID(),
      insightId: input.insightId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      createdAt: new Date(),
    };

    this.store.addRecommendation(recommendation);

    return recommendation;
  }

  private createTrend(input: Pick<Trend, "metricName" | "direction" | "confidence">): Trend {
    const trend: Trend = {
      id: crypto.randomUUID(),
      metricName: input.metricName,
      direction: input.direction,
      confidence: input.confidence,
      detectedAt: new Date(),
    };

    this.store.addTrend(trend);

    return trend;
  }
}
