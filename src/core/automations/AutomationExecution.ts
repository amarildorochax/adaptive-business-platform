/**
 * Resultado de uma execução conceitual — `"completed"` quando a regra
 * estava apta (habilitada, com trigger e todas as actions existentes);
 * `"skipped"` caso contrário. Nunca reflete um efeito real (ver nota em
 * AutomationService.ts — "Nenhuma ação externa deverá ser realmente
 * executada", Tarefa 09).
 */
export type AutomationExecutionStatus = "completed" | "skipped";

/**
 * Registro de uma execução (sempre conceitual) de uma AutomationRule
 * (Tarefa 07) — criado por `AutomationService.execute()`. Uma
 * AutomationRule pode acumular várias AutomationExecution ao longo do
 * tempo (histórico, não um valor único substituído).
 */
export interface AutomationExecution {
  id: string;

  ruleId: string;

  startedAt: Date;

  finishedAt: Date;

  status: AutomationExecutionStatus;

  logs: string[];
}
