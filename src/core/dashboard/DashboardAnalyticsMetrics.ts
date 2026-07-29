/** Retrato agregado do uso do DashboardAnalyticsProvider, produzido sob demanda por `DashboardAnalyticsMetrics.snapshot()`. */
export interface DashboardAnalyticsMetricsSnapshot {
  refreshes: number;
  reportsLoaded: number;
  snapshotsLoaded: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do DashboardAnalyticsProvider (Tarefa 06) — mesmo
 * padrão já usado por CRMMetrics/CampaignMetrics/.../AnalyticsMetrics.
 *
 * Nota de nomenclatura: a Tarefa 06 pede "Criar DashboardMetrics", mas
 * esse nome já existe desde a Sprint 8 (`DashboardMetrics.ts`, mede o
 * uso da fachada `Dashboard` como um todo — `refreshes`/
 * `averageRefreshDurationMs`/`widgetsLoaded`/`queries`/`lastUpdatedAt`,
 * ativamente usado por `DashboardManager.ts`, intocado nesta Sprint).
 * Os campos pedidos aqui (`refreshes`/`reportsLoaded`/`snapshotsLoaded`/
 * `queries`/`lastUpdatedAt`) são conceitualmente distintos — medem
 * apenas o `DashboardAnalyticsProvider`, não o Dashboard inteiro.
 * Resolvido com o nome `DashboardAnalyticsMetrics`, mesma convenção já
 * usada para a colisão `Campaign`/`CampaignRecord` (Sprint 11).
 *
 * `reportsLoaded`/`snapshotsLoaded` são cumulativos — cada chamada bem-
 * sucedida a `loadReports()`/`loadSnapshot()` soma ao total.
 *
 * Dependências: nenhuma.
 */
export class DashboardAnalyticsMetrics {
  private refreshes = 0;

  private reportsLoaded = 0;

  private snapshotsLoaded = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra um `refresh()` já concluído. */
  recordRefresh(): void {
    this.refreshes++;
    this.lastUpdatedAt = new Date();
  }

  /** Soma `count` reports carregados por uma chamada a `loadReports()`. */
  recordReportsLoaded(count: number): void {
    this.reportsLoaded += count;
  }

  /** Registra um snapshot carregado com sucesso por `loadSnapshot()`. */
  recordSnapshotLoaded(): void {
    this.snapshotsLoaded++;
  }

  /** Registra uma consulta (getSnapshotView/getReports/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): DashboardAnalyticsMetricsSnapshot {
    return {
      refreshes: this.refreshes,
      reportsLoaded: this.reportsLoaded,
      snapshotsLoaded: this.snapshotsLoaded,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.refreshes = 0;
    this.reportsLoaded = 0;
    this.snapshotsLoaded = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
