/** Estados de um ExecutionStep — nesta Sprint, sempre transita direto de `"pending"` para `"completed"` (nenhuma execução real). */
export type ExecutionStepStatus = "pending" | "completed";

/**
 * Uma etapa individual de um ExecutionRun (Tarefa 05).
 *
 * Nota de decisão de projeto: a Tarefa 07 pede "Criar ExecutionStep
 * para cada etapa do plano", mas nenhuma API pública alcançável por
 * este módulo (Tarefa 03 restringe o consumo a
 * `executionScheduling.getSchedule()`) realmente expõe os passos de um
 * plano — `ExecutionPlan.steps` (`@/core/execution`, Sprint 21) nunca
 * foi exposto por nenhum getter da fachada `Execution`, e
 * `ExecutionSchedule` (Sprint 22) não carrega nenhuma lista de etapas.
 * Confirmado com o usuário: `ExecutionEngineService.completeRun()`
 * cria sempre **um único** ExecutionStep sintético por ExecutionRun,
 * representando a execução do agendamento como unidade atômica —
 * `actionId` é o próprio `scheduleId`, documentado aqui como um
 * placeholder reservado a ser substituído por dados reais quando uma
 * Sprint futura expuser os passos de um plano através de uma API
 * pública.
 *
 * Nota de nomenclatura: mesmo nome de `@/core/orchestrator/
 * ExecutionStep.ts` (Sprint Agent Orchestrator, formato totalmente
 * distinto — `agentId`/`action`/`result`/`updatedAt`, usado pela
 * orquestração de Agents) — colide no barrel de topo (`core/index.ts`),
 * resolvido excluindo `./execution-engine` de lá (ver nota em
 * ExecutionEngine.ts).
 */
export interface ExecutionStep {
  id: string;

  runId: string;

  actionId: string;

  order: number;

  status: ExecutionStepStatus;

  metadata: Record<string, unknown>;
}
