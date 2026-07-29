/**
 * Automation Orchestration Component — os seis componentes internos pertencentes à Sprint 6.1
 * (Central Orchestration), subconjunto do catálogo completo de vinte e cinco componentes já
 * descritos em `AUTOMATION_ENGINE.md`, Capítulo 7. Os dezenove componentes restantes (Trigger,
 * Condition, Action, Execution, Approval, e demais) pertencem às Sprints 6.2 a 6.5 e não são
 * catalogados aqui, conforme `PHASE_6_IMPLEMENTATION_BACKLOG.md`, item AUTO-01.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type AutomationOrchestrationComponent =
  | "Automation Manager"
  | "Workflow Engine"
  | "Workflow Builder"
  | "Workflow Validator"
  | "Workflow Versioning"
  | "Workflow Library";
