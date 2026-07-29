/**
 * O plano de uma ExecutionRequest já registrada (Tarefa 05) — criado
 * automaticamente junto com o ExecutionRequest correspondente (ver
 * `ExecutionService.requestExecution()`), nunca separadamente.
 *
 * `steps` é a lista de `AutomationAction.id` (`actionIds`) da
 * AutomationRule referenciada por `ExecutionRequest.ruleId`, no momento
 * em que o plano foi criado — apenas os identificadores, nunca os
 * dados completos de cada AutomationAction (`Automation` não expõe um
 * `getAction(id)` público; apenas `AutomationRule.actionIds` já é
 * suficiente para "encaminhar execuções futuras", Tarefa do OBJETIVO).
 *
 * Nota de nomenclatura: mesmo nome de `@/core/orchestrator/
 * ExecutionPlan.ts` (Sprint Agent Orchestrator, formato totalmente
 * distinto — `name`/`objective`/`steps: ExecutionStep[]`/`priority`/
 * `status`/`updatedAt`, usado pela orquestração de Agents) — mesma
 * colisão documentada em ExecutionStatus.ts, mesma resolução (exclusão
 * do barrel de topo).
 */
export interface ExecutionPlan {
  id: string;

  requestId: string;

  steps: string[];

  createdAt: Date;

  metadata: Record<string, unknown>;
}
