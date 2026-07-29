import type { WorkflowStep } from "./WorkflowStep";

/**
 * A definição reutilizável de um Workflow — registrada em
 * WorkflowRegistry, transformada em um WorkflowPlan executável a cada
 * `WorkflowEngine.start()` (Tarefa 02).
 *
 * `steps` aqui representam o **template** de cada etapa — `status`
 * permanece `PENDING` e `output` permanece indefinido até
 * WorkflowPlanner clonar esta definição em um WorkflowPlan real; a
 * mesma WorkflowDefinition pode originar múltiplas execuções
 * concorrentes, cada uma com seu próprio WorkflowPlan.
 *
 * `version` é incrementado por WorkflowRegistry a cada `update()` —
 * mesmo princípio de versionamento mínimo já aplicado a
 * `MemoryRecord.version`/`PromptRecord.version`.
 */
export interface WorkflowDefinition {
  id: string;

  name: string;

  description: string;

  version: number;

  steps: WorkflowStep[];

  metadata: Record<string, unknown>;

  createdAt: Date;

  updatedAt: Date;
}
