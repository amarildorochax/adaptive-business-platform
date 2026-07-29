# Runtime Architecture Definition

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento define a arquitetura oficial do Runtime da Adaptive Business Platform. Nenhum código foi criado. Nenhum arquivo TypeScript foi criado. Nenhum Runtime executável foi criado. Nenhuma arquitetura já aprovada foi alterada.*

---

## 0. Enquadramento

### 0.1 Este Documento Não É a Phase 7

`GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6, já fixa a Phase 7 como **Dashboard** — "Experience Layer e Presentation Layer, integrando AI Core e Business Hubs já operantes." Este documento não reivindica esse lugar no Roadmap. Mesma resolução já aplicada quando um documento de integração do AI Core foi inicialmente solicitado como "Phase 5": renomeado para evitar conflito com a Fase que o Roadmap já atribui a outro escopo. Este documento é intitulado `RUNTIME_ARCHITECTURE_DEFINITION.md`, sem prefixo de Fase, e define uma camada transversal consumida por — mas nunca substituta de — Foundation, Infrastructure, Platform Services, AI Core, Business Hubs e Automation Engine, todos já aprovados.

### 0.2 Nota sobre a Base Obrigatória

Mesma situação já resolvida durante a Phase 6: quatro dos oito nomes citados não correspondem a arquivo existente. Mesmas substituições já aplicadas, reaplicadas aqui sem nova aprovação:

| Nome citado | Fonte real usada |
|---|---|
| `FOUNDATION_ARCHITECTURE.md` | Os quatro catálogos de Volume I (`EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md`, `DOMAIN_OWNERSHIP_MATRIX.md`) e `SPRINT_01_CORE_FOUNDATION_PLAN.md` |
| `INFRASTRUCTURE_ARCHITECTURE.md` | `docs/implementation/INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` |
| `PLATFORM_SERVICES_ARCHITECTURE.md` | `docs/implementation/PLATFORM_SERVICES_ARCHITECTURE_DEFINITION.md` |
| `AI_CORE_ARCHITECTURE.md` | `docs/implementation/AI_CORE_ARCHITECTURE_DEFINITION.md` |
| `BUSINESS_HUBS_ARCHITECTURE.md` (plural, citado) | `docs/architecture/BUSINESS_HUB_ARCHITECTURE.md` (singular, único arquivo real) |
| `AUTOMATION_ENGINE.md` | Já correspondia exatamente |
| `PHASE_6_FINAL_VALIDATION.md` | Já correspondia exatamente |
| `VOLUME_II_FOUNDATIONAL_DECISIONS.md` | Já correspondia exatamente |

### 0.3 Não Existe Autoridade Pré-Existente para "Runtime"

Diferente de `AUTOMATION_ENGINE.md` e de `BUSINESS_HUB_ARCHITECTURE.md`, nenhum documento Volume I ou Volume II já publicado define um "Runtime" como conceito próprio no sentido tratado aqui — camada transversal de hospedagem de execução. Os únicos artefatos com "Runtime" no nome já existentes são Skill Runtime e Tool Runtime (Components 21 e 22 do AI Core, `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.7–7.8), que tratam exclusivamente da execução de Skill e de Tool *dentro* do AI Core — um conceito distinto e não redefinido por este documento. Este documento, portanto, não decompõe uma arquitetura-mãe já aprovada — define, de forma original e restrita ao Escopo desta Sprint, uma camada nova, aplicando com o máximo rigor o princípio "não criar novos conceitos além do estritamente necessário" já demonstrado em toda esta série.

---

## 1. Objetivo

Definir a camada de Runtime como o substrato genérico de hospedagem de execução consumido por Automation Engine, por AI Core, e por Business Hubs — nunca redefinindo o modelo de Workflow do Automation Engine, nunca movendo regra de negócio de nenhum Business Hub, e nunca acessando componente interno do AI Core. O Runtime responde "como uma solicitação é recebida, contextualizada, encaminhada e observada", nunca "o que fazer com ela" — essa segunda pergunta permanece, em todos os casos, respondida pelo domínio de destino.

