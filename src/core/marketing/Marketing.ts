import { MarketingManager } from "./MarketingManager";
import type { MarketingSegment } from "./CustomerSegmentation";
import type { MarketingRecommendation, MarketingInsightsSummary } from "./MarketingInsights";
import type { MarketingMetricsSnapshot } from "./MarketingMetrics";

/**
 * Fachada pública única do Marketing Intelligence (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * Marketing.analyze() / getInsights() / getSegments() /
 *          getRecommendations() / getMetrics()      ← único ponto de entrada
 *    ↓
 * MarketingManager                     ← coordena, sem regra de campanha própria
 *    ↓
 * CampaignAnalyzer · CustomerSegmentation · AudienceAnalyzer · MarketingInsights
 *    ↓
 * CampaignProvider (Sprint 10B: adapta dados reais do CRM Core — substitui
 *                    MarketingSimulatedData, removido na Sprint 10B;
 *                    Sprint 12: passa também a adaptar campanhas reais
 *                    do Campaign Management, eliminando o retorno [])
 *    ↓              ↓
 *   CRM          Campaign
 * ```
 *
 * Responsabilidade: nenhum consumidor deve importar MarketingManager,
 * os Analyzers ou CampaignProvider diretamente — todos usam
 * exclusivamente esta fachada.
 *
 * `getInsights()` retorna a visão consolidada (contagens agregadas);
 * `getRecommendations()` retorna a lista acionável de recomendações
 * estruturadas — propositalmente distintos (ver MarketingInsights.ts).
 *
 * Dependências: MarketingManager.
 */
export class Marketing {
  private readonly manager = new MarketingManager();

  /** Executa uma análise completa (campanhas, segmentos, audiência, recomendações). */
  analyze(): void {
    this.manager.analyze();
  }

  /** Visão consolidada de insights (contagens agregadas). */
  getInsights(): MarketingInsightsSummary {
    return this.manager.getInsightsSummary();
  }

  /** Segmentos de clientes calculados na última análise. */
  getSegments(): MarketingSegment[] {
    return this.manager.getSegments();
  }

  /** Recomendações estruturadas calculadas na última análise. */
  getRecommendations(): MarketingRecommendation[] {
    return this.manager.getRecommendations();
  }

  /** Métricas de uso do próprio Marketing Intelligence. */
  getMetrics(): MarketingMetricsSnapshot {
    return this.manager.getMetricsSnapshot();
  }
}

/** Instância única e compartilhada do Marketing para toda a plataforma. */
export const marketing = new Marketing();
