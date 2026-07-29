/** Retrato agregado do uso do Campaign Management, produzido sob demanda por `CampaignMetrics.snapshot()`. */
export interface CampaignMetricsSnapshot {
  campaigns: number;
  activeCampaigns: number;
  finishedCampaigns: number;
  executions: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Campaign Management (Tarefa 10) — mesmo padrão já
 * usado por CRMMetrics/MarketingMetrics/DashboardMetrics.
 *
 * `campaigns`/`activeCampaigns`/`finishedCampaigns` (totais atuais) são
 * informados pelo chamador em `snapshot()` — mesmo princípio já usado
 * por `CRMMetrics.snapshot(counts)` — para que CampaignMetrics não
 * precise depender de CampaignStore. `executions` conta quantas vezes
 * `CampaignManager.startCampaign()` foi bem-sucedido.
 *
 * Dependências: nenhuma.
 */
export class CampaignMetrics {
  private executions = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Marca uma mutação qualquer (create/update/remove/start/finish) já concluída. */
  recordMutation(): void {
    this.lastUpdatedAt = new Date();
  }

  /** Registra um início de campanha (`startCampaign()`) bem-sucedido. */
  recordExecution(): void {
    this.executions++;
    this.recordMutation();
  }

  /** Registra uma consulta (getCampaign/listCampaigns/getMetrics). */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(counts: { campaigns: number; activeCampaigns: number; finishedCampaigns: number }): CampaignMetricsSnapshot {
    return {
      campaigns: counts.campaigns,
      activeCampaigns: counts.activeCampaigns,
      finishedCampaigns: counts.finishedCampaigns,
      executions: this.executions,
      queries: this.queries,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.executions = 0;
    this.queries = 0;
    this.lastUpdatedAt = undefined;
  }
}
