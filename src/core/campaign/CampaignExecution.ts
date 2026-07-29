/** Estado de uma execução de CampaignRecord — nunca "executa" nada de fato (nenhum envio, nenhuma automação); apenas registra o ciclo início/fim. */
export type CampaignExecutionStatus = "running" | "completed";

/**
 * Registro de execução de uma CampaignRecord (Tarefa 06) — criado por
 * `CampaignService.start()`, atualizado por `CampaignService.finish()`.
 * Uma CampaignExecution "corrente" por CampaignRecord (reiniciar
 * substitui a anterior).
 */
export interface CampaignExecution {
  campaignId: string;

  startedAt: Date;

  finishedAt?: Date;

  status: CampaignExecutionStatus;

  notes: string;
}
