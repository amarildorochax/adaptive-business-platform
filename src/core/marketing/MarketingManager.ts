import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import { campaignProvider } from "./CampaignProvider";
import { CampaignAnalyzer, type CampaignAnalysis } from "./CampaignAnalyzer";
import { CustomerSegmentation, type MarketingSegment } from "./CustomerSegmentation";
import { AudienceAnalyzer, type AudienceBreakdown } from "./AudienceAnalyzer";
import { MarketingInsights, type MarketingRecommendation, type MarketingInsightsSummary } from "./MarketingInsights";
import { MarketingMetrics, type MarketingMetricsSnapshot } from "./MarketingMetrics";

/**
 * Coordena todas as análises de Marketing Intelligence (Tarefa 03) —
 * busca o dataset via CampaignProvider (Sprint 10B: consulta o CRM Core
 * real, substituindo `MarketingSimulatedData.ts`, removido nesta
 * Sprint), aciona CampaignAnalyzer/CustomerSegmentation/
 * AudienceAnalyzer/MarketingInsights nesta ordem — nenhum deles
 * alterado —, armazena os últimos resultados em cache, registra
 * MarketingMetrics e emite os eventos de ciclo de vida
 * (MARKETING_ANALYSIS_STARTED/COMPLETED/SEGMENT_CREATED/
 * INSIGHT_GENERATED, e MARKETING_PROVIDER_CONNECTED uma única vez, na
 * primeira análise).
 *
 * Nunca contém regra específica de campanha/segmentação/audiência —
 * essas decisões pertencem exclusivamente a cada Analyzer; este
 * componente apenas orquestra a ordem das chamadas e a agregação dos
 * resultados. Também nunca conhece o formato do CRM — apenas chama
 * `campaignProvider.listCustomers()`/`listCampaigns()`, que já devolvem
 * dados no formato `MarketingCustomerRecord`/`MarketingCampaignRecord`
 * que os Analyzers sempre esperaram.
 *
 * Consumido exclusivamente por Marketing (fachada).
 */
export class MarketingManager {
  private readonly campaignAnalyzer = new CampaignAnalyzer();

  private readonly segmentation = new CustomerSegmentation();

  private readonly audienceAnalyzer = new AudienceAnalyzer();

  private readonly insights = new MarketingInsights();

  private readonly metrics = new MarketingMetrics();

  private providerConnected = false;

  private lastCampaigns: CampaignAnalysis[] = [];

  private lastSegments: MarketingSegment[] = [];

  private lastAudience: AudienceBreakdown | undefined;

  private lastRecommendations: MarketingRecommendation[] = [];

  private lastSummary: MarketingInsightsSummary | undefined;

  /** Executa uma análise completa: campanhas → segmentos → audiência → recomendações/insights. */
  analyze(): void {
    const startedAt = Date.now();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.MARKETING_ANALYSIS_STARTED,
      source: "MarketingManager",
      payload: {},
      createdAt: new Date(),
    });

    if (!this.providerConnected) {
      this.providerConnected = true;

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.MARKETING_PROVIDER_CONNECTED,
        source: "MarketingManager",
        payload: { provider: "CampaignProvider" },
        createdAt: new Date(),
      });
    }

    const customers = campaignProvider.listCustomers();
    const campaignRecords = campaignProvider.listCampaigns();

    this.lastCampaigns = this.campaignAnalyzer.analyze(campaignRecords);

    this.lastSegments = this.segmentation.segment(customers);
    for (const segment of this.lastSegments) {
      this.metrics.recordSegment();
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.MARKETING_SEGMENT_CREATED,
        source: "MarketingManager",
        payload: { segmentId: segment.id, size: segment.customerIds.length },
        createdAt: new Date(),
      });
    }

    this.lastAudience = this.audienceAnalyzer.analyze(customers);

    this.lastRecommendations = this.insights.generate(this.lastSegments, this.lastAudience, customers);
    for (const recommendation of this.lastRecommendations) {
      this.metrics.recordInsight();
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.MARKETING_INSIGHT_GENERATED,
        source: "MarketingManager",
        payload: { recommendationId: recommendation.id, type: recommendation.type },
        createdAt: new Date(),
      });
    }

    this.lastSummary = this.insights.summarize(this.lastSegments, this.lastAudience, this.lastCampaigns, customers);

    this.metrics.recordAnalysis(Date.now() - startedAt);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.MARKETING_ANALYSIS_COMPLETED,
      source: "MarketingManager",
      payload: {
        segments: this.lastSegments.length,
        recommendations: this.lastRecommendations.length,
      },
      createdAt: new Date(),
    });
  }

  /** Garante que ao menos uma análise já foi executada antes de expor resultados. */
  private ensureAnalyzed(): void {
    if (this.lastAudience === undefined || this.lastSummary === undefined) {
      this.analyze();
    }
  }

  /** Visão consolidada de insights (contagens, não listas de ids). */
  getInsightsSummary(): MarketingInsightsSummary {
    this.ensureAnalyzed();

    if (this.lastSummary === undefined) {
      throw new Error("MarketingManager: falha ao calcular MarketingInsightsSummary.");
    }

    return this.lastSummary;
  }

  /** Segmentos calculados na última análise. */
  getSegments(): MarketingSegment[] {
    this.ensureAnalyzed();
    return this.lastSegments;
  }

  /** Recomendações estruturadas calculadas na última análise. */
  getRecommendations(): MarketingRecommendation[] {
    this.ensureAnalyzed();
    return this.lastRecommendations;
  }

  /** Métricas agregadas de uso do próprio Marketing Intelligence. */
  getMetricsSnapshot(): MarketingMetricsSnapshot {
    return this.metrics.snapshot();
  }
}
