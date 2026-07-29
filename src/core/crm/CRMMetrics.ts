/** Retrato agregado do uso do CRM, produzido sob demanda por `CRMMetrics.snapshot()`. */
export interface CRMMetricsSnapshot {
  customers: number;
  interactions: number;
  opportunities: number;
  creates: number;
  updates: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do CRM (Tarefa 13) — mesmo padrão já usado por
 * KnowledgeMetrics/DashboardMetrics/MarketingMetrics.
 *
 * `customers`/`interactions`/`opportunities` (totais atuais) são
 * informados pelo chamador em `snapshot()` — mesmo princípio já usado
 * por `KnowledgeMetrics.snapshot(documents)` — para que CRMMetrics não
 * precise depender de CustomerStore/InteractionStore/OpportunityStore.
 *
 * Dependências: nenhuma.
 */
export class CRMMetrics {
  private creates = 0;

  private updates = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Registra uma criação (Customer, Interaction ou Opportunity). */
  recordCreate(): void {
    this.creates++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma atualização (Customer ou Opportunity). */
  recordUpdate(): void {
    this.updates++;
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta (get/list, de qualquer entidade). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(counts: { customers: number; interactions: number; opportunities: number }): CRMMetricsSnapshot {
    return {
      customers: counts.customers,
      interactions: counts.interactions,
      opportunities: counts.opportunities,
      creates: this.creates,
      updates: this.updates,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.creates = 0;
    this.updates = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
