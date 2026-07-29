import { agentOrchestrator, ExecutionStatus } from "@/core/orchestrator";
import type { WorkflowPlan } from "./WorkflowPlan";
import { WorkflowStatus } from "./WorkflowStatus";
import { WorkflowContext } from "./WorkflowContext";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/**
 * Executa um WorkflowPlan, uma WorkflowStep por vez, em ordem
 * sequencial (Tarefa 06).
 *
 * Responsabilidade: única lógica de execução de workflow da
 * plataforma — chama exclusivamente `agentOrchestrator.execute()`
 * (`@/core/orchestrator`, inalterado, API pública) para de fato rodar
 * cada etapa. **Nenhum acesso direto a AgentDispatcher** (Tarefa 06) —
 * nem sequer importado neste arquivo.
 *
 * Cada WorkflowStep dispara sua própria chamada independente a
 * `agentOrchestrator.execute()` com um único ExecutionStep — o
 * WorkflowExecutor nunca acessa `ExecutionPlanner`/`AgentSelector`
 * diretamente, apenas o resultado já público que `AgentOrchestrator`
 * retorna.
 *
 * Falha: interrompe o workflow na primeira etapa que falhar — etapas
 * seguintes permanecem `PENDING`, nunca tentadas (diferente de
 * AgentOrchestrator, que percorre todas as etapas mesmo com falha
 * intermediária; aqui, dado que os workflows desta Sprint são
 * conceitualmente sequenciais — Pesquisar → Escrever → Revisar —,
 * prosseguir após uma falha não faz sentido sem compensação real, ver
 * WorkflowCompensation.ts, Tarefa 11).
 *
 * Dependências: `agentOrchestrator`/`ExecutionStatus` (públicos,
 * inalterados), WorkflowContext, EventBus/EventTypes.
 */
export class WorkflowExecutor {
  /** Executa `plan` do início ao fim (ou até a primeira falha), mutando-o em memória e retornando-o. */
  async execute(plan: WorkflowPlan): Promise<WorkflowPlan> {
    const context = new WorkflowContext(plan.id, crypto.randomUUID());

    plan.status = WorkflowStatus.RUNNING;

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.WORKFLOW_STARTED,
      source: "WorkflowExecutor",
      payload: { planId: plan.id, name: plan.name, steps: plan.steps.length },
      createdAt: new Date(),
    });

    for (const step of plan.steps) {
      step.status = WorkflowStatus.RUNNING;

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.WORKFLOW_STEP_STARTED,
        source: "WorkflowExecutor",
        payload: { planId: plan.id, stepId: step.id, agentId: step.agentId, taskType: step.taskType, action: step.action },
        createdAt: new Date(),
      });

      const orchestration = await agentOrchestrator.execute({
        name: step.action,
        objective: step.input,
        steps: [{ agentId: step.agentId, taskType: step.taskType, action: step.action }],
      });

      if (orchestration.status === ExecutionStatus.FAILED) {
        const message = String(orchestration.steps[0]?.result ?? "Falha na execução da etapa.");

        step.status = WorkflowStatus.FAILED;
        step.output = message;
        plan.status = WorkflowStatus.FAILED;
        plan.updatedAt = new Date();

        eventBus.emit({
          id: crypto.randomUUID(),
          type: EventTypes.WORKFLOW_FAILED,
          source: "WorkflowExecutor",
          payload: { planId: plan.id, stepId: step.id, agentId: step.agentId, message },
          createdAt: new Date(),
        });

        return plan;
      }

      step.output = orchestration.steps[0]?.result;
      step.status = WorkflowStatus.COMPLETED;

      context.set(`step:${step.order}:output`, step.output);

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.WORKFLOW_STEP_COMPLETED,
        source: "WorkflowExecutor",
        payload: { planId: plan.id, stepId: step.id, agentId: step.agentId },
        createdAt: new Date(),
      });
    }

    plan.status = WorkflowStatus.COMPLETED;
    plan.updatedAt = new Date();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.WORKFLOW_COMPLETED,
      source: "WorkflowExecutor",
      payload: { planId: plan.id, steps: plan.steps.length, sharedData: context.getAll() },
      createdAt: new Date(),
    });

    return plan;
  }
}
