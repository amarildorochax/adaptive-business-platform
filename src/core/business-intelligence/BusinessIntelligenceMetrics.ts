/** Retrato agregado do uso do Business Intelligence Engine, produzido sob demanda por `BusinessIntelligenceMetrics.snapshot()`. */
export interface BusinessIntelligenceMetricsSnapshot {
  analysesPerformed: number;
  insightsGenerated: number;
  recommendationsGenerated: number;
  trendsDetected: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Business Intelligence Engine — mesmo padrão já
 * usado por CRMMetrics/CampaignMetrics/.../AnalyticsMetrics. Não
 * pedida por um número de Tarefa explícito nesta Sprint, mas necessária
 * para sustentar `BusinessIntelligence.getMetrics()` (Tarefa 02) —
 * mesmo princípio de toda Sprint anterior desta série.
 *
 * Dependências: nenhuma.
 */
export class BusinessIntelligenceMetrics {
  private analysesPerformed = 0;

  private insightsGenerated = 0;

  private recommendationsGenerated = 0;

  private trendsDetected = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra uma execução completa de `analyzeReport()` bem-sucedida. */
  recordAnalysis(insights: number, recommendations: number, trends: number): void {
    this.analysesPerformed++;
    this.insightsGenerated += insights;
    this.recommendationsGenerated += recommendations;
    this.trendsDetected += trends;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta (listInsights/listRecommendations/listTrends/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): BusinessIntelligenceMetricsSnapshot {
    return {
      analysesPerformed: this.analysesPerformed,
      insightsGenerated: this.insightsGenerated,
      recommendationsGenerated: this.recommendationsGenerated,
      trendsDetected: this.trendsDetected,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.analysesPerformed = 0;
    this.insightsGenerated = 0;
    this.recommendationsGenerated = 0;
    this.trendsDetected = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
