import type { CampaignGoal } from './CampaignGoal';

/** Contrato de persistência de Campaign Goal — apenas o contrato, per Etapa 7 (IMP-005). */
export interface CampaignGoalRepository {
  create(campaignGoal: CampaignGoal): Promise<CampaignGoal>;
  get(campaignGoalId: string): Promise<CampaignGoal | undefined>;
  list(campaignId: string): Promise<CampaignGoal[]>;
}
