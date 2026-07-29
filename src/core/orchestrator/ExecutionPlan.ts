import type { ExecutionStep } from "./ExecutionStep";
import type { ExecutionStatus } from "./ExecutionStatus";
import type { ExecutionPriority } from "@/core/catalog/ExecutionPriority";

/**
 * O plano completo de uma orquestração — objetivo, etapas ordenadas, e
 * estado agregado (Tarefa 02).
 *
 * `status` reflete o agregado das `steps`: `RUNNING` enquanto qualquer
 * etapa está em andamento; `FAILED` se qualquer etapa falhar; `COMPLETED`
 * apenas se todas as etapas concluírem com sucesso.
 */
export interface ExecutionPlan {
  id: string;

  name: string;

  objective: string;

  steps: ExecutionStep[];

  priority: ExecutionPriority;

  status: ExecutionStatus;

  metadata: Record<string, unknown>;

  createdAt: Date;

  updatedAt: Date;
}
