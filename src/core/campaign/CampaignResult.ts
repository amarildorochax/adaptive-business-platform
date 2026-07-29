/**
 * Resultado registrado para uma CampaignRecord (Tarefa 07) — um
 * retrato pontual (entregas/aberturas/cliques/conversões/receita),
 * registrado sob demanda via `Campaign.recordResult()`. Uma
 * CampaignRecord pode acumular várias CampaignResult ao longo do tempo
 * (histórico de retratos, não um valor único substituído).
 *
 * Nenhum destes números é produzido por este módulo — `CampaignManagement`
 * nunca executa campanhas nem envia mensagens (ver CampaignManager.ts);
 * os valores são sempre informados por quem chama `recordResult()`
 * (hoje, ninguém — reservado para uma futura integração via
 * `CampaignAnalyticsProvider`, Tarefa 12).
 */
export interface CampaignResult {
  campaignId: string;

  delivered: number;

  opened: number;

  clicked: number;

  converted: number;

  revenue: number;

  createdAt: Date;
}
