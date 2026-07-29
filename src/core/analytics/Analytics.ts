import type { AnalyticsMetric } from "./AnalyticsMetric";
import type { AnalyticsSnapshot } from "./AnalyticsSnapshot";
import type { AnalyticsReport } from "./AnalyticsReport";
import { AnalyticsManager } from "./AnalyticsManager";
import type { AnalyticsMetricInput, AnalyticsReportInput } from "./AnalyticsService";
import type { AnalyticsMetricsSnapshot } from "./AnalyticsMetrics";

/**
 * Fachada pública única do Business Analytics (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * Analytics.collectMetric/createSnapshot/createReport/listReports/
 *           getSnapshot/getMetrics                     ← única fachada
 *    ↓
 * AnalyticsManager   ← coordena; nunca acessa outro módulo diretamente
 *    ↓
 * AnalyticsService     ← coleta, agregação, snapshots, relatórios
 *    ↓
 * AnalyticsStore
 *    ↓
 * AnalyticsMetric · AnalyticsSnapshot · AnalyticsReport
 * ```
 *
 * Consolida indicadores, agrega métricas entre domínios e produz
 * snapshots/relatórios analíticos — nunca dashboards, gráficos, IA,
 * previsões, persistência ou integrações externas (fora do escopo
 * desta Sprint).
 *
 * Esta fachada, em si, nunca leu nem lê nenhum outro domínio
 * diretamente — nem mesmo via fachada pública (Sprint 16). Uma
 * AnalyticsMetric só chega até `Analytics` via `collectMetric()`,
 * chamado por quem já tem o valor em mãos. Desde a Sprint 17
 * (Analytics Integration), quem chama `collectMetric()` para os seis
 * domínios existentes de forma automática é `AnalyticsProvider.ts`
 * (mesmo diretório `@/core/analytics/`, ver nota lá) — que consulta
 * `crm.getMetrics()`/`campaign.getMetrics()`/`marketing.getMetrics()`/
 * `finance.getMetrics()`/`automation.getMetrics()`/`notifications.
 * getMetrics()`, sempre por fachada pública, nunca por Store interno.
 * Esta classe (`Analytics`) continua sem nenhum import de outro
 * domínio — apenas `AnalyticsProvider.ts` os importa.
 *
 * Responsabilidade: nenhum consumidor deve importar AnalyticsManager,
 * AnalyticsService ou AnalyticsStore diretamente — todos usam
 * exclusivamente esta fachada.
 *
 * Dependências: AnalyticsManager.
 */
export class Analytics {
  private readonly manager = new AnalyticsManager();

  /** Registra uma nova AnalyticsMetric já coletada por quem chama. */
  collectMetric(input: AnalyticsMetricInput): AnalyticsMetric {
    return this.manager.collectMetric(input);
  }

  /** Cria uma nova AnalyticsSnapshot consolidando todas as AnalyticsMetric já coletadas. */
  createSnapshot(): AnalyticsSnapshot {
    return this.manager.createSnapshot();
  }

  /** Cria um novo AnalyticsReport a partir de uma AnalyticsSnapshot já existente. */
  createReport(input: AnalyticsReportInput): AnalyticsReport | undefined {
    return this.manager.createReport(input);
  }

  /** Retorna todos os AnalyticsReport já criados. */
  listReports(): AnalyticsReport[] {
    return this.manager.listReports();
  }

  /** Recupera uma AnalyticsSnapshot por `id`, ou `undefined` se não existir. */
  getSnapshot(id: string): AnalyticsSnapshot | undefined {
    return this.manager.getSnapshot(id);
  }

  /** Métricas agregadas de uso do próprio Business Analytics. */
  getMetrics(): AnalyticsMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do Analytics para toda a plataforma. */
export const analytics = new Analytics();
