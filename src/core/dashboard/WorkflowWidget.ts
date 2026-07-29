import { workflowEngine } from "@/core/workflow/WorkflowEngine";
import { DashboardWidgetType } from "./DashboardWidgetType";
import { DashboardWidgetStatus } from "./DashboardWidgetStatus";
import type { DashboardWidget } from "./DashboardWidget";

/**
 * Monta o WorkflowWidget — consulta exclusivamente `workflowEngine`
 * (`@/core/workflow/WorkflowEngine.ts`, fachada pública, inalterada;
 * nunca `WorkflowManager`/`WorkflowRegistry`/`WorkflowExecutor`
 * diretamente). Importado por caminho profundo (`@/core/workflow/
 * WorkflowEngine`, não `@/core/workflow`) — o próprio barrel do módulo
 * já é completo; apenas o barrel de topo `@/core/index.ts` exclui esse
 * nome por colidir com `@/core/automation/WorkflowEngine.ts` (ver Nota
 * na Sprint Workflow Engine).
 */
export function buildWorkflowWidget(): DashboardWidget {
  const definitions = workflowEngine.listWorkflows();
  const executions = workflowEngine.listExecutions();
  const metrics = workflowEngine.getMetrics();

  return {
    id: "workflow",
    title: "Workflow Engine",
    type: DashboardWidgetType.WORKFLOW,
    status: definitions.length > 0 ? DashboardWidgetStatus.OK : DashboardWidgetStatus.EMPTY,
    data: {
      totalWorkflows: definitions.length,
      totalExecutions: executions.length,
      workflowsExecuted: metrics.workflowsExecuted,
      averageDurationMs: metrics.averageDurationMs,
      failures: metrics.failures,
    },
    updatedAt: new Date(),
  };
}
