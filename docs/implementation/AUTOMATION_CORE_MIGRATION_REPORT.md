# Automation Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-009 — Automation Hub Migration (Core)

---

## Nota de Posicionamento Documental

Como em toda Sprint desta série, o contexto e o texto da própria Sprint divergem do estado real do repositório em pontos que precisam ser registrados antes de qualquer decisão técnica — e esta Sprint revela a divergência estrutural mais significativa de toda a série até agora.

**O pacote é `platform/packages/automation-engine`, não "automation-hub".** Confirmado desde a IMP-001: o Automation Engine é tratado, na própria arquitetura da plataforma, como um mecanismo de execução transversal — "o sistema nervoso motor" (`AUTOMATION_ENGINE.md`, Capítulo 1) —, não como um Business Hub de domínio (CRM, Commerce, Finance). O texto desta Sprint usa "Automation Hub" e "AutomationManager" de forma consistente com o padrão das sete Sprints anteriores; esta Sprint trata ambos como o mesmo mecanismo já referenciado por `AUTOMATION_ENGINE.md`.

**`AUTOMATION_ENGINE.md` nunca cataloga Commands, e nunca cataloga um Event Map próprio.** Diferente de todo Hub anterior — inclusive Content e Commerce Hub, que ao menos tinham um catálogo de Events sem Commands — este documento (Capítulo 15) é explícito: "O catálogo de eventos consumidos e produzidos pelo Automation Engine é o mesmo Event Map já descrito em `SYSTEM_BLUEPRINT.md`, Capítulo 7 — este documento não repete esse catálogo". Nenhum capítulo equivalente a "Comandos" existe neste documento (confirmado por leitura integral, 23 capítulos). Consistente com essa ausência, o pacote já chegava, desde a IMP-001, sem nenhum arquivo `AutomationCommand.ts`/`AutomationEvent.ts` — diferente dos sete Hubs anteriores, todos já chegando com pelo menos um catálogo de Events. Esta Sprint nunca inventa nenhum dos dois catálogos ausentes — ver decisão de `AuditRecord` abaixo.

**`AuditRecord` é o mecanismo que esta Sprint usa no lugar do par Command/Event.** `AuditRecord.ts` já existia desde a IMP-001, com um tipo fechado de seis operações (`WorkflowCreated`/`WorkflowEdited`/`WorkflowActivated`/`WorkflowDeactivated`/`ApprovalGranted`/`ApprovalDenied`) — exatamente a granularidade de "fato de domínio relevante" que Command/Event cumprem em todo Hub anterior. `AutomationOperationResult<T>` desta Sprint é `{result, audit?}`, nunca `{result, command?, events}` — não por escolha estilística, mas porque não existe vocabulário aprovado equivalente a Command/Event para replicar.

**Múltiplos módulos legados de nome semelhante existem, e a maioria é falso cognato.** Etapa 1 desta Sprint pediu auditoria de `automation`, `workflow`, `execution`, `orchestration`, `queue`, entre outros — todos esses diretórios existem em `src/core/`, mas a maioria pertence à execução de Agente de IA (orquestração de Prompt/Agent/BusinessMemory), um domínio completamente diferente do automação-de-processo-de-negócio que `AUTOMATION_ENGINE.md` descreve. Ver Inventário abaixo para o mapeamento completo, único e mais extenso encontrado nesta série.

---

## Resumo Executivo

