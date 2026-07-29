import type { WorkflowDefinition } from "./WorkflowDefinition";
import type { WorkflowPlan } from "./WorkflowPlan";
import { WorkflowStatus } from "./WorkflowStatus";

/**
 * Transforma uma WorkflowDefinition em um WorkflowPlan executável
 * (Tarefa 05).
 *
 * Responsabilidade: clonar as `steps` da definição — nunca mutar a
 * definição original — reiniciando `status: PENDING` e `output:
 * undefined` em cada uma, e ordenando por `WorkflowStep.order`.
 *
 * "Preparar suporte para dependências futuras" (Tarefa 05): a ordenação
 * explícita por `order` abaixo (em vez de assumir que `definition.steps`
 * já vem ordenado) é o único ponto de extensão já preparado — quando
 * `StepDependency`-like (ver `WorkflowCondition.ts`/`WorkflowLoop.ts`,
 * Tarefa 11) for implementado, a reordenação/filtragem de etapas
 * aconteceria aqui, sem exigir mudança em WorkflowExecutor (que apenas
 * percorre `plan.steps` na ordem em que already estão).
 *
 * Dependências: WorkflowDefinition, WorkflowPlan, WorkflowStatus (tipos).
 *
 * Consumido exclusivamente por WorkflowEngine.
 */
export class WorkflowPlanner {
  /** Monta o WorkflowPlan — `status: PENDING`, cada WorkflowStep clonado também `PENDING`. */
  plan(definition: WorkflowDefinition): WorkflowPlan {
    const now = new Date();

    const steps = definition.steps
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        ...step,
        id: crypto.randomUUID(),
        status: WorkflowStatus.PENDING,
        output: undefined,
      }));

    return {
      id: crypto.randomUUID(),
      definitionId: definition.id,
      name: definition.name,
      steps,
      status: WorkflowStatus.PENDING,
      metadata: { ...definition.metadata },
      createdAt: now,
      updatedAt: now,
    };
  }
}
