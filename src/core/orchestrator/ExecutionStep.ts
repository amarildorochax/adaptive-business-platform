import type { ExecutionStatus } from "./ExecutionStatus";

/**
 * Uma etapa individual de um ExecutionPlan — um Agent executando uma
 * `action` (Tarefa 03).
 *
 * `result` é sempre `unknown` de propósito — ExecutionStep é genérico
 * por natureza (qualquer Agent, não apenas BlogAgent), então nunca tipa
 * o resultado como algo específico de um Agent (ex.:
 * `BlogExecutionResult`, de `AgentDispatcher.ts`, inalterado nesta
 * Sprint) — quem consome `result` já sabe, pelo `agentId`, como
 * interpretá-lo.
 */
export interface ExecutionStep {
  id: string;

  /** Posição da etapa dentro do ExecutionPlan — execução sempre sequencial nesta Sprint (ver ExecutionParallelism.ts, Tarefa 10). */
  order: number;

  agentId: string;

  action: string;

  status: ExecutionStatus;

  result?: unknown;

  createdAt: Date;

  updatedAt: Date;
}
