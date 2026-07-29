// index.ts
//
// Responsabilidade:
// Ponto único de exportação do Core da plataforma — agrega todos os
// submódulos de src/core/* (agents, ai, analytics, automation,
// automations, bootstrap, business-intelligence, campaign, catalog,
// connectors, crm, dashboard, dispatcher, events, finance, history,
// knowledge, marketing, memory, orchestrator, pipeline, platform,
// prompt, queue, simulation, store, tasks) — exceto `notifications`,
// `execution`, `execution-scheduling` e `execution-engine`, ver notas
// (Sprints 15, 21, 22 e 23) abaixo.
// Consumidores fora de src/core devem preferir importar a
// partir daqui em vez de caminhos profundos (ex.: "@/core" em vez de
// "@/core/store/AgentStore"), quando praticável.
//
// Nota (Sprint Workflow Engine): `workflow` (src/core/workflow/)
// deliberadamente NÃO é agregado aqui — `WorkflowEngine`
// (src/core/workflow/WorkflowEngine.ts, a fachada desta Sprint) colide
// de nome com o `WorkflowEngine` já existente em
// src/core/automation/WorkflowEngine.ts (um stub `IAutomation` vazio,
// parte do AutomationLoader desde a Sprint 0B — fora do escopo de
// alteração desta Sprint). `export *` não permite ambiguidade de nome.
// Nenhum consumidor real do projeto importa `@/core` (barrel de topo)
// hoje — todo consumo real usa caminhos profundos (ex.:
// `@/core/workflow/WorkflowEngine`) — então esta exclusão não afeta
// nenhum comportamento existente. `src/core/workflow/index.ts` (o
// barrel do próprio módulo) permanece completo e sem ambiguidade.
//
// Nota (Sprint 14 — Automation Center): mesmo princípio da nota acima,
// desta vez resolvido pelo nome do diretório em vez de por exclusão do
// barrel — `src/core/automation/` (singular, stubs IAutomation legados
// da Sprint 0A) e `src/core/automations/` (plural, Automation Center
// real desta Sprint) coexistem como módulos distintos, ambos agregados
// aqui sem colisão (nenhum símbolo exportado por um existe no outro).
//
// Nota (Sprint 15 — Notification Hub): `notifications`
// (src/core/notifications/) deliberadamente NÃO é agregado aqui —
// `EmailProvider`/`WhatsAppProvider` (contratos futuros desta Sprint)
// colidem de nome com `@/core/marketing/EmailProvider.ts`/
// `WhatsAppProvider.ts` (Sprint 10, também contratos futuros). Mesmo
// princípio da colisão `WorkflowEngine` acima. `src/core/
// notifications/index.ts` (o barrel do próprio módulo) permanece
// completo e sem ambiguidade.
//
// Nota (Sprint 21 — Execution Orchestration): `execution`
// (src/core/execution/) deliberadamente NÃO é agregado aqui —
// `ExecutionPlan`/`ExecutionStatus` colidem de nome com
// `@/core/orchestrator/ExecutionPlan.ts`/`ExecutionStatus.ts` (Sprint
// Agent Orchestrator, formatos totalmente distintos), e
// `WorkflowExecutionProvider` (contrato futuro desta Sprint) colide com
// `@/core/automations/WorkflowExecutionProvider.ts` (Sprint 14). Mesmo
// princípio das colisões acima. `src/core/execution/index.ts` (o
// barrel do próprio módulo) permanece completo e sem ambiguidade.
//
// Nota (Sprint 22 — Execution Scheduling & Approval):
// `execution-scheduling` (src/core/execution-scheduling/)
// deliberadamente NÃO é agregado aqui — `SchedulerProvider` (contrato
// futuro desta Sprint) colide de nome com `@/core/automations/
// SchedulerProvider.ts` (Sprint 14, também um contrato futuro). Mesmo
// princípio das colisões acima. `src/core/execution-scheduling/
// index.ts` (o barrel do próprio módulo) permanece completo e sem
// ambiguidade.
//
// Nota (Sprint 23 — Execution Engine): `execution-engine`
// (src/core/execution-engine/) deliberadamente NÃO é agregado aqui —
// `ExecutionStep` colide de nome com `@/core/orchestrator/
// ExecutionStep.ts` (Sprint Agent Orchestrator, formato totalmente
// distinto). Mesmo princípio das colisões acima. `src/core/
// execution-engine/index.ts` (o barrel do próprio módulo) permanece
// completo e sem ambiguidade.

export * from './agents';
export * from './ai';
export * from './analytics';
export * from './automation';
export * from './automations';
export * from './bootstrap';
export * from './business-intelligence';
export * from './campaign';
export * from './catalog';
export * from './connectors';
export * from './crm';
export * from './dashboard';
export * from './dispatcher';
export * from './events';
export * from './finance';
export * from './history';
export * from './knowledge';
export * from './marketing';
export * from './memory';
export * from './orchestrator';
export * from './pipeline';
export * from './platform';
export * from './prompt';
export * from './queue';
export * from './simulation';
export * from './store';
export * from './tasks';
