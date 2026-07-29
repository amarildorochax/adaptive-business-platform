# Component 18 — Agent Framework Design

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento inicia, para o Component 18 — Agent Framework (quarto componente da Sprint 4 — AI Core, sucedendo Orchestrator), a mesma cadeia documental já consolidada nas Sprints anteriores e nos Components 15, 16 e 17.*

---

## Objective

Documentar o design do componente Agent Framework, cuja responsabilidade já está fixada em `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.4: *"definir a unidade Agente — contrato, arquitetura interna, ciclo de vida"* — fundamentado em `AGENT_FRAMEWORK.md` (Official, 21 capítulos) e registrado em `SPRINT_04_IMPLEMENTATION_BACKLOG.md` como Component 18.

---

## Scope

**Dentro do escopo**: exclusivamente os três elementos já declarados para este componente em `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.4: Agent Contract (Capítulo 5, dezessete elementos), Arquitetura Interna (Capítulo 6, sete componentes internos), Lifecycle (Capítulo 7, nove estágios).

**Fora do escopo**: Contexto (Capítulo 8) e Memória (Capítulo 9) — já implementados como componentes próprios (Context, Component 15; Memory, Component 16); Planejamento (Capítulo 10) e Raciocínio (Capítulo 11) — pertencem aos componentes Planning (Component 20) e Reasoning (Component 19); Capabilities como capítulo dedicado (Capítulo 12), Skills (Capítulo 13), Ferramentas (Capítulo 14), Comunicação (Capítulo 15) — pertencem aos componentes Skill Runtime (Component 21), Tool Runtime (Component 22) e Multi-Agent System (Component 23); qualquer LLM, Provider, execução real de prompt, chamada de API, Ferramenta concreta, comunicação de rede, banco de dados, framework, ou biblioteca externa.

---

## Architectural Context

Agent Framework é o quarto componente da Sprint 4 — AI Core, sucedendo Orchestrator (Component 17, já concluído), do qual depende (`SPRINT_04_IMPLEMENTATION_BACKLOG.md`, Seção 4; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 8).

Fundamentação em `AGENT_FRAMEWORK.md`: Agent Contract (Capítulo 5) — dezessete elementos obrigatórios (Identity, Mission, Responsibilities, Capabilities, Permissions, Execution Policies, Memory Access, Context Access, Planning Interface, Reasoning Interface, Skill Invocation, Tool Access, Observability, Response Contract, Lifecycle, Version, Governance), agrupáveis em quatro grupos funcionais (identidade/propósito, limites de acesso, processamento, administração); Arquitetura Interna (Capítulo 6) — sete componentes internos (Identity, Reasoning Engine, Planning Component, Capability Consumer, Skill Invocation, Tool Adapter, Structured Response — Context e Memory operam como entradas externas de componentes já implementados, não como componentes internos próprios do Agente, conforme já esclarecido na nota de contagem abaixo); Lifecycle (Capítulo 7) — nove estágios (Criação, Registro, Inicialização, Execução, Pausa, Retomada, Atualização, Desativação, Aposentadoria).

**Nota de contagem dos componentes internos**: `AGENT_FRAMEWORK.md`, Capítulo 6, afirma textualmente haver "sete componentes internos" mas o diagrama do mesmo capítulo nomeia nove blocos (Identity, Context, Memory, Reasoning Engine, Planning Component, Capability Consumer, Skill Invocation, Tool Adapter, Structured Response). A reconciliação, já consistente com a exclusão de Contexto e Memória do escopo deste componente (ambos já implementados como Components 15 e 16), é que Context e Memory operam como *entradas* consumidas pelo Agente, não como componentes *internos* próprios contados entre os sete — Identity, Reasoning Engine, Planning Component, Capability Consumer, Skill Invocation, Tool Adapter e Structured Response somam exatamente sete.

**Relação com a Foundation e com os componentes já implementados**: nenhum contrato da Foundation é redefinido. Nenhum artefato de Context, Memory, ou Orchestrator é duplicado ou importado — Agent Framework referencia Contexto, Memória, Capability e Execution Policy exclusivamente por identificador opaco (`string`), preservando a independência entre componentes já estabelecida no Component 17.

---

## Design Principles

- **Contrato completo e obrigatório** — nenhum Agente é registrado sem satisfazer integralmente os dezessete elementos do Agent Contract (Capítulo 5).
- **Single Version Active** — nenhuma Atualização coexiste ambiguamente com a versão anterior para a mesma solicitação (Capítulo 4, Capítulo 7).
- **Arquitetura interna completa mesmo quando parcialmente dispensável** — nenhum Agente é especificado sem todos os sete componentes internos, mesmo quando um deles é raramente ativado (Capítulo 6).
- **Desativação é reversível, Aposentadoria é irreversível** — distinção estrita entre os dois estágios finais do Lifecycle (Capítulo 7).
- **Ausência de mecanismo concreto** — nenhum LLM, Provider, ou execução real.

---

## Out of Scope

- Contexto e Memória como estruturas próprias (Capítulos 8 e 9) — já implementados como Components 15 e 16.
- Planejamento e Raciocínio como componentes próprios (Capítulos 10 e 11) — Components 20 e 19, ainda não implementados.
- Capabilities como capítulo dedicado, Skills, Ferramentas, Comunicação (Capítulos 12–15) — Components 21, 22, 23, ainda não implementados.
- Qualquer LLM, Provider, execução real de prompt, chamada de API, Ferramenta concreta, comunicação de rede, banco de dados, framework, ou biblioteca externa.
- Escolha de linguagem, framework, ou tecnologia.

---

## Design Decisions

| Decisão | Fonte já aprovada |
|---|---|
| Agent Framework é o Component 18, quarto componente da Sprint 4, depende de Orchestrator | `SPRINT_04_IMPLEMENTATION_BACKLOG.md`, Seção 3; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 8 |
| Agent Framework reside no agrupamento AI, pacote `@abp/ai` (já criado pelos Components 15–17) | `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.4 |
| Três elementos de escopo: Agent Contract, Arquitetura Interna, Lifecycle | `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.4 |
| Sete componentes internos (Identity, Reasoning Engine, Planning Component, Capability Consumer, Skill Invocation, Tool Adapter, Structured Response) — Context e Memory contados como entrada, não como componente interno | `AGENT_FRAMEWORK.md`, Capítulo 6 |

---

## Traceability

| Seção | Fonte |
|---|---|
| Objective / Scope | `AGENT_FRAMEWORK.md`, Capítulos 5–7; `AI_CORE_ARCHITECTURE_DEFINITION.md`, Seção 7.4 |
| Architectural Context | `SPRINT_04_IMPLEMENTATION_BACKLOG.md`; `AI_HUB.md` |
| Design Principles | `AGENT_FRAMEWORK.md`, Capítulo 4 |

---

## Approval

| Campo | Valor |
|---|---|
| Status | DESIGN DOCUMENT APPROVED |
| Version | 1.0 |
| Author | Claude |
