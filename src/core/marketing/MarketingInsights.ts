import type { MarketingSegment } from "./CustomerSegmentation";
import type { AudienceBreakdown } from "./AudienceAnalyzer";
import type { CampaignAnalysis } from "./CampaignAnalyzer";
import type { MarketingCustomerRecord } from "./CampaignProvider";

/** Tipo de recomendação estruturada gerada por `MarketingInsights.generate()` (Tarefa 07). */
export type MarketingRecommendationType =
  | "follow_up"
  | "no_recent_contact"
  | "open_opportunity"
  | "priority_segment";

/** Prioridade sugerida para a recomendação. */
export type MarketingRecommendationPriority = "high" | "medium" | "low";

/**
 * Recomendação estruturada (nunca texto livre/gerado por IA — Tarefa 07
 * exige explicitamente "não gerar texto por IA nesta Sprint").
 */
export interface MarketingRecommendation {
  id: string;
  type: MarketingRecommendationType;
  customerId?: string;
  segmentId?: string;
  reason: string;
  priority: MarketingRecommendationPriority;
}

/** Contagem por categoria de audiência — usada em `MarketingInsightsSummary`, nunca a lista bruta de ids. */
export interface AudienceCounts {
  active: number;
  inactive: number;
  recurring: number;
  new: number;
  atRisk: number;
}

/** Visão consolidada retornada por `Marketing.getInsights()` — distinta de `getRecommendations()`, que retorna a lista acionável (Tarefa 02). */
export interface MarketingInsightsSummary {
  totalCustomers: number;
  totalSegments: number;
  totalCampaignsAnalyzed: number;
  averageConversionRate: number;
  audienceBreakdown: AudienceCounts;
  topSegmentId?: string;
  generatedAt: Date;
}

/**
 * Gera recomendações estruturadas e a visão consolidada de insights
 * (Tarefa 07): clientes que merecem follow-up, clientes sem contato
 * recente, oportunidades abertas, segmentos prioritários.
 *
 * Consome exclusivamente os resultados já calculados por
 * CustomerSegmentation/AudienceAnalyzer/CampaignAnalyzer (recebidos por
 * parâmetro) mais o `MarketingCustomerRecord[]` bruto — necessário
 * apenas para identificar leads ("oportunidades abertas"), categoria não
 * coberta por AudienceBreakdown (Tarefa 06 não inclui "lead" como
 * classificação de audiência).
 *
 * Stateless — nenhum campo próprio, nenhuma dependência de EventBus ou
 * métricas (isso é responsabilidade de MarketingManager).
 */
export class MarketingInsights {
  /** Gera a lista de recomendações estruturadas — não depende de CampaignAnalysis (nenhuma das quatro categorias desta Sprint deriva de campanhas). */
  generate(
    segments: MarketingSegment[],
    audience: AudienceBreakdown,
    customers: MarketingCustomerRecord[],
  ): MarketingRecommendation[] {
    const recommendations: MarketingRecommendation[] = [];

    for (const customerId of audience.atRisk) {
      recommendations.push({
        id: `rec-follow-up-${customerId}`,
        type: "follow_up",
        customerId,
        reason: "Cliente ativo sem atividade há mais de 60 dias.",
        priority: "high",
      });
    }

    for (const customerId of audience.inactive) {
      recommendations.push({
        id: `rec-no-contact-${customerId}`,
        type: "no_recent_contact",
        customerId,
        reason: "Cliente sem status ativo — nenhum contato recente registrado.",
        priority: "medium",
      });
    }

    for (const customer of customers.filter((c) => c.status === "lead")) {
      recommendations.push({
        id: `rec-opportunity-${customer.id}`,
        type: "open_opportunity",
        customerId: customer.id,
        reason: "Lead ainda não convertido — oportunidade em aberto.",
        priority: "high",
      });
    }

    for (const segment of segments.filter((s) => s.id === "high-value" || s.id === "frequent")) {
      if (segment.customerIds.length === 0) continue;

      recommendations.push({
        id: `rec-priority-segment-${segment.id}`,
        type: "priority_segment",
        segmentId: segment.id,
        reason: `Segmento "${segment.label}" concentra ${segment.customerIds.length} cliente(s) de alta prioridade comercial.`,
        priority: "medium",
      });
    }

    return recommendations;
  }

  /** Monta a visão consolidada (contagens, não listas de ids) exposta por `Marketing.getInsights()`. */
  summarize(
    segments: MarketingSegment[],
    audience: AudienceBreakdown,
    campaigns: CampaignAnalysis[],
    customers: MarketingCustomerRecord[],
  ): MarketingInsightsSummary {
    const averageConversionRate =
      campaigns.length === 0
        ? 0
        : campaigns.reduce((sum, campaign) => sum + campaign.conversionRate, 0) / campaigns.length;

    const topSegment = [...segments].sort((a, b) => b.customerIds.length - a.customerIds.length)[0];

    return {
      totalCustomers: customers.length,
      totalSegments: segments.length,
      totalCampaignsAnalyzed: campaigns.length,
      averageConversionRate,
      audienceBreakdown: {
        active: audience.active.length,
        inactive: audience.inactive.length,
        recurring: audience.recurring.length,
        new: audience.new.length,
        atRisk: audience.atRisk.length,
      },
      topSegmentId: topSegment && topSegment.customerIds.length > 0 ? topSegment.id : undefined,
      generatedAt: new Date(),
    };
  }
}
