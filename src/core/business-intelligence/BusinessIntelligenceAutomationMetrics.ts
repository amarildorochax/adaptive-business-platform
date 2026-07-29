/** Retrato agregado do uso do BusinessIntelligenceAutomationProvider, produzido sob demanda por `snapshot()`. */
export interface BusinessIntelligenceAutomationMetricsSnapshot {
  recommendationsProcessed: number;
  rulesGenerated: number;
  skippedRecommendations: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do BusinessIntelligenceAutomationProvider (Tarefa
 * 05) — mesmo padrão já usado por CRMMetrics/CampaignMetrics/.../
 * BusinessIntelligenceMetrics (Sprint 19, entidade distinta — esta
 * classe mede apenas a sincronização Recommendation → AutomationRule,
 * não a análise de AnalyticsReport).
 *
 * Dependências: nenhuma.
 */
export class BusinessIntelligenceAutomationMetrics {
  private recommendationsProcessed = 0;

  private rulesGenerated = 0;

  private skippedRecommendations = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra uma Recommendation já avaliada por `sync()`, convertida ou não. */
  recordRecommendationProcessed(): void {
    this.recommendationsProcessed++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma AutomationRule gerada a partir de uma Recommendation. */
  recordRuleGenerated(): void {
    this.rulesGenerated++;
  }

  /** Registra uma Recommendation pulada (já convertida em uma sincronização anterior). */
  recordSkipped(): void {
    this.skippedRecommendations++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): BusinessIntelligenceAutomationMetricsSnapshot {
    return {
      recommendationsProcessed: this.recommendationsProcessed,
      rulesGenerated: this.rulesGenerated,
      skippedRecommendations: this.skippedRecommendations,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.recommendationsProcessed = 0;
    this.rulesGenerated = 0;
    this.skippedRecommendations = 0;
    this.lastUpdatedAt = undefined;
  }
}
