import type { MarketingCampaignRecord } from "./CampaignProvider";

/** Classificação de performance de uma campanha — ver thresholds em `CampaignAnalyzer.classifyPerformance()`. */
export type CampaignPerformance = "high" | "medium" | "low";

/** Resultado da análise de uma campanha — taxa de conversão, retorno e performance (Tarefa 04). */
export interface CampaignAnalysis {
  campaignId: string;
  name: string;
  conversionRate: number;
  roi: number;
  performance: CampaignPerformance;
}

/**
 * Analisa campanhas cadastradas — resultados, taxa de conversão,
 * performance e retorno (Tarefa 04).
 *
 * Desde a Sprint 10B, os `MarketingCampaignRecord[]` recebidos vêm de
 * `CampaignProvider.listCampaigns()` (`@/core/marketing/
 * CampaignProvider`), que consulta o CRM Core — hoje sempre `[]`, já
 * que CRM não modela uma entidade Campaign (ver nota em
 * CampaignProvider.ts). `CampaignAnalyzer` em si é agnóstico à origem
 * do dado, consumindo apenas a lista já recebida por parâmetro — nunca
 * soube, e continua não sabendo, de onde `campaigns` vem.
 *
 * Stateless — nenhum campo próprio, nenhuma dependência de EventBus ou
 * métricas (isso é responsabilidade de MarketingManager).
 */
export class CampaignAnalyzer {
  /** Analisa a lista de campanhas informada e retorna uma CampaignAnalysis por campanha. */
  analyze(campaigns: MarketingCampaignRecord[]): CampaignAnalysis[] {
    return campaigns.map((campaign) => {
      const conversionRate = campaign.sentCount === 0 ? 0 : campaign.convertedCount / campaign.sentCount;
      const roi = campaign.cost === 0 ? 0 : (campaign.revenue - campaign.cost) / campaign.cost;

      return {
        campaignId: campaign.id,
        name: campaign.name,
        conversionRate,
        roi,
        performance: this.classifyPerformance(conversionRate),
      };
    });
  }

  private classifyPerformance(conversionRate: number): CampaignPerformance {
    if (conversionRate >= 0.15) return "high";
    if (conversionRate >= 0.05) return "medium";
    return "low";
  }
}