---

## 2. Responsabilidades do Runtime

- Receber toda solicitação de execução — um Trigger já resolvido pelo Automation Engine, um Command ou Query de um Business Hub, ou uma solicitação de decisão do AI Core — e estabelecer um Execution Context antes de qualquer processamento de domínio começar.
- Encaminhar (Dispatch) essa solicitação ao componente de domínio responsável, sem decidir, ele mesmo, nenhuma lógica de negócio ou de automação.
- Manter o ciclo de vida técnico de uma execução — recebida, contextualizada, encaminhada, em processamento, concluída ou falha — em um nível de abstração abaixo do ciclo de vida de Workflow já definido pelo Automation Engine.
- Aplicar isolamento entre execuções concorrentes, e retry em nível de transporte/processo quando o próprio encaminhamento falha por motivo transitório — distinto do Retry de Action já definido pelo Automation Engine.
- Observar toda execução de forma consistente com o padrão já estabelecido para toda a plataforma.

O Runtime **nunca**: define ou resolve qual Workflow reage a um Evento (Workflow Engine, Automation Engine); define ou aplica Regra de negócio de nenhum Business Hub; implementa lógica de decisão inteligente (AI Hub); acessa componente interno do AI Core; ou redefine o modelo de Retry, de Timeout, ou de Execution já publicado por `AUTOMATION_ENGINE.md` e já implementado em `@abp/automation-engine`.

---

## 3. Bounded Context

**Pertence ao Runtime**: Execution Context, Execution Lifecycle (nível de processo/transporte), Dispatch, Runtime Retry (nível de transporte), Runtime Isolation Boundary.

**Não pertence ao Runtime**: Workflow, Trigger, Condition, Action, Execution (nível de Workflow), Retry Policy de Action, Approval Checkpoint — todos já de propriedade exclusiva do Automation Engine (`AUTOMATION_ENGINE.md`; `@abp/automation-engine`); nenhuma Entidade de nenhum Business Hub; nenhum componente interno do AI Core.

O Runtime relaciona-se com o Automation Engine da mesma forma que a Infrastructure Layer já se relaciona com todo Hub de domínio em `SYSTEM_BLUEPRINT.md` — como substrato consumido, nunca como autoridade de domínio.

---

## 4. Componentes Internos

Um conjunto deliberadamente pequeno, proporcional ao fato de o Runtime ser uma camada transversal de hospedagem, não um domínio de negócio ou de automação:

| Componente | Responsabilidade |
|---|---|
| **Runtime Manager** | Ponto de entrada único de toda solicitação de execução, equivalente em função ao Automation Manager e a cada Manager central já descrito nos documentos anteriores — não contém lógica de negócio nem de automação. |
| **Execution Context Manager** | Estabelece e propaga o Execution Context (Seção 11) por toda a vida de uma execução. |
| **Dispatcher** | Encaminha a solicitação já contextualizada ao componente de domínio responsável — Automation Engine, um Business Hub, ou o AI Hub — sem decidir, ele mesmo, qual Workflow, qual Regra, ou qual resposta é apropriada. |
| **Runtime Retry Coordinator** | Aplica nova tentativa de nível de transporte quando o próprio Dispatch falha por motivo transitório, antes de a solicitação alcançar seu destino — nunca a Retry Policy de uma Action já em execução, que permanece exclusiva do Retry Manager do Automation Engine. |
| **Runtime Isolation Boundary** | Garante que a falha de uma execução nunca comprometa outra execução concorrente, no mesmo nível de abstração já aplicado ao Failure Isolation do Automation Engine, mas na camada de hospedagem, não na camada de Workflow. |
| **Runtime Observability Collector** | Produz Logs, Tracing e Métricas de nível de execução, consistentes com o padrão já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13, e complementares — nunca duplicados — aos já produzidos pelo Metrics Engine do Automation Engine. |

Nenhum destes componentes é implementado por este documento — permanecem, nesta etapa, exclusivamente conceituais.

