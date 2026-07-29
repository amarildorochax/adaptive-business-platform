// CrmKpiService.ts
//
// Responsabilidade:
// Calcula os 8 KPIs do Painel CRM a partir dos dados já carregados —
// transformação pura, sem efeito colateral (mesmo padrão de
// `DashboardLayoutManager`, Sprint 29A). Não busca dado sozinho; quem
// chama (`useCrmKpis`) já tem os arrays em mãos via os demais hooks.

import type { Activity, Client, Company, CrmPipelineStage, Deal } from '../types';
import type { CrmKpis } from '../contracts';

export class CrmKpiService {
  compute(
    clients: Client[],
    companies: Company[],
    deals: Deal[],
    stages: CrmPipelineStage[],
    activities: Activity[],
  ): CrmKpis {
    const wonStageIds = new Set(stages.filter((stage) => stage.isWon).map((stage) => stage.id));
    const lostStageIds = new Set(stages.filter((stage) => stage.isLost).map((stage) => stage.id));

    const wonDeals = deals.filter((deal) => wonStageIds.has(deal.stageId));
    const lostDeals = deals.filter((deal) => lostStageIds.has(deal.stageId));
    const openDeals = deals.filter((deal) => !wonStageIds.has(deal.stageId) && !lostStageIds.has(deal.stageId));
    const closedCount = wonDeals.length + lostDeals.length;

    return {
      totalClients: clients.length,
      totalCompanies: companies.length,
      totalLeads: clients.filter((client) => client.status === 'lead').length,
      totalDeals: deals.length,
      expectedRevenue: openDeals.reduce((sum, deal) => sum + deal.value * deal.probability, 0),
      realizedRevenue: wonDeals.reduce((sum, deal) => sum + deal.value, 0),
      conversionRate: closedCount === 0 ? 0 : wonDeals.length / closedCount,
      pendingFollowUps: activities.filter((activity) => activity.status === 'pending').length,
    };
  }
}

/** Instância única e compartilhada do serviço de KPIs do CRM. */
export const crmKpiService = new CrmKpiService();
