/**
 * Automation Advanced Integration Component — os sete componentes internos pertencentes à
 * Sprint 6.5, último subconjunto do catálogo completo de vinte e cinco componentes já descritos em
 * `AUTOMATION_ENGINE.md`, Capítulo 7. Com esta Sprint, os vinte e cinco componentes estão
 * integralmente catalogados entre `AutomationOrchestrationComponent.ts` (6, Sprint 6.1),
 * `AutomationTriggerConditionComponent.ts` (3, Sprint 6.2), `AutomationActionExecutionComponent.ts`
 * (5, Sprint 6.3), `AutomationGovernanceApprovalComponent.ts` (4, Sprint 6.4), e este arquivo (7).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type AutomationAdvancedIntegrationComponent =
  | "Integration Connector"
  | "Metrics Engine"
  | "Automation Analytics"
  | "Automation Preview"
  | "Simulation Engine"
  | "Rollback Manager"
  | "Dead Letter Queue";