Esta Sprint implementou a primeira execução real sobre `platform/packages/automation-engine` — 30 arquivos já existentes desde a IMP-001 (25 Entidades reais mais 5 catálogos de "Component" organizados por Sprint de origem: 6.1 Orquestração Central, 6.2 Trigger/Condition, 6.3 Action/Execution, 6.4 Governança/Aprovação, 6.5 Integração Avançada), nenhum com nenhuma classe de execução até esta Sprint. Dezesseis Entidades entraram em escopo, seguindo literalmente o Roadmap de curto prazo já definido pelo próprio Blueprint (Capítulo 20): Workflow (com Version e Branch), Trigger (com Schedule Definition), Condition (com Condition Expression), Action (com Retry Policy), e o ciclo completo de Execution (com Execution Step, Retry Attempt, Execution History Record e Dead Letter Entry) — mais Audit Record, o mecanismo escolhido no lugar do par Command/Event ausente. `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos), com 15 testes novos (138 no total).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| `platform/packages/automation-engine/` (25 Entidades, 5 catálogos de Component, nenhum Command/Event) | — | Já existente, Frozen em espírito | Confirmado por leitura integral de todos os 30 arquivos já declarados desde a IMP-001 |
| `AutomationRule`/`AutomationTrigger`/`AutomationAction`/`AutomationExecution`/`AutomationService.evaluate()` | `src/core/automations/` (plural) | Adaptar (tipo + lógica) | Real e funcional; `evaluate()` ("regra apta quando habilitada, trigger existe, todas as actions existem") portado quase literalmente para `WorkflowValidationService.validate()`; `enabled: boolean` (dois estados) substituído por `WorkflowStatus` já aprovado (três estados: `Draft`/`Active`/`Inactive`) — vocabulário nunca reduzido para caber no legado |
| `WorkflowEngine`/`RuleEngine`/`TriggerManager`/`HookManager`/`PolicyManager` | `src/core/automation/` (singular) | **Nunca implementado, mesmo no legado** | O próprio doc-comment de `src/core/automations/Automation.ts` (plural) confirma: "`src/core/automation/` (singular) já existia... stubs `IAutomation` legados... nunca implementados, sem nenhum consumidor real" — nada a extrair |
| `AgentOrchestrator`/`ExecutionPlanner`/`AgentSelector` | `src/core/orchestrator/` | Falso cognato — não portado | Orquestra execução de Agente de IA (`AgentDispatcher` → `BlogAgentExecutor` → `PromptManager` → `AIGateway`), nunca Trigger/Condition/Action de automação de processo de negócio |
| `ExecutionEngine`/`ExecutionEngineManager`/`ExecutionRun` | `src/core/execution-engine/` | Falso cognato — não portado | Mesmo domínio de `orchestrator/` — "nunca executa Workflow, IA, Provider, notificação... de verdade" (doc-comment do próprio módulo) |
| `WorkflowEngine`/`WorkflowDefinition`/`WorkflowExecutor` | `src/core/workflow/` (singular) | Falso cognato — não portado | Compartilha o nome exato do componente já aprovado ("Workflow Engine", Capítulo 7), mas orquestra `AgentOrchestrator`, não Trigger/Condition/Action — mesmo padrão de falso cognato parcial já registrado para `src/core/dashboard/` em IMP-008 |
| `TaskQueue`/`Task`/`TaskStatus` | `src/core/queue/` | Falso cognato — não portado | "Nota de auditoria (Sprint 0A): nenhum ponto do código hoje chama `taskQueue.add()`" (doc-comment do próprio módulo) — fila de Task de Agente, nunca usada, nunca automação de negócio |
| `AgentDispatcher`, `Pipeline`, `ExecutionScheduling`/`ApprovalProvider` | `src/core/dispatcher/`, `src/core/pipeline/`, `src/core/execution-scheduling/` | Falso cognato — não portado | Mesmo cluster de execução de Agente de IA — não inspecionados em profundidade adicional além da confirmação de escopo, dada a evidência já conclusiva dos módulos irmãos |
| Commands do Automation Engine | — | **Inexistente, confirmado no próprio Blueprint** | `AUTOMATION_ENGINE.md` nunca cataloga Commands — nenhum capítulo equivalente existe em 23 capítulos |
| Events do Automation Engine | — | **Delegado ao Event Map genérico, nunca um catálogo próprio** | `AUTOMATION_ENGINE.md`, Capítulo 15: "o mesmo Event Map já descrito em `SYSTEM_BLUEPRINT.md`... este documento não repete esse catálogo" |
| `AuditRecord` (6 operações: `Workflow{Created,Edited,Activated,Deactivated}`, `Approval{Granted,Denied}`) | `AuditRecord.ts` | Já aprovado, reutilizado como mecanismo central | Adotado nesta Sprint como o substituto direto de Command/Event — ver Nota de Posicionamento |
| `ApprovalCheckpoint`, `AutomationPreviewResult`, `SimulationRun` | `platform/packages/automation-engine/*` | Adiado — "médio prazo" no próprio Roadmap | `AUTOMATION_ENGINE.md`, Capítulo 20: Approval Engine, Automation Preview e Simulation Engine explicitamente sequenciados após o curto prazo |
| `RollbackAction`, `WorkflowMetric`, `AutomationAnalyticsIndicator` | `platform/packages/automation-engine/*` | Adiado — "longo prazo" no próprio Roadmap | Mesmo Capítulo 20: Rollback Manager maduro, refinamento de Automation Analytics |
| `ActionAIInvocation`, `IntegrationConnectorReference`, `NotificationRequest`, `TemplateResolution` | `platform/packages/automation-engine/*` | Adiado — integração cross-cutting fora de escopo | Dependem de AI Hub, Integration Hub, Branding Hub — "Nunca implementar integrações externas" (regra explícita desta Sprint) |
| `WorkflowBuilderResult`, `WorkflowLibraryEntry` | `platform/packages/automation-engine/*` | Adiado — conveniência de autoria/catálogo | Não estritamente necessários ao ciclo Core de criação→validação→ativação→execução; nenhum dos dois citado no Roadmap de curto prazo |
| CRM/Communication/Content/Growth/Commerce/Finance/Analytics Hub | `@abp/crm-hub` e demais | Nunca acessado, nem por referência de tipo | `Trigger.sourceDescription`/`Action.targetDescription` são sempre `string` opacos — nenhum tipo de nenhum outro Business Hub é importado por nenhum arquivo desta Sprint (Low Coupling, `AUTOMATION_ENGINE.md`, Capítulo 5) |

---

## Componentes Criados

**Entidades**: nenhuma extensão de campo foi necessária — os 16 contratos já aprovados (`Workflow`, `WorkflowVersion`, `WorkflowBranch`, `WorkflowValidationResult`, `Trigger`, `ScheduleDefinition`, `Condition`, `ConditionExpression`, `Action`, `RetryPolicy`, `Execution`, `ExecutionStep`, `RetryAttempt`, `ExecutionHistoryRecord`, `DeadLetterEntry`, `AuditRecord`) já chegavam completos desde a IMP-001, mais ricos em categorização fechada (`TriggerCategory`, `ActionCategory`, `ConditionKind`) do que o legado equivalente (`eventType`/`type`/`target` como `string` livre) — o vocabulário aprovado nunca foi reduzido para caber na forma mais simples do legado.

**Repositórios** (contratos apenas): um por Entidade em escopo (16 no total) — `RetryAttemptRepository`/`ExecutionHistoryRecordRepository`/`DeadLetterEntryRepository`/`AuditRecordRepository` nunca declaram `update`/`remove` (histórico imutável); `WorkflowRepository` nunca declara `remove` (desativação via `status`, nunca remoção física).

**Serviços**: um por Entidade (16 no total). `WorkflowValidationService.validate()` porta, quase literalmente, a lógica de elegibilidade de `AutomationService.evaluate()` (legado): confirma que `Workflow.triggerId` existe e que toda `actionId` — do próprio Workflow e de cada Branch — existe, antes de permitir ativação. `noCyclicComposition` é sempre `true` nesta Sprint, uma verdade honesta desta fase (Composable Workflows, que permitiria um ciclo, é "longo prazo", nunca implementado) — não um placeholder falso.

**Orquestrador**: `AutomationManager.ts` — expõe `createWorkflow`/`editWorkflow`/`validateWorkflow`/`activateWorkflow`/`deactivateWorkflow`, `registerTrigger`/`defineSchedule`, `defineCondition`/`combineConditions`, `defineAction`/`defineRetryPolicy`, `addBranch`/`resolveBranch` (a lógica "apenas um Branch é seguido, o primeiro cuja Condition é satisfeita, na ordem definida" — `AUTOMATION_ENGINE.md`, Capítulo 8), `startExecution` (exige `Workflow.status === 'Active'`), `startStep`/`completeStep`/`handleStepFailure` (Retry Policy → Retry Attempt → Dead Letter Entry, quando esgotada) e `completeExecution` (nunca confunde `NoActionTaken` com `Failure`, ADR-012).

## Componentes Reutilizados

O padrão de coleta de Domain Facts (nenhum publicado em Event Bus real) se repete, adaptado: em vez de `events: readonly XEvent[]`, esta Sprint retorna `audit?: AuditRecord` — um único registro opcional, nunca uma lista, porque cada operação de Workflow produz no máximo um fato auditável, nunca vários simultaneamente (diferente de `CRMManager.convertLead()`, que produz quatro Events de uma vez).

O padrão de referência opaca a outro Hub (`sourceDescription`/`targetDescription: string`), já demonstrado por `AnalyticsEventIngestion` (IMP-008) e por toda Sprint anterior, já chegava pronto em `Trigger.ts`/`Action.ts` desde a IMP-001 — reutilizado sem alteração.

## Componentes Ausentes

Approval Engine (`ApprovalCheckpoint`), Automation Preview (`AutomationPreviewResult`) e Simulation Engine (`SimulationRun`) — os três explicitamente "médio prazo" no Roadmap do próprio Blueprint (Capítulo 20). Rollback Manager (`RollbackAction`), Automation Analytics (`WorkflowMetric`, `AutomationAnalyticsIndicator`) — "longo prazo". Execução de IA (`ActionAIInvocation`), Integration Connector (`IntegrationConnectorReference`), Notification Engine (`NotificationRequest`) e Template Engine (`TemplateResolution`) — todos dependentes de AI Hub/Integration Hub/Branding Hub, explicitamente fora de escopo ("Nunca implementar integrações externas"). Workflow Builder (`WorkflowBuilderResult`) e Workflow Library (`WorkflowLibraryEntry`) — conveniência de autoria e catálogo, não citados no Roadmap de curto prazo. Nenhum dos nove foi descartado — todos permanecem contratados, intocados, prontos para uma Sprint futura.

---

## Lacunas Arquiteturais

**Nenhum Command foi ou pôde ser portado — `AUTOMATION_ENGINE.md` nunca os catalogou, para nenhuma Entidade.** Diferente de Content Hub e Commerce Hub (ambos sem Commands, mas com Events), este é o primeiro Hub desta série sem absolutamente nenhum vocabulário formal de Command ou de Event próprio. `AutomationOperationResult<T>` reflete isso com precisão: nunca tem campo `command`, nunca tem campo `events` — apenas `audit?`.

**`registerTrigger`, `defineSchedule`, `defineCondition`, `combineConditions`, `defineAction`, `defineRetryPolicy`, `addBranch`, `startExecution`, `startStep`, `completeStep`, `handleStepFailure` e `completeExecution` nunca produzem um Audit Record.** Nenhum dos onze corresponde a uma das seis operações já catalogadas em `AuditedOperation` (`WorkflowCreated`/`Edited`/`Activated`/`Deactivated`/`ApprovalGranted`/`ApprovalDenied`) — apenas as quatro operações de ciclo de vida do próprio `Workflow` produzem Audit Record nesta Sprint. `ApprovalGranted`/`ApprovalDenied` nunca são exercidos nesta Sprint — dependem do Approval Engine, adiado.

**`noCyclicComposition` é estruturalmente sempre `true` nesta Sprint.** Não uma simplificação disfarçada: sem Composable Workflows (um Workflow invocar outro), nenhum ciclo é tecnicamente possível de existir — a verificação é honesta para o escopo atual, mas deixará de ser trivial no momento em que uma Sprint futura implementar composição, quando `WorkflowValidationService` precisará de uma verificação real de grafo.

**`resolveBranch` depende inteiramente do chamador fornecer o conjunto de Condition já satisfeitas.** Nenhuma lógica de avaliação de `ConditionKind`/`ConditionOperator` foi implementada nesta Sprint — `Condition.description` e `ConditionExpression.operator` permanecem descritivos/estruturais, nunca interpretados por nenhum Service. Avaliar de fato se uma Condition de categoria `Segment`/`Profile`/`Permission` está satisfeita exige consultar o Business Profile Engine/Identity Hub, ambos fora do escopo desta Sprint ("Nunca implementar integrações externas") — mesma disciplina de "nunca interpretar o conteúdo, apenas confirmar existência" já demonstrada pelo legado (`AutomationService.evaluate()` nunca interpretava `AutomationTrigger.conditions`).

---

## Integração entre Hubs via ACL

Toda referência a outro Hub permanece opaca, sem exceção: `Trigger.sourceDescription` (a origem de um Trigger de categoria `Event`/`DataChange`/`Integration` — ex.: "OpportunityWon", "InvoicePaid" — nunca um `CRMEventType`/`FinEventType` importado), `Action.targetDescription` (o destino de uma Action — ex.: "CRM Hub: CreateLead", "Communication Hub: SendMessage" — nunca um `CRMCommand`/`CommCommand` importado). Nenhum arquivo desta Sprint importa `@abp/crm-hub`, `@abp/communication-hub`, `@abp/content-hub`, `@abp/growth-hub`, `@abp/commerce-hub`, `@abp/finance-hub` ou `@abp/analytics-hub` — confirmado por revisão de cada `import` desta Sprint, nenhuma exceção encontrada.

---

## Resultados da Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos). 138 testes no total (123 antes desta Sprint, 15 novos): `WorkflowService.test.ts` (ciclo de vida Draft→Active→Inactive, versionamento), `WorkflowValidationService.test.ts` (quatro cenários portando a lógica de elegibilidade do legado) e `AutomationManager.test.ts` (oito cenários, cobrindo criação/ativação/desativação com Audit Record, validação bloqueando ativação inválida, resolução de Branch por ordem, Retry→Dead Letter, e a distinção `NoActionTaken`/`Failure`).

---

## Conclusão

Esta Sprint encontrou a paisagem de legado mais complexa de toda a série — não pela ausência ou pela tangencialidade já registradas em Sprints anteriores, mas pela quantidade de falsos cognatos concentrados em um único domínio: sete diretórios diferentes (`automation`, `orchestrator`, `execution`, `execution-engine`, `workflow`, `queue`, `dispatcher`, `pipeline`, `execution-scheduling`) todos usando vocabulário de automação/execução, e apenas um (`automations`, no plural) sendo genuinamente o domínio que `AUTOMATION_ENGINE.md` descreve — os demais pertencem, quase todos, à orquestração de Agente de IA, um mecanismo tecnicamente adjacente mas conceitualmente distinto. Esta Sprint também confirmou a divergência estrutural mais significativa já encontrada: um Hub — mais precisamente, um Engine — sem nenhum catálogo formal de Command ou de Event, delegando ambos os papéis a um único mecanismo já existente, `AuditRecord`, adotado sem inventar vocabulário novo. O Automation Engine agora sabe criar, versionar, validar e ativar um Workflow, resolver qual Branch seguir, processar uma Execution com Retry por design, e nunca confundir "nenhuma ação foi necessária" com "algo falhou" — exatamente o conjunto essencial que o próprio Blueprint já havia priorizado para esta fase, nem mais, nem menos.
