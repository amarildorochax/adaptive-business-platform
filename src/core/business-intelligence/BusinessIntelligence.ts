import type { Insight } from "./Insight";
import type { Recommendation } from "./Recommendation";
import type { Trend } from "./Trend";
import { BusinessIntelligenceManager } from "./BusinessIntelligenceManager";
import type { BusinessIntelligenceMetricsSnapshot } from "./BusinessIntelligenceMetrics";

/**
 * Fachada pública única do Business Intelligence Engine (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * BusinessIntelligence.analyzeReport/listInsights/listRecommendations/
 *                      getMetrics                          ← única fachada
 *                      (+ listTrends, além do mínimo — ver nota abaixo)
 *    ↓
 * BusinessIntelligenceManager   ← coordena; emite eventos; registra métricas
 *    ↓
 * BusinessIntelligenceService     ← interpreta, detecta tendências, gera insights/recomendações
 *    ↓
 * BusinessIntelligenceStore
 *    ↓
 * Insight · Recommendation · Trend
 * ```
 *
 * Interpreta AnalyticsReport, identifica tendências, detecta anomalias
 * simples (mudanças de valor entre ocorrências do mesmo indicador numa
 * mesma AnalyticsSnapshot) e gera recomendações estruturadas — nunca
 * IA generativa, previsões estatísticas avançadas, Machine Learning ou
 * integrações externas (fora do escopo desta Sprint; ver
 * ForecastProvider/MLProvider/AIInsightProvider, contratos futuros).
 *
 * `listTrends()` foi adicionado além do mínimo pedido pela Tarefa 02 —
 * sem ele, `Trend` (entidade exigida pela Tarefa 06 e pelos Critérios
 * de Aceite) não teria nenhum caminho de leitura pública. Mesmo
 * princípio já usado em Sprints anteriores desta série (ex.:
 * `CRM.updateOpportunity()`, Sprint 10A).
 *
 * Este módulo não acessa CRM, Campaign, Marketing, Finance, Automation
 * ou Notifications — consome exclusivamente `analytics.listReports()`/
 * `analytics.getSnapshot()` (Tarefa 03), nunca `AnalyticsStore`. Nem
 * Analytics nem Dashboard foram alterados nesta Sprint (Tarefa 09).
 *
 * Responsabilidade: nenhum consumidor deve importar
 * BusinessIntelligenceManager, BusinessIntelligenceService ou
 * BusinessIntelligenceStore diretamente — todos usam exclusivamente
 * esta fachada.
 *
 * Dependências: BusinessIntelligenceManager.
 */
export class BusinessIntelligence {
  private readonly manager = new BusinessIntelligenceManager();

  /** Interpreta o AnalyticsReport de `reportId`. Retorna `undefined` se ele (ou sua snapshot) não existir. */
  analyzeReport(reportId: string): Insight[] | undefined {
    return this.manager.analyzeReport(reportId);
  }

  /** Retorna todos os Insight já gerados. */
  listInsights(): Insight[] {
    return this.manager.listInsights();
  }

  /** Retorna todas as Recommendation já geradas. */
  listRecommendations(): Recommendation[] {
    return this.manager.listRecommendations();
  }

  /** Retorna todos os Trend já detectados. */
  listTrends(): Trend[] {
    return this.manager.listTrends();
  }

  /** Métricas agregadas de uso do Business Intelligence Engine. */
  getMetrics(): BusinessIntelligenceMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do BusinessIntelligence para toda a plataforma. */
export const businessIntelligence = new BusinessIntelligence();
