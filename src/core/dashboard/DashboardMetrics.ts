/** Retrato agregado do uso do próprio Dashboard, produzido sob demanda por `DashboardMetrics.snapshot()`. */
export interface DashboardMetricsSnapshot {
  refreshes: number;
  averageRefreshDurationMs: number;
  widgetsLoaded: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do próprio Dashboard (Tarefa 07) — mesmo padrão já
 * usado por AIMetrics/MemoryMetrics/PromptMetrics/OrchestratorMetrics/
 * WorkflowMetrics/AgentCatalogMetrics/KnowledgeMetrics. Diferente de
 * todos os anteriores, mede o Dashboard **em si** — nunca os
 * subsistemas que ele consulta (cada um já mede a si próprio; ver os
 * sete widgets).
 *
 * Dependências: nenhuma.
 */
export class DashboardMetrics {
  private refreshDurationsMs: number[] = [];

  private widgetsLoaded = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra um `refresh()` já concluído — duração e quantidade de widgets carregados. */
  recordRefresh(durationMs: number, widgetsLoaded: number): void {
    this.refreshDurationsMs.push(durationMs);
    this.widgetsLoaded = widgetsLoaded;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta ao Dashboard (`getOverview()`/`getWidgets()`/`getMetrics()`). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): DashboardMetricsSnapshot {
    const refreshes = this.refreshDurationsMs.length;

    const averageRefreshDurationMs =
      refreshes === 0
        ? 0
        : this.refreshDurationsMs.reduce((sum, ms) => sum + ms, 0) / refreshes;

    return {
      refreshes,
      averageRefreshDurationMs,
      widgetsLoaded: this.widgetsLoaded,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.refreshDurationsMs = [];
    this.widgetsLoaded = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
