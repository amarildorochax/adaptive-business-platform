/** Retrato agregado do uso do Marketing Intelligence, produzido sob demanda por `MarketingMetrics.snapshot()`. */
export interface MarketingMetricsSnapshot {
  analysesPerformed: number;
  averageAnalysisDurationMs: number;
  segmentsCreated: number;
  insightsGenerated: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Marketing Intelligence (Tarefa 08) — mesmo padrão
 * já usado por AIMetrics/MemoryMetrics/.../DashboardMetrics. Mede o
 * módulo Marketing **em si** (quantas análises, quanto tempo, quantos
 * segmentos/insights produzidos) — nunca os subsistemas que ele
 * consulta.
 *
 * Dependências: nenhuma.
 */
export class MarketingMetrics {
  private analysisDurationsMs: number[] = [];

  private segmentsCreated = 0;

  private insightsGenerated = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra uma execução completa de `MarketingManager.analyze()` já concluída. */
  recordAnalysis(durationMs: number): void {
    this.analysisDurationsMs.push(durationMs);
    this.lastUpdatedAt = new Date();
  }

  /** Registra um segmento criado por CustomerSegmentation. */
  recordSegment(): void {
    this.segmentsCreated++;
  }

  /** Registra uma recomendação gerada por MarketingInsights. */
  recordInsight(): void {
    this.insightsGenerated++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): MarketingMetricsSnapshot {
    const analysesPerformed = this.analysisDurationsMs.length;

    const averageAnalysisDurationMs =
      analysesPerformed === 0
        ? 0
        : this.analysisDurationsMs.reduce((sum, ms) => sum + ms, 0) / analysesPerformed;

    return {
      analysesPerformed,
      averageAnalysisDurationMs,
      segmentsCreated: this.segmentsCreated,
      insightsGenerated: this.insightsGenerated,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.analysisDurationsMs = [];
    this.segmentsCreated = 0;
    this.insightsGenerated = 0;
    this.lastUpdatedAt = undefined;
  }
}
