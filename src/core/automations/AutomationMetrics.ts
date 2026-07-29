/** Retrato agregado do uso do Automation Center, produzido sob demanda por `AutomationMetrics.snapshot()`. */
export interface AutomationMetricsSnapshot {
  rules: number;
  enabledRules: number;
  disabledRules: number;
  executions: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Automation Center (Tarefa 10) — mesmo padrão já
 * usado por CRMMetrics/CampaignMetrics/FinanceMetrics.
 *
 * `rules`/`enabledRules`/`disabledRules` (totais atuais) são informados
 * pelo chamador em `snapshot()` — mesmo princípio já usado por
 * `CRMMetrics.snapshot(counts)` — para que AutomationMetrics não
 * precise depender de AutomationStore. `executions` conta quantas vezes
 * `AutomationManager.executeRule()` produziu uma AutomationExecution
 * (`"completed"` ou `"skipped"`, ambos contam).
 *
 * Dependências: nenhuma.
 */
export class AutomationMetrics {
  private executions = 0;

  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Marca uma mutação qualquer (create/update/remove/enable/disable) já concluída. */
  recordMutation(): void {
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma execução (`executeRule()`) já concluída. */
  recordExecution(): void {
    this.executions++;
    this.recordMutation();
  }

  /** Registra uma consulta. */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(counts: { rules: number; enabledRules: number; disabledRules: number }): AutomationMetricsSnapshot {
    return {
      rules: counts.rules,
      enabledRules: counts.enabledRules,
      disabledRules: counts.disabledRules,
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
