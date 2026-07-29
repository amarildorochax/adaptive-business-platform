# Phase 6 — Automation Engine Architecture Definition

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento define a arquitetura da Phase 6 — Automation Engine, servindo de base para todo o backlog de implementação futuro. Nenhum código foi criado. Nenhum arquivo TypeScript foi criado. Nenhuma API, banco de dado, Runtime, ou Agente foi criado. Nenhuma arquitetura já aprovada foi alterada.*

---

## 0. Enquadramento — Este Documento Não Redefine `AUTOMATION_ENGINE.md`

`docs/architecture/AUTOMATION_ENGINE.md` já é a referência arquitetural oficial (Official) do Automation Engine — Missão, Filosofia, Design Principles, os vinte e dois componentes internos (Capítulo 7), o Modelo de Workflow (Capítulo 8), Triggers (Capítulo 9), Conditions (Capítulo 10), Actions (Capítulo 11), integração com AI Hub, Business Profile Engine e Branding Hub, Eventos, Segurança, Escalabilidade, Observabilidade, doze ADRs, e Glossário. Este documento **não redefine, não altera, e não substitui** nenhum desses princípios.

O papel deste documento é o mesmo já desempenhado por `PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md` em relação a `BUSINESS_HUB_ARCHITECTURE.md`: decompor uma arquitetura-mãe já aprovada — aqui, `AUTOMATION_ENGINE.md` — no escopo específico da Fase do Roadmap em curso, e formalizar o único ponto genuinamente novo desde que aquela arquitetura foi escrita: `AUTOMATION_ENGINE.md` foi redigido quando "AI Hub" era um conceito de contrato externo sem profundidade interna publicada, e quando nenhum Business Hub ainda existia em código. Hoje, após `AI_CORE_INTEGRATION_FINAL_APPROVAL.md` e `PHASE_5_FINAL_VALIDATION.md`, o AI Hub tem onze componentes internos operantes (`@abp/ai`) e cinco Business Hubs têm sua estrutura declarativa implementada (`@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, `@abp/growth-hub`). Este documento formaliza como o Automation Engine, ainda a ser implementado, deve se relacionar com esses artefatos agora concretos, sem jamais atravessar a fronteira que `AUTOMATION_ENGINE.md` já fixou.

### 0.1 Nota sobre a Base Obrigatória

A Base Obrigatória desta Sprint listou seis documentos por nome que, em quatro casos, não correspondem exatamente a arquivo existente. Cada substituição segue o mesmo critério de resolução já aplicado repetidamente desde a Phase 5 — nome real mais próximo, registrado transparentemente:

| Nome citado | Arquivo real usado |
|---|---|
| `FOUNDATION_ARCHITECTURE.md` | Não existe como documento único; usados os quatro catálogos de Volume I (`EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md`, `DOMAIN_OWNERSHIP_MATRIX.md`) e `SPRINT_01_CORE_FOUNDATION_PLAN.md`, por serem o que a Phase 1 efetivamente constitui |
| `INFRASTRUCTURE_ARCHITECTURE.md` | `docs/implementation/INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` |
| `PLATFORM_SERVICES_ARCHITECTURE.md` | `docs/implementation/PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md` |
| `AI_CORE_ARCHITECTURE.md` | `docs/implementation/AI_CORE_ARCHITECTURE_DEFINITION.md` |
| `BUSINESS_HUB_ARCHITECTURE.md` | Já correspondia exatamente |
| `PHASE_5_FINAL_VALIDATION.md` | Não existia como arquivo — o relatório correspondente havia sido entregue apenas em texto de chat; reconstruído nesta mesma sessão como `docs/implementation/PHASE_5_FINAL_VALIDATION.md` antes do início desta Sprint |

Adicionalmente, `docs/architecture/AUTOMATION_ENGINE.md` — a constituição já Official do próprio domínio sendo definido nesta Sprint — não constava na Base Obrigatória, mesma situação já resolvida repetidamente entre a Phase 5 e suas cinco Sprints (`BUSINESS_HUB_ARCHITECTURE.md`, e cada par Blueprint/Hub). Aplicada aqui a mesma resolução padrão já estabelecida: o documento pré-existente que já governa o domínio é tratado como autoridade, nunca redefinido, e sua inclusão é registrada de forma transparente, sem necessidade de nova aprovação para um padrão já repetidamente confirmado.

---

## 1. Objetivo da Phase 6

Definir a arquitetura pela qual o Automation Engine, quando futuramente implementado, executará decisões — determinísticas ou produzidas pelo AI Hub — na forma de Workflows compostos por Trigger, Condition e Action, coordenando os cinco Business Hubs e o AI Core já aprovados, sem jamais incorporar regra de negócio de nenhum Hub e sem jamais executar decisão autônoma em nome de um futuro AI Agent. Este documento não inicia nenhuma implementação — formaliza a arquitetura sobre a qual um futuro backlog de implementação da Phase 6 será decomposto, mesmo papel já desempenhado por `PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md` em relação a `PHASE_5_IMPLEMENTATION_BACKLOG.md`.

---

## 2. Responsabilidades do Automation Engine

Vinculante a `AUTOMATION_ENGINE.md`, Capítulos 2, 4 e 5 — não redefinido aqui:

- Orquestrar Workflow — coordenar quando e como uma ação acontece, nunca decidir, por julgamento próprio, o que fazer diante de uma situação ambígua (Filosofia, Capítulo 4).
- Centralizar toda capacidade de Trigger, Condition, Retry e fila de execução, para que nenhum Hub de domínio implemente sua própria lógica de automação (ADR-006).
- Garantir que toda execução seja previsível, auditável, escalável e desacoplada (Missão, Capítulo 2).
- Transformar decisão — determinística ou produzida pelo AI Hub — em ação real, no momento certo, através do canal certo (Conclusão, Capítulo 23).

O Automation Engine **nunca**: implementa regra de negócio de domínio (isso pertence a cada Business Hub); implementa lógica de decisão inteligente própria (isso pertence exclusivamente ao AI Hub); acessa sistema externo diretamente (isso pertence ao Integration Hub); ou armazena/gera identidade de marca (isso pertence ao Branding Hub).

---

## 3. Bounded Context e Limites do Domínio

O Automation Engine ocupa, na categorização já estabelecida em `SYSTEM_BLUEPRINT.md` e reproduzida em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 1, a camada de Adaptive Intelligence — junto ao Business Profile Engine e ao Branding Hub — nunca a camada de Business Hubs nem a de Platform Services. Ele não representa, ele mesmo, nenhum domínio de negócio reconhecível pelo cliente (como CRM ou Finance), e não é uma capacidade técnica transversal consumida de forma idêntica e opaca por todos (como Identity Hub) — ele é a orquestração que conecta as duas camadas.

**Pertence ao Automation Engine**: Workflow, Trigger, Condition, Action, Branch, Retry Policy, Timeout, Execution, Execution History, Approval, Dead Letter Queue — todos já catalogados em `AUTOMATION_ENGINE.md`, Capítulos 7 a 11.

**Não pertence ao Automation Engine**: nenhuma Entidade de nenhum Business Hub (Customer, Conversation, Invoice, Metric, Campaign — cada uma permanece de propriedade exclusiva do Hub correspondente, conforme já fixado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 9); nenhum componente interno do AI Core (Context, Memory, Orchestrator, Agent Framework, Reasoning, Planning, Skill Runtime, Tool Runtime, Multi-Agent System, AI Governance, AI Observability); nenhuma tecnologia de integração externa (Integration Hub); nenhuma identidade de marca (Branding Hub).

---

## 4. Componentes Internos

Vinculante a `AUTOMATION_ENGINE.md`, Capítulo 7 — os vinte e cinco componentes já lá descritos permanecem o catálogo autoritativo, não redefinido aqui: Automation Manager, Workflow Engine, Workflow Builder, Workflow Validator, Workflow Versioning, Workflow Library, Trigger Manager, Condition Engine, Action Engine, Scheduler, Queue Manager, Retry Manager, Execution Engine, Execution History, Approval Engine, Notification Engine, Template Engine, Integration Connector, Metrics Engine, Audit Engine, Automation Analytics, Automation Preview, Simulation Engine, Rollback Manager, Dead Letter Queue.

Este documento não adiciona, remove, ou renomeia nenhum componente — sua contagem e sua responsabilidade individual permanecem exatamente como já publicadas.

**Nota de correção**: uma versão anterior desta seção afirmava "vinte e dois componentes". `AUTOMATION_ENGINE.md` nunca declara esse número em prosa — a contagem correta, obtida por enumeração direta das vinte e cinco subseções do Capítulo 7, é vinte e cinco. Corrigido nesta revisão, mesmo padrão de verificação já aplicado à contagem de componentes de cada Business Hub na Phase 5.

---

## 5. Contratos Públicos e Modelos de Domínio

Cada um dos modelos abaixo já está integralmente definido em `AUTOMATION_ENGINE.md`; esta seção apenas os referencia, sem redefinição, para satisfazer o Escopo desta Sprint.

| Modelo | Fonte | Síntese vinculante |
|---|---|---|
| **Workflow** | Capítulo 8 | Trigger → Conditions → Branches → Actions → Retries → Timeouts → Success/Failure — nenhuma etapa é pulada, mesmo com valores padrão mínimos |
| **Trigger** | Capítulo 9 | Oito categorias: Tempo, Evento, Manual, Webhook, API, Mudança de dados, IA (resultado do AI Hub), Integrações |
| **Condition** | Capítulo 10 | Operadores lógicos (AND/OR/NOT), Filtros, Datas, Valores, Segmentos, Perfil, Permissões, Estado do Workflow |
| **Action** | Capítulo 11 | Oito categorias: Enviar mensagem, Criar Lead, Atualizar CRM, Gerar relatório, Enviar E-mail, Atualizar Dashboard, Criar tarefa, Executar IA, Acionar integração, Registrar evento |
| **Execution** | Capítulo 7 (Execution Engine, Execution History) | Estado de progresso mantido de forma centralizada e persistente (Stateless Workers); todo resultado registrado como Success ou Failure |
| **Retry** | Capítulo 5 (Retry by Design), Capítulo 7 (Retry Manager), ADR-007 | Toda Action sujeita a falha transitória possui política de nova tentativa definida desde sua concepção, com espera progressiva |
| **Timeout** | Capítulo 8 | Limite de tempo aceitável para uma etapa concluir, delimitando quando uma etapa é considerada travada |
| **Scheduling** | Capítulo 7 (Scheduler), Capítulo 9 (Trigger de Tempo) | Agendamento recorrente, atraso programado, janela de execução — categoria de primeira classe (Time-aware Automation) |
| **Error Handling** | Capítulo 7 (Dead Letter Queue), ADR-011, ADR-012 | Falha definitiva preservada para investigação manual, nunca descartada; Branch não satisfeito é conclusão sem ação, nunca falha |
| **Idempotência** | Capítulo 5, ADR-008 | Execução repetida de uma mesma Action, com o mesmo dado de entrada, nunca produz efeito colateral duplicado |
| **Observabilidade** | Capítulo 18 | Logs, Tracing, Métricas, tempo de execução por etapa individual, Alertas, e o sinal específico de taxa de Conditions não satisfeitas |

---

## 6. Eventos Consumidos e Publicados

`AUTOMATION_ENGINE.md`, Capítulo 15, já fixa que o catálogo de Evento consumido e produzido é o mesmo Event Map de `SYSTEM_BLUEPRINT.md` — este documento não o redefine. O ponto genuinamente novo desta Sprint é vincular essa regra já existente aos catálogos de Evento agora concretos dos cinco Business Hubs:

- **Eventos consumidos**: qualquer Evento publicado por `@abp/crm-hub` (`CRMEventType`, 18 valores), `@abp/communication-hub` (`CommEventType`, 15 valores), `@abp/finance-hub` (`FinEventType`, 19 valores), `@abp/analytics-hub` (`AnalyticsEventType`, 14 valores), ou `@abp/growth-hub` (`GrowthEventType`, 17 valores) é um Trigger candidato — mas o Automation Engine nunca importa esses tipos literais; todo tipo de Evento consumido é referenciado por `string` opaca, mesmo padrão já usado por `AnalyticsEventIngestion.ts` (`@abp/analytics-hub`) para consumir Evento de outro domínio sem dependência estrutural.
- **Eventos publicados**: `AutomationExecuted`, já introduzido em `SYSTEM_BLUEPRINT.md`, é o Evento central; a Action "Registrar evento" (Capítulo 11) permite que um Workflow publique um Evento de domínio mais específico — sempre como Fato já consumado, nunca uma instrução, mesmo princípio Publish Facts, Not Commands já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`.

---

## 7. Integração com AI Core (Somente Contratos Públicos)

`AUTOMATION_ENGINE.md`, Capítulo 12, já fixa que o Automation Engine solicita inteligência ao AI Hub "exatamente da mesma forma que qualquer outro Hub de domínio", através da Action Executar IA. Na época em que aquele capítulo foi escrito, "AI Hub" não tinha profundidade interna publicada. Hoje, o AI Hub é sustentado por onze componentes internos operantes em `@abp/ai` (`AI_CORE_ARCHITECTURE_DEFINITION.md`).

Este documento formaliza a mesma regra já aplicada a todo Business Hub em `PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`, Seção 7.1, agora estendida ao Automation Engine: **a Action Executar IA consome exclusivamente o contrato externo do AI Hub — nunca nenhum dos onze componentes internos do AI Core (Context, Memory, Orchestrator, Agent Framework, Reasoning, Planning, Skill Runtime, Tool Runtime, Multi-Agent System, AI Governance, AI Observability) individualmente.** O Automation Engine nunca importa `@abp/ai`. O resultado da Action Executar IA é tratado como dado estruturado de entrada para a etapa seguinte do Workflow, nunca reinterpretado por lógica própria — exatamente como já fixado em `AUTOMATION_ENGINE.md`, Capítulo 12.

---

## 8. Integração com Business Hubs (Somente Eventos Públicos)

Na época em que `AUTOMATION_ENGINE.md` foi escrito, nenhum Business Hub existia em código. Hoje, os cinco já têm sua estrutura declarativa implementada, cada um com seu próprio catálogo de `Command`/`Query`/`Event` (`CRMCommand`/`CRMQuery`/`CRMEvent`, e equivalentes para os quatro demais). Este documento formaliza a mesma regra já aplicada entre os próprios Business Hubs: **o Automation Engine consome Evento público de qualquer Business Hub, e invoca Action que, por sua vez, aciona Command de um Business Hub (ex.: "Criar Lead", "Atualizar CRM") — sempre por identificador opaco (`string`), nunca por import de `CRMCommandType`, `FinCommandType`, ou qualquer tipo literal de `@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, ou `@abp/growth-hub`.** Nenhuma regra de negócio de nenhum Hub é movida para o Automation Engine — a Action apenas aciona o Command já existente; a validação e a regra de negócio permanecem exclusivamente dentro do Hub de destino, conforme já fixado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14, e em `AUTOMATION_ENGINE.md`, Capítulo 3 ("Automação nunca pertence aos módulos" opera nas duas direções: nem o módulo implementa automação, nem o Automation Engine implementa regra do módulo).

---

## 9. Integração com Platform Services

Vinculante a `AUTOMATION_ENGINE.md`, Capítulo 16 (Segurança) — não redefinido: o Identity Hub autentica e autoriza toda criação, edição e ativação de Workflow, e toda Action que exige autorização específica, através do contrato externo já detalhado em `IDENTITY_HUB.md`. O Integration Hub é a única via pela qual uma Action alcança sistema externo (Capítulo 11, "Acionar integração"; ADR-010). Mesma regra já aplicada aos cinco Business Hubs: consumo exclusivamente por identificador opaco, nunca por import de `@abp/platform-services`.

---

## 10. Limites em Relação ao Runtime

Este documento define arquitetura, nunca implementação. Nenhum Execution Engine, Scheduler, Queue Manager, ou Worker real é criado por esta Sprint — cada um permanece, nesta etapa, um componente catalogado (Seção 4), não uma peça de software em execução. A decisão de tecnologia concreta de fila, de persistência de estado de execução, ou de mecanismo de agendamento permanece, como já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 12, "disciplina de `IMPLEMENTATION_GUIDELINES.md`, aplicada Sprint a Sprint" — nunca decidida por um documento arquitetural.

---

## 11. Limites em Relação aos Futuros AI Agents

`AI_CORE_ARCHITECTURE_DEFINITION.md` já formaliza Agent Framework (Component 18) e Multi-Agent System (Component 23) como parte do AI Core, com o princípio já auditado em `AI_CORE_INTEGRATION_ARCHITECTURAL_AUDIT.md`, Seção 5, de que nenhum Agente coordena outro diretamente — toda coordenação passa pelo Orchestrator. O Automation Engine nunca invoca um Agente diretamente, e nunca delega a um Agente a decisão de iniciar, ramificar, ou encerrar um Workflow — essa decisão permanece exclusivamente do Condition Engine e do próprio desenho declarativo do Workflow. Quando um Workflow precisa de capacidade de Agente, ele o faz exclusivamente através da mesma Action Executar IA já descrita na Seção 7 — o resultado retorna como dado estruturado, nunca como um Agente operando com autonomia dentro do próprio Automation Engine. Um futuro AI Agent, portanto, nunca é um executor alternativo de Workflow — ele é, no máximo, um provedor de resultado consumido por uma Action já existente.

---

## 12. Princípios de Escalabilidade, Extensibilidade e Isolamento

Vinculante a `AUTOMATION_ENGINE.md`, Capítulos 5 e 17 — não redefinido:

- **Escalabilidade**: Workers paralelos e escaláveis, Filas absorvendo pico de demanda, Execução paralela entre Workflows, Particionamento por Tenant, Alta disponibilidade com estado persistente centralizado (Stateless Workers).
- **Extensibilidade**: Composable Workflows — um Workflow pode invocar outro já validado como parte de sua própria sequência de Actions, permitindo reuso sem duplicação.
- **Isolamento**: Failure Isolation (ADR-009) — a falha de uma execução nunca compromete outra; Queue Driven — toda execução passa por fila antes de processamento, nunca bloqueando a publicação de novos Eventos.

Nenhum desses princípios é implementado por este documento — permanecem compromissos arquiteturais já fixados, aqui apenas reafirmados como aplicáveis à Phase 6.

---

## 13. Regras de Governança

- Nenhum Workflow é aceito sem passar pelo Workflow Validator (Capítulo 7) — verificação de consistência interna, ausência de ciclo lógico, antes de qualquer ativação.
- Toda Action de alto impacto exige aprovação humana explícita através do Approval Engine, sem exceção (ADR-005, Human Approval When Needed).
- Toda mudança de Workflow, e toda decisão de aprovação, é preservada de forma imutável pelo Audit Engine (Capítulo 16).
- O risco arquitetural já registrado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6 — Automation Engine "construído sobre Evento e Command já reais de ao menos um Business Hub, e sobre o AI Core já operante" — está satisfeito: os cinco Business Hubs (`PHASE_5_FINAL_VALIDATION.md`, APPROVED WITH OBSERVATIONS) e o AI Core (`AI_CORE_INTEGRATION_FINAL_APPROVAL.md`, APPROVED) já estão aprovados.
- A direção de dependência já fixada em `GATE_G2_IMPLEMENTATION_ROADMAP.md` permanece: Automation → AI, nunca AI → Automation.
- Toda mudança estrutural a esta arquitetura, ou a `AUTOMATION_ENGINE.md`, segue o Architecture Decision Flow já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 11.

---

## 14. Dependências Permitidas

- Sequenciamento de Fase: Foundation → Infrastructure → Platform Services → AI Core → Business Hubs → **Automation Engine**.
- Consumo do contrato externo do AI Hub (Action Executar IA), nunca dos onze componentes internos do AI Core.
- Consumo de Evento público de qualquer um dos cinco Business Hubs, sempre por identificador opaco (`string`).
- Invocação de Command de Business Hub através de Action, sempre por identificador opaco, nunca por import de tipo.
- Consumo do contrato externo de Identity Hub (autorização) e de Integration Hub (comunicação externa), ambos Platform Services.
- Consumo do contrato externo de Branding Hub (identidade de comunicação) e de Business Profile Engine (Segmento, Maturidade), ambos Adaptive Intelligence.

## 15. Dependências Proibidas

- Import de tipo de qualquer um dos onze componentes internos do AI Core (`@abp/ai`).
- Import de tipo de qualquer um dos cinco pacotes de Business Hub (`@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, `@abp/growth-hub`).
- Import de `@abp/platform-services` além do contrato externo já autorizado.
- Implementação de regra de negócio de domínio dentro de um Workflow (pertence ao Business Hub correspondente).
- Implementação de lógica de decisão inteligente própria (pertence exclusivamente ao AI Hub).
- Chamada direta e síncrona bloqueante a um Business Hub — toda comunicação é por Evento consumido ou por Action mediada.
- Delegação de controle de Workflow a um Agente autônomo (Seção 11).
- Qualquer tecnologia concreta de fila, banco de dado, ou runtime definida por este documento.

---

## 16. Conformidade com as Phases 1–5

| Fase | Verificação |
|---|---|
| Phase 1 — Foundation | Nenhum novo Command, Evento, ou Query é definido por este documento além dos já catalogados; toda referência a Ownership permanece consistente com `DOMAIN_OWNERSHIP_MATRIX.md` |
| Phase 2 — Infrastructure | Nenhuma tecnologia concreta de fila, cache, ou observabilidade é definida — permanece substrato já descrito em `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md`, não redefinido |
| Phase 3 — Platform Services | Identity Hub e Integration Hub consumidos exclusivamente por contrato externo, consistente com `PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md` |
| Phase 4 — AI Core | AI Hub consumido exclusivamente pelo contrato externo (Seção 7), nunca pelos onze componentes internos já aprovados em `AI_CORE_ARCHITECTURE_DEFINITION.md` |
| Phase 5 — Business Hubs | Nenhuma regra de negócio de nenhum dos cinco Hubs é absorvida (Seção 8); cada Hub permanece dono exclusivo de suas Entidades, consistente com `PHASE_5_FINAL_VALIDATION.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | PHASE 6 ARCHITECTURE DEFINED |
| Version | 1.0 |
| Author | Claude |
