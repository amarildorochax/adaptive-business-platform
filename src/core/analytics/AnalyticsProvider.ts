import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { crm } from "@/core/crm/CRM";
import type { CRMMetricsSnapshot } from "@/core/crm/CRMMetrics";
import { campaign } from "@/core/campaign/Campaign";
import type { CampaignMetricsSnapshot } from "@/core/campaign/CampaignMetrics";
import { marketing } from "@/core/marketing/Marketing";
import type { MarketingMetricsSnapshot } from "@/core/marketing/MarketingMetrics";
import { finance } from "@/core/finance/Finance";
import type { FinanceMetricsSnapshot } from "@/core/finance/FinanceMetrics";
import { automation } from "@/core/automations/Automation";
import type { AutomationMetricsSnapshot } from "@/core/automations/AutomationMetrics";
import { notifications } from "@/core/notifications/Notifications";
import type { NotificationMetricsSnapshot } from "@/core/notifications/NotificationMetrics";
import { analytics } from "./Analytics";
import type { AnalyticsMetricInput } from "./AnalyticsService";
import type { AnalyticsMetric } from "./AnalyticsMetric";

/** Os seis domínios sincronizáveis por `AnalyticsProvider` (Tarefa 03). */
export type AnalyticsDomain = "crm" | "campaign" | "marketing" | "finance" | "automation" | "notifications";

function fromCRM(snapshot: CRMMetricsSnapshot): AnalyticsMetricInput[] {
  return [
    { name: "crm.customers", value: snapshot.customers, source: "crm", metadata: {} },
    { name: "crm.interactions", value: snapshot.interactions, source: "crm", metadata: {} },
    { name: "crm.opportunities", value: snapshot.opportunities, source: "crm", metadata: {} },
    { name: "crm.creates", value: snapshot.creates, source: "crm", metadata: {} },
    { name: "crm.updates", value: snapshot.updates, source: "crm", metadata: {} },
    { name: "crm.queries", value: snapshot.queries, source: "crm", metadata: {} },
  ];
}

function fromCampaign(snapshot: CampaignMetricsSnapshot): AnalyticsMetricInput[] {
  return [
    { name: "campaign.campaigns", value: snapshot.campaigns, source: "campaign", metadata: {} },
    { name: "campaign.activeCampaigns", value: snapshot.activeCampaigns, source: "campaign", metadata: {} },
    { name: "campaign.finishedCampaigns", value: snapshot.finishedCampaigns, source: "campaign", metadata: {} },
    { name: "campaign.executions", value: snapshot.executions, source: "campaign", metadata: {} },
    { name: "campaign.queries", value: snapshot.queries, source: "campaign", metadata: {} },
  ];
}

function fromMarketing(snapshot: MarketingMetricsSnapshot): AnalyticsMetricInput[] {
  return [
    { name: "marketing.analysesPerformed", value: snapshot.analysesPerformed, source: "marketing", metadata: {} },
    {
      name: "marketing.averageAnalysisDurationMs",
      value: snapshot.averageAnalysisDurationMs,
      source: "marketing",
      metadata: {},
    },
    { name: "marketing.segmentsCreated", value: snapshot.segmentsCreated, source: "marketing", metadata: {} },
    { name: "marketing.insightsGenerated", value: snapshot.insightsGenerated, source: "marketing", metadata: {} },
  ];
}

function fromFinance(snapshot: FinanceMetricsSnapshot): AnalyticsMetricInput[] {
  return [
    { name: "finance.revenues", value: snapshot.revenues, source: "finance", metadata: {} },
    { name: "finance.expenses", value: snapshot.expenses, source: "finance", metadata: {} },
    { name: "finance.queries", value: snapshot.queries, source: "finance", metadata: {} },
  ];
}

function fromAutomation(snapshot: AutomationMetricsSnapshot): AnalyticsMetricInput[] {
  return [
    { name: "automation.rules", value: snapshot.rules, source: "automation", metadata: {} },
    { name: "automation.enabledRules", value: snapshot.enabledRules, source: "automation", metadata: {} },
    { name: "automation.disabledRules", value: snapshot.disabledRules, source: "automation", metadata: {} },
    { name: "automation.executions", value: snapshot.executions, source: "automation", metadata: {} },
    { name: "automation.queries", value: snapshot.queries, source: "automation", metadata: {} },
  ];
}

function fromNotifications(snapshot: NotificationMetricsSnapshot): AnalyticsMetricInput[] {
  return [
    { name: "notifications.notifications", value: snapshot.notifications, source: "notifications", metadata: {} },
    { name: "notifications.deliveries", value: snapshot.deliveries, source: "notifications", metadata: {} },
    { name: "notifications.channels", value: snapshot.channels, source: "notifications", metadata: {} },
    { name: "notifications.recipients", value: snapshot.recipients, source: "notifications", metadata: {} },
    { name: "notifications.queries", value: snapshot.queries, source: "notifications", metadata: {} },
  ];
}

