import { workflowEngine } from "@/core/workflow/WorkflowEngine";
import type { WorkflowDefinition } from "@/core/workflow/WorkflowDefinition";

/**
 * Implementação real do WorkflowExecutionProvider (Etapa 24A —
 * Correção 02) — fecha o elo "Workflow Engine → Automation Center"
 * identificado como ausente pela Architecture Review (Etapa 24, V5).
 *
 * Consome exclusivamente a fachada pública `workflowEngine` —
 * `getWorkflow()`/`listWorkflows()` — nunca `WorkflowRegistry`/
 * `WorkflowPlanner`/`WorkflowExecutor` diretamente.
 *
 * **`run()` nunca executa um Workflow de verdade.** Esta Etapa proíbe
 * explicitamente qualquer execução real ("nenhuma execução real",
 * REGRAS) e o próprio Automation Center nunca executou nenhuma ação de
 * fato desde a Sprint 14 ("Nenhuma ação externa deverá ser realmente
 * executada"). `run()` apenas valida que `workflowId` corresponde a uma
 * `WorkflowDefinition` já registrada (mesmo princípio de "execução
 * conceitual" já usado por `AutomationService.execute()`) — nunca chama
 * `workflowEngine.start()`. Disparar um Workflow de verdade continua
 * reservado a uma Sprint futura, quando a proibição de execução real
 * for explicitamente levantada.
 *
 * `listAvailableWorkflows()` é uma segunda capacidade, somente leitura,
 * que dá a Automation Center visibilidade real sobre quais Workflows
 * existem — útil, por exemplo, para validar que o `target` de uma
 * `AutomationAction` do tipo `"workflow"` referencia algo real.
 *
 * Não altera `AutomationManager`/`AutomationService`/`Automation`:
 * nenhum método existente foi modificado, nenhum comportamento mudou.
 * Este Provider é aditivo e independente, no mesmo espírito de
 * `businessIntelligenceAutomationProvider` (Sprint 20).
 */
export class WorkflowExecutionProvider {
  /**
   * Valida que `workflowId` corresponde a uma WorkflowDefinition já
   * registrada. Nunca executa o Workflow de verdade.
   * @throws {Error} se `workflowId` não estiver registrado.
   */
  async run(workflowId: string): Promise<void> {
    const workflow = workflowEngine.getWorkflow(workflowId);

    if (!workflow) {
      throw new Error(`WorkflowExecutionProvider: workflow "${workflowId}" não está registrado.`);
    }
  }

  /** Retorna todas as WorkflowDefinition já registradas no Workflow Engine. */
  listAvailableWorkflows(): WorkflowDefinition[] {
    return workflowEngine.listWorkflows();
  }
}

/** Instância única e compartilhada do WorkflowExecutionProvider para todo o Automation Center. */
export const workflowExecutionProvider = new WorkflowExecutionProvider();
