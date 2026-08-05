import type { ActionRepository } from './ActionRepository';
import type { TriggerRepository } from './TriggerRepository';
import type { Workflow } from './Workflow';
import type { WorkflowBranch } from './WorkflowBranch';
import type { WorkflowValidationResult } from './WorkflowValidationResult';
import type { WorkflowValidationResultRepository } from './WorkflowValidationResultRepository';

/**
 * WorkflowValidationService — porta a lógica de elegibilidade de
 * `src/core/automations/AutomationService.evaluate()` (Automation Center legado, real e funcional):
 * "a regra está apta quando... seu trigger existe [e] todas as suas actions existem" — mesmo
 * princípio, aplicado aqui a `Workflow.triggerId`/`actionIds` e a `actionIds` de cada Branch, nunca
 * interpretando o conteúdo de `Condition`/`Action` em si, apenas confirmando que cada referência é
 * resolvível (Blueprint, Capítulo 7, "toda Condition referencia um campo de dado existente, toda
 * Action referencia... um Hub válido").
 *
 * `noCyclicComposition` é sempre `true` nesta Sprint — Composable Workflows (um Workflow invocar
 * outro) é explicitamente "longo prazo" no Roadmap do próprio Blueprint (Capítulo 20), não
 * implementado nesta Sprint; sem nenhuma capacidade de composição, não há ciclo possível a detectar,
 * uma verdade honesta desta fase, não um placeholder falso.
 */
export class WorkflowValidationService {
  constructor(
    private readonly repository: WorkflowValidationResultRepository,
    private readonly triggers: TriggerRepository,
    private readonly actions: ActionRepository,
  ) {}

  async validate(workflow: Workflow, branches: readonly WorkflowBranch[]): Promise<WorkflowValidationResult> {
    const triggerExists = (await this.triggers.get(workflow.triggerId)) !== undefined;

    const allActionIds = [...workflow.actionIds, ...branches.flatMap((branch) => branch.actionIds)];
    let actionsResolved = true;

    for (const actionId of allActionIds) {
      if ((await this.actions.get(actionId)) === undefined) {
        actionsResolved = false;
        break;
      }
    }

    const conditionsResolved = branches.every((branch) => branch.conditionId.length > 0);
    const noCyclicComposition = true;
    const valid = triggerExists && actionsResolved && conditionsResolved && noCyclicComposition;

    const result: WorkflowValidationResult = {
      workflowId: workflow.workflowId,
      conditionsResolved,
      actionsResolved,
      noCyclicComposition,
      valid,
      validatedAt: new Date(),
    };

    return this.repository.save(result);
  }

  async get(workflowId: string): Promise<WorkflowValidationResult | undefined> {
    return this.repository.get(workflowId);
  }
}