---

## 5. Contratos Públicos (Conceituais)

Nenhum contrato TypeScript é criado por este documento. Os contratos abaixo são descritos apenas em nível conceitual, para uso em uma futura Architecture Definition de implementação:

- **Execution Context** — identificador de correlação, Tenant, Identidade solicitante (opaca, referência ao Identity Hub), e momento de início — propagado por toda a vida de uma execução.
- **Execution Lifecycle State** — Received → Context Established → Dispatched → Running → Completed | Failed — nível de processo, distinto e mais genérico que o Execution do Automation Engine (Trigger → Conditions → Branches → Actions → Retries → Timeouts → Success/Failure).
- **Dispatch Result** — registro de que uma solicitação já contextualizada foi encaminhada a um destino específico (Automation Engine, um Business Hub, ou o AI Hub), e se esse encaminhamento foi bem-sucedido.

---

## 6. Ciclo de Vida de Execução

```
Received
   │  solicitação recebida (Trigger já resolvido, Command, Query, ou solicitação ao AI Hub)
   ▼
Context Established
   │  Execution Context Manager propaga correlação, Tenant e Identidade
   ▼
Dispatched
   │  Dispatcher encaminha ao componente de domínio responsável
   ▼
Running
   │  processamento de domínio em curso — responsabilidade exclusiva do destino
   ▼
Completed / Failed
   registro final de nível de execução, complementar ao Execution History
   do Automation Engine quando o destino for um Workflow
```

Este ciclo de vida é estritamente mais genérico que o já publicado em `AUTOMATION_ENGINE.md`, Capítulo 8 — ele hospeda aquele ciclo, nunca o substitui. Uma execução cujo destino é o Automation Engine permanece em "Running", do ponto de vista do Runtime, durante todo o tempo em que o Workflow correspondente atravessa seu próprio ciclo de vida completo (Trigger → ... → Success/Failure).

---

## 7. Resolução de Workflows

O Runtime nunca resolve qual Workflow reage a um Evento — essa responsabilidade permanece exclusiva do Workflow Engine, já implementado em `@abp/automation-engine` (Sprint 6.1). O papel do Runtime é exclusivamente reconhecer que uma solicitação recebida é candidata a acionar o Automation Engine, estabelecer o Execution Context correspondente, e encaminhá-la ao Workflow Engine através do Dispatcher — a decisão de qual Workflow, e se as Conditions se aplicam, permanece inteiramente dentro do Automation Engine.

---

## 8. Coordenação com Automation Engine

O Runtime hospeda a execução do Automation Engine, nunca a redefine. Toda referência do Runtime a conceitos já publicados em `AUTOMATION_ENGINE.md` e já implementados em `@abp/automation-engine` — Workflow, Trigger, Condition, Action, Execution, Execution Step, Retry Policy, Approval Checkpoint — é feita exclusivamente por identificador opaco, nunca por import de tipo, mesma disciplina já aplicada entre todo par de componentes desta plataforma desde a Sprint 4. O Runtime Retry Coordinator (Seção 4) opera estritamente antes de uma solicitação alcançar o Automation Engine — uma vez que o Dispatch é bem-sucedido, toda semântica de Retry subsequente pertence exclusivamente ao Retry Manager já implementado naquele pacote.

---

## 9. Consumo dos Contratos Públicos do AI Core

Mesma regra já fixada em `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, Seção 7, e em `PHASE_5_BUSINESS_HUBS_ARCHITECTURE_DEFINITION.md`, Seção 7.1, agora estendida ao Runtime: **o Dispatcher encaminha uma solicitação de inteligência exclusivamente ao contrato externo do AI Hub — nunca a nenhum dos onze componentes internos do AI Core** (Context, Memory, Orchestrator, Agent Framework, Reasoning, Planning, Skill Runtime, Tool Runtime, Multi-Agent System, AI Governance, AI Observability). O Runtime nunca importa `@abp/ai`. Consistente com `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 007: o Runtime consome o AI Hub no mesmo nível de altitude em que `AI_HUB.md` responde "qual é o contrato deste subsistema com o restante da plataforma" — nunca no nível em que Volume II responde "como esse subsistema funciona por dentro".

