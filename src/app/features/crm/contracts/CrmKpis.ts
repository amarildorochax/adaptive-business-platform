// CrmKpis.ts
//
// Responsabilidade:
// Contrato dos indicadores exibidos no Painel CRM — os 8 KPIs exigidos
// pelo ESCOPO.

export interface CrmKpis {
  totalClients: number;
  totalCompanies: number;
  totalLeads: number;
  totalDeals: number;
  expectedRevenue: number;
  realizedRevenue: number;
  conversionRate: number;
  pendingFollowUps: number;
}
