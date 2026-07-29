/**
 * Público-alvo definido para uma CampaignRecord (Tarefa 05). Uma
 * CampaignAudience por CampaignRecord (a mais recente substitui a
 * anterior) — `customerIds` não é validado contra o CRM (Campaign
 * Management nunca acessa CRM, ver CampaignManager.ts).
 */
export interface CampaignAudience {
  campaignId: string;

  customerIds: string[];

  estimatedReach: number;

  createdAt: Date;
}