/**
 * Implementação real do AnalyticsProvider (Sprint 17, Tarefa 01) — a
 * ponte automática entre Business Analytics e os demais domínios,
 * substituindo a coleta manual da Sprint 16 (`Analytics.
 * collectMetric()` chamado explicitamente, um valor por vez).
 *
 * Consulta exclusivamente as fachadas públicas de cada domínio —
 * `crm.getMetrics()`/`campaign.getMetrics()`/`marketing.getMetrics()`/
 * `finance.getMetrics()`/`automation.getMetrics()`/`notifications.
 * getMetrics()` — nunca `CRMManager`/`CampaignManager`/
 * `MarketingManager`/`FinanceManager`/`AutomationManager`/
 * `NotificationManager`, nunca nenhum Service/Store, e nunca nenhuma
 * entidade interna (Customer/CampaignRecord/RevenueRecord/etc.) — os
 * únicos tipos importados de outros domínios são os seis
 * `*MetricsSnapshot` (o próprio formato de retorno público de
 * `getMetrics()`, não uma "entidade interna").
 *
 * `fromCRM()`/`fromCampaign()`/`fromMarketing()`/`fromFinance()`/
 * `fromAutomation()`/`fromNotifications()` (Tarefa 03/04) convertem
 * cada campo numérico de cada `*MetricsSnapshot` em um
 * `AnalyticsMetricInput` (`name` no formato `"<domínio>.<campo>"`,
 * `source` = nome do domínio) — `lastUpdatedAt` nunca é convertido (não
 * é um valor numérico).
 *
 * `collectDomain()` sincroniza um único domínio, sem gerar snapshot ou
 * relatório (reservado a `collectAll()`, a única "sincronização
 * completa" — Tarefa 05). `collect()` implementa o contrato original
 * definido na Sprint 16 (`Promise<AnalyticsMetric[]>`) como um alias de
 * `collectAll()`.
 *
 * Emite `ANALYTICS_SYNC_STARTED`/`ANALYTICS_SYNC_COMPLETED` diretamente
 * (Tarefa 07) — exceção deliberada e documentada à regra da Sprint 16
 * ("todos os eventos de Analytics são emitidos exclusivamente por
 * AnalyticsManager"): sincronização é um conceito que só
 * AnalyticsProvider conhece; AnalyticsManager nunca participa da
 * orquestração do sync, apenas recebe `collectMetric()` como qualquer
 * outro chamador. `ANALYTICS_METRIC_COLLECTED`/`ANALYTICS_SNAPSHOT_
 * CREATED`/`ANALYTICS_REPORT_CREATED` continuam emitidos por
 * AnalyticsManager, indiretamente, através de `analytics.
 * collectMetric()`/`createSnapshot()`/`createReport()`.
 *
 * Não altera nenhum Store, Manager ou Service de nenhum dos seis
 * domínios — apenas os lê através de suas fachadas públicas já
 * existentes, inalteradas nesta Sprint.
 */
export class AnalyticsProvider {
  /** Sincroniza um único domínio. Nunca gera snapshot/relatório (reservado a `collectAll()`). */
  async collectDomain(domain: AnalyticsDomain): Promise<AnalyticsMetric[]> {
    const inputs = this.mapDomain(domain);

    return inputs.map((input) => analytics.collectMetric(input));
  }

  /**
   * Sincronização completa: coleta os seis domínios, gera uma
   * AnalyticsSnapshot e um AnalyticsReport automaticamente (Tarefas
   * 05/06), e emite ANALYTICS_SYNC_STARTED/ANALYTICS_SYNC_COMPLETED.
   */
  async collectAll(): Promise<AnalyticsMetric[]> {
    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.ANALYTICS_SYNC_STARTED,
      source: "AnalyticsProvider",
      payload: {},
      createdAt: new Date(),
    });

    const domains: AnalyticsDomain[] = ["crm", "campaign", "marketing", "finance", "automation", "notifications"];
    const collected: AnalyticsMetric[] = [];

    for (const domain of domains) {
      const metrics = await this.collectDomain(domain);
      collected.push(...metrics);
    }

    const snapshot = analytics.createSnapshot();
    const report = analytics.createReport({
      title: `Sincronização completa — ${snapshot.generatedAt.toISOString()}`,
      snapshotId: snapshot.id,
      metadata: {},
    });

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.ANALYTICS_SYNC_COMPLETED,
      source: "AnalyticsProvider",
      payload: { metricsCollected: collected.length, snapshotId: snapshot.id, reportId: report?.id },
      createdAt: new Date(),
    });

    return collected;
  }

  /** Contrato original da Sprint 16 (`Promise<AnalyticsMetric[]>`) — alias de `collectAll()`. */
  async collect(): Promise<AnalyticsMetric[]> {
    return this.collectAll();
  }

  private mapDomain(domain: AnalyticsDomain): AnalyticsMetricInput[] {
    switch (domain) {
      case "crm":
        return fromCRM(crm.getMetrics());
      case "campaign":
        return fromCampaign(campaign.getMetrics());
      case "marketing":
        return fromMarketing(marketing.getMetrics());
      case "finance":
        return fromFinance(finance.getMetrics());
      case "automation":
        return fromAutomation(automation.getMetrics());
      case "notifications":
        return fromNotifications(notifications.getMetrics());
    }
  }
}

/** Instância única e compartilhada do AnalyticsProvider para toda a plataforma. */
export const analyticsProvider = new AnalyticsProvider();