---

## 10. Consumo dos Contratos Públicos dos Business Hubs

O Dispatcher encaminha Command e Query exclusivamente aos contratos já publicados de cada Business Hub (`CRMCommand`/`CRMQuery`, `CommCommand`/`CommQuery`, `FinCommand`/`FinQuery`, `AnalyticsCommand`/`AnalyticsQuery`, `GrowthCommand`/`GrowthQuery`), sempre por identificador opaco — nunca por import de `@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, ou `@abp/growth-hub`. Nenhuma regra de negócio de nenhum Hub é movida para o Runtime — o Dispatcher apenas encaminha; a validação e a Regra de negócio permanecem exclusivamente dentro do Hub de destino, mesmo princípio já fixado em `PHASE_6_AUTOMATION_ENGINE_ARCHITECTURE_DEFINITION.md`, Seção 8, agora estendido a uma camada mais genérica.

---

## 11. Gerenciamento de Contexto de Execução

O Execution Context, estabelecido pelo Execution Context Manager antes de qualquer Dispatch, carrega: um identificador de correlação (propagado por toda a cadeia de execução, incluindo através de um eventual Workflow do Automation Engine); o Tenant ao qual a execução pertence, preservando o isolamento multiempresa já estabelecido em `SAAS_ARCHITECTURE.md`; e a Identidade solicitante, referenciada por identificador opaco ao Identity Hub, nunca por import de `@abp/platform-services`. Nenhum dado de domínio é armazenado no Execution Context — ele carrega apenas o necessário para rastreabilidade e para autorização, nunca a Entidade de negócio em si.

---

## 12. Observabilidade

O Runtime Observability Collector produz Logs, Tracing e Métricas de nível de execução — volume de solicitação recebida, latência de Dispatch, taxa de sucesso de encaminhamento —, consistentes com o padrão estrutural já estabelecido em `SYSTEM_BLUEPRINT.md`, Capítulo 13, e com o já detalhado em `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md`. Este sinal é complementar, nunca duplicado, ao já produzido pelo Metrics Engine e pelo Automation Analytics do Automation Engine (`AUTOMATION_ENGINE.md`, Capítulo 18) — o Runtime observa o encaminhamento; o Automation Engine observa a execução do Workflow em si.

---

## 13. Tratamento de Falhas e Retry em Tempo de Execução

Duas camadas de falha, deliberadamente distintas e nunca confundidas:

- **Falha de Dispatch** (nível de Runtime): o encaminhamento de uma solicitação ao seu destino falha por motivo transitório — o Runtime Retry Coordinator aplica nova tentativa antes de a solicitação alcançar qualquer lógica de domínio. Uma falha definitiva de Dispatch é registrada no Execution Lifecycle State como `Failed`, nunca propagada como se fosse uma falha de Workflow.
- **Falha de domínio** (nível de Automation Engine, de Business Hub, ou de AI Core): uma vez que o Dispatch é bem-sucedido, toda falha subsequente — falha de Action, rejeição de Validation, erro de processamento — permanece de responsabilidade exclusiva do componente de destino, já com seu próprio mecanismo já publicado (Retry Manager e Dead Letter Queue do Automation Engine; Validation Result de cada Business Hub).

O Runtime nunca reinterpreta ou reprocessa uma falha já sinalizada por um componente de domínio como se fosse sua própria responsabilidade corrigi-la.

---

## 14. Isolamento entre Execuções

O Runtime Isolation Boundary garante que a falha, ou o volume excepcional, de uma execução específica nunca comprometa outra execução concorrente — mesmo princípio Failure Isolation já estabelecido em `AUTOMATION_ENGINE.md`, Capítulo 5, e em `BUSINESS_HUB_ARCHITECTURE.md`, agora aplicado explicitamente à camada de hospedagem que antecede ambos. Duas execuções do mesmo Tenant, ou de Tenants distintos, nunca compartilham Execution Context.

---

## 15. Princípios de Escalabilidade

Vinculante aos princípios já fixados em `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` e em `AUTOMATION_ENGINE.md`, Capítulo 17 — não redefinidos aqui: escalabilidade horizontal por volume de execução concorrente; particionamento por Tenant; alta disponibilidade através de Execution Context persistente, nunca retido apenas na memória local de uma instância (Stateless Workers, já aplicado ao Runtime pela mesma razão já aplicada ao Automation Engine).

---

## 16. Governança

Toda mudança estrutural a esta arquitetura segue o mesmo Architecture Decision Flow já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 11. Nenhuma decisão de tecnologia concreta de hospedagem, de transporte, ou de observabilidade é tomada por este documento — permanece disciplina de `IMPLEMENTATION_GUIDELINES.md`, aplicada Sprint a Sprint, mesmo princípio já fixado em toda Fase anterior desta plataforma.

---

## 17. Limites Arquiteturais

- O Runtime nunca redefine o modelo de Workflow, Trigger, Condition, Action, Execution, Retry, ou Approval já publicado por `AUTOMATION_ENGINE.md` e já implementado em `@abp/automation-engine`.
- O Runtime nunca move Regra de negócio de nenhum Business Hub para si.
- O Runtime nunca acessa componente interno do AI Core.
- O Runtime nunca introduz nova dependência entre domínios já existentes — ele apenas hospeda a comunicação já permitida entre eles.

---

## 18. Dependências Permitidas

- Sequenciamento: Foundation → Infrastructure → Platform Services → AI Core → Business Hubs → Automation Engine → **Runtime** (camada transversal, consumida por todos, mas posicionada, em termos de maturidade de dependência, após o Automation Engine, cuja hospedagem é seu caso de uso mais imediato).
- Consumo do contrato externo do AI Hub, nunca dos onze componentes internos.
- Consumo dos contratos de Command/Query/Event já publicados por qualquer Business Hub, sempre por identificador opaco.
- Consumo dos contratos de Workflow/Trigger/Condition/Action/Execution já publicados pelo Automation Engine, sempre por identificador opaco.
- Consumo do contrato externo de Identity Hub (autorização) e de Integration Hub (comunicação externa), ambos Platform Services.

## 19. Dependências Proibidas

- Import de tipo de qualquer um dos onze componentes internos do AI Core (`@abp/ai`).
- Import de tipo de qualquer um dos cinco pacotes de Business Hub.
- Import de tipo de `@abp/automation-engine` além do estritamente necessário por identificador opaco.
- Implementação de Regra de negócio de domínio.
- Implementação de lógica de decisão inteligente própria.
- Redefinição de qualquer modelo já publicado por `AUTOMATION_ENGINE.md`.
- Qualquer tecnologia concreta de hospedagem, transporte, ou persistência definida por este documento.

---

## 20. Conformidade com as Phases 1–6

| Fase | Verificação |
|---|---|
| Phase 1 — Foundation | Nenhum novo Command, Evento, ou Query definido; Execution Context nunca substitui Ownership já catalogado |
| Phase 2 — Infrastructure | Observabilidade e escalabilidade do Runtime vinculadas, não redefinidas, a `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md` |
| Phase 3 — Platform Services | Identity Hub e Integration Hub consumidos exclusivamente por contrato externo |
| Phase 4 — AI Core | AI Hub consumido exclusivamente pelo contrato externo, nunca pelos onze componentes internos |
| Phase 5 — Business Hubs | Nenhuma regra de negócio de nenhum dos cinco Hubs é absorvida pelo Runtime |
| Phase 6 — Automation Engine | Nenhum modelo (Workflow, Trigger, Condition, Action, Execution, Retry, Approval) é redefinido — o Runtime apenas hospeda sua execução |

---

## Approval

| Campo | Valor |
|---|---|
| Status | RUNTIME ARCHITECTURE DEFINED |
| Version | 1.0 |
| Author | Claude |
