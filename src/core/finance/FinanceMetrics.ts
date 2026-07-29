/** Retrato agregado do uso do Finance Intelligence, produzido sob demanda por `FinanceMetrics.snapshot()`. */
export interface FinanceMetricsSnapshot {
  revenues: number;
  expenses: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Finance Intelligence (Tarefa 10) — mesmo padrão já
 * usado por CRMMetrics/CampaignMetrics/MarketingMetrics.
 *
 * `revenues`/`expenses` (totais atuais) são informados pelo chamador em
 * `snapshot()` — mesmo princípio já usado por
 * `CRMMetrics.snapshot(counts)` — para que FinanceMetrics não precise
 * depender de FinanceStore.
 *
 * Dependências: nenhuma.
 */
export class FinanceMetrics {
  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Marca uma mutação (recordRevenue/recordExpense) já concluída. */
  recordMutation(): void {
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta (listRevenue/listExpenses/getCashFlow/getSnapshot/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(counts: { revenues: number; expenses: number }): FinanceMetricsSnapshot {
    return {
      revenues: counts.revenues,
      expenses: counts.expenses,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
