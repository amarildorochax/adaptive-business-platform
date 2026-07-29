/** Retrato agregado do uso do Notification Hub, produzido sob demanda por `NotificationMetrics.snapshot()`. */
export interface NotificationMetricsSnapshot {
  notifications: number;
  deliveries: number;
  channels: number;
  recipients: number;
  queries: number;
  lastUpdatedAt?: Date;
}

/**
 * Métricas de uso do Notification Hub (Tarefa 10) — mesmo padrão já
 * usado por CRMMetrics/CampaignMetrics/FinanceMetrics/
 * AutomationMetrics.
 *
 * `notifications`/`deliveries`/`channels`/`recipients` (totais atuais)
 * são informados pelo chamador em `snapshot()` — mesmo princípio já
 * usado por `CRMMetrics.snapshot(counts)` — para que
 * NotificationMetrics não precise depender de NotificationStore.
 *
 * Dependências: nenhuma.
 */
export class NotificationMetrics {
  private queries = 0;

  private lastUpdatedAt: Date | undefined;

  /** Marca uma mutação qualquer (create/registerDelivery/updateDeliveryStatus) já concluída. */
  recordMutation(): void {
    this.lastUpdatedAt = new Date();
  }

  /** Registra uma consulta. */
  recordQuery(): void {
    this.queries++;
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(counts: {
    notifications: number;
    deliveries: number;
    channels: number;
    recipients: number;
  }): NotificationMetricsSnapshot {
    return {
      notifications: counts.notifications,
      deliveries: counts.deliveries,
      channels: counts.channels,
      recipients: counts.recipients,
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
