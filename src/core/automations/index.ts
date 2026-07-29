// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo automations — o Automation
// Center completo (Automation, AutomationManager, AutomationService,
// AutomationStore, AutomationRule, AutomationTrigger, AutomationAction,
// AutomationExecution, AutomationMetrics, e os contratos futuros
// AutomationExecutor/WorkflowExecutionProvider/NotificationProvider/
// AgentExecutionProvider/SchedulerProvider).
//
// Nota: nome no plural — `src/core/automation/` (singular) já existia
// desde a Sprint 0A (stubs IAutomation legados) e permanece intocado;
// ver nota de projeto em Automation.ts.
//
// Nota (Etapa 24A — Correção 03): `AutomationStore` deixou de ser
// reexportado por este barrel — verificado que nenhum consumidor fora
// deste módulo o importava, e a classe não define nenhum tipo público
// adicional. `AutomationManager`/`AutomationService` permanecem
// exportados: `AutomationService.ts` define, no mesmo arquivo,
// `AutomationRuleInput`/`AutomationTriggerInput`/`AutomationActionInput`
// — tipos públicos necessários para chamar `Automation.createRule()`/
// `createTrigger()`/`createAction()` corretamente — removê-los seria
// inseguro.
//
// Consumidores fora deste módulo devem preferir `automation` (fachada)
// — nunca AutomationManager/AutomationService/AutomationStore
// diretamente.

export * from './Automation';
export * from './AutomationManager';
export * from './AutomationService';
export * from './AutomationRule';
export * from './AutomationTrigger';
export * from './AutomationAction';
export * from './AutomationExecution';
export * from './AutomationMetrics';
export * from './AutomationExecutor';
export * from './WorkflowExecutionProvider';
export * from './NotificationProvider';
export * from './AgentExecutionProvider';
export * from './SchedulerProvider';
