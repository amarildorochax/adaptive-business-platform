/**
 * Estados de um ExecutionRequest (Tarefa 06).
 *
 * Nota de nomenclatura: mesmo nome de `@/core/orchestrator/
 * ExecutionStatus.ts` (Sprint Agent Orchestrator, um `enum` com valores
 * distintos: `PENDING`/`RUNNING`/`COMPLETED`/`FAILED`, aplicado a
 * ExecutionPlan/ExecutionStep da orquestração de Agents) — colide no
 * barrel de topo (`core/index.ts`), resolvido excluindo `./execution`
 * de lá (ver nota em `core/index.ts`). Dentro deste módulo
 * (`@/core/execution`), o nome permanece correto e sem ambiguidade.
 *
 * `"scheduled"`/`"completed"` permanecem reservados para quando
 * `SchedulerExecutionProvider`/`ExecutionProvider` (contratos futuros,
 * Tarefa 09) forem implementados — nenhum caminho desta Sprint produz
 * esses dois estados.
 */
export type ExecutionStatus = "pending" | "approved" | "rejected" | "scheduled" | "completed" | "cancelled";
