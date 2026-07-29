# Component 01 — Package Structure

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento projeta a Package Structure da Adaptive Business Platform, utilizando exclusivamente a arquitetura oficial já aprovada. Ele não escreve código, não cria arquivo ou diretório real, não escolhe tecnologia, não assume linguagem, e não assume framework. Ele é o artefato de Planejamento do primeiro componente da Sprint 1, conforme o Validation Workflow já definido em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 6.*

---

## 1. Objective

Projetar a organização lógica de pacotes e módulos da plataforma de forma que ela reflita, sem ambiguidade, as fronteiras de domínio já fixadas em `DOMAIN_OWNERSHIP_MATRIX.md`, o padrão de Business Hub já fixado em `BUSINESS_HUB_ARCHITECTURE.md`, e a topologia de doze camadas já fixada em `AI_ARCHITECTURE.md` — de modo que todo módulo já catalogado em Volume I e em Volume II tenha um espaço reservado e inequívoco antes que qualquer código seja escrito, e que nenhum módulo futuro precise reestruturar o que aqui for definido.

---

## 2. Responsibilities

**Pertence à Package Structure:**
- Definir onde cada módulo já catalogado — cada Business Hub, cada Platform Service Hub, o núcleo de Volume II, o Automation Engine — reside, de forma que sua localização seja previsível e única.
- Garantir que a fronteira entre Core/Shared (agnóstico de negócio) e Business (proprietário de domínio) seja visível na própria organização de pacotes, não apenas na documentação.
- Garantir que nenhum agrupamento de pacotes permita, por sua própria estrutura, que um Business Hub importe diretamente o pacote interno de outro Business Hub.
- Reservar espaço para todo módulo já identificado no Architectural Inventory de `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 4, mesmo que sua implementação real pertença a uma Fase futura.

**Não pertence à Package Structure:**
- Nenhuma lógica de negócio, nenhuma Regra, nenhuma Entidade — a Package Structure organiza onde o código futuro viverá, nunca o que esse código faz.
- Nenhuma definição de conteúdo de Command, Evento ou Query específico — apenas o espaço onde a forma genérica desses conceitos (Shared Types, componente seguinte da Sprint 1) será colocada.
- Nenhuma escolha de linguagem, framework, ou tecnologia de build.
- Nenhum detalhe de organização interna de um Business Hub ou de um Platform Service Hub específico — cada um projeta sua própria organização interna quando sua Fase de implementação chegar, respeitando apenas o espaço de topo já reservado aqui.

---

## 3. Architectural Constraints

- **Nenhum acoplamento direto entre Business Hubs** — cada Business Hub comunica-se com outro exclusivamente através do Event Bus e do Command Bus já catalogados (`EVENT_CATALOG.md`, `COMMAND_CATALOG.md`), nunca por importação direta de um pacote de Hub por outro (`BUSINESS_HUB_ARCHITECTURE.md`, Loose Coupling).
- **Separação estrita entre Core/Shared e Business** — nenhum pacote de fundação (Core, Shared, Platform Services) contém referência a um domínio de negócio específico; nenhum Business Hub é tratado como dependência de um pacote de fundação (`DOMAIN_OWNERSHIP_MATRIX.md`).
- **Ausência de lógica de negócio fora dos Business Hubs** — toda Regra de negócio pertence exclusivamente ao pacote do Business Hub proprietário correspondente (`DOMAIN_OWNERSHIP_MATRIX.md`).
- **Organização por domínio, não por camada técnica genérica** — o agrupamento de topo reflete Business Hub e Platform Service Hub já catalogados, nunca uma divisão técnica genérica (como "controllers", "models") que ignore a fronteira de domínio já estabelecida (`BUSINESS_HUB_ARCHITECTURE.md`).
- **Nenhum acesso direto da camada de IA a um Business Hub** — o pacote de AI Core nunca importa diretamente o pacote interno de um Business Hub; toda interação acontece através do Command Bus e do Event Bus, exatamente como qualquer outro consumidor (`AGENT_FRAMEWORK.md`, Cap. 15; `03_AI_ARCHITECTURE.md`).
- **Neutralidade tecnológica** — a estrutura de pacotes não pressupõe nenhuma linguagem, framework, ou convenção de build específica (`AI_ARCHITECTURE.md`, Cap. 16, Neutralidade Tecnológica).

---

## 4. Dependencies

Dependências arquiteturais, não técnicas:

- `DOMAIN_OWNERSHIP_MATRIX.md` — define quais Business Hubs e Platform Service Hubs precisam de espaço reservado, e a fronteira exata entre eles.
- `BUSINESS_HUB_ARCHITECTURE.md` — define o padrão estrutural que todo Business Hub deverá seguir internamente, quando implementado.
- `COMMAND_CATALOG.md`, `EVENT_CATALOG.md`, `QUERY_CATALOG.md` — definem o tipo de contrato que o pacote de Core precisará acomodar (Shared Types, componente seguinte da Sprint 1).
- `AI_ARCHITECTURE.md` — define a topologia de doze camadas que o pacote de AI Core precisará acomodar.
- `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 4 (Architectural Inventory) — fornece a lista completa e já aprovada de módulos que esta estrutura deve refletir.

Nenhuma dependência técnica (linguagem, framework, sistema de build) é declarada por este documento.

---

## 5. Expected Package Organization

**Core** — o espaço da forma genérica de Command, Evento e Query (Shared Types) e dos contratos abstratos de Ownership e de mediação (Base Contracts) — os dois componentes seguintes desta Sprint. Não contém nenhum vocabulário de domínio específico; é o único agrupamento do qual todo o restante da plataforma pode depender sem restrição.

**Shared** — o espaço da taxonomia de Errors, da capacidade de Logging, do mecanismo de Configuration, e das Utilities — os quatro componentes técnicos restantes desta Sprint. É agnóstico de domínio de negócio e de arquitetura de IA; qualquer módulo pode depender dele, mas ele nunca depende de nenhum módulo específico.

**Platform Services** — o espaço reservado para `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md` e `INTEGRATION_HUB.md`. Cada um serve tanto os Business Hubs quanto o AI Core, sem que nenhum dos dois seja seu proprietário. `AI_HUB.md` é, tecnicamente, também um Platform Service Hub segundo sua própria classificação em Volume I — mas, por sua escala (todo o Volume II), recebe agrupamento de topo próprio, descrito abaixo como **AI**, em vez de ocupar este espaço junto aos três Hubs menores.

**Business Hubs** — o espaço reservado para os cinco pares Blueprint/Hub já catalogados: CRM, Communication, Finance, Growth e Analytics. Cada um recebe um espaço próprio, isolado dos demais, vazio de implementação até sua respectiva Fase (`GATE_G2_IMPLEMENTATION_ROADMAP.md`, Phase 5).

**AI** — o espaço reservado para toda a arquitetura já consolidada do Volume II: Orchestrator, Agent Framework, Context, Memória, Planejamento, Raciocínio, Skill Runtime, Tool Runtime, Multi-Agent System, Governança e Observabilidade da camada de IA. Vazio de implementação até a Phase 4.

**Automation** — o espaço reservado para `AUTOMATION_ENGINE.md`. Vazio de implementação até a Phase 6. Depende de Core, Shared, Platform Services, Business Hubs e AI: Automation consome IA através da Action "Executar IA", já formalmente estabelecida em `AUTOMATION_ENGINE.md`, ADR-003 — a IA nunca inicia um Workflow por conta própria; é sempre o Automation Engine quem orquestra a execução e, quando necessário, consome a IA dentro de um Workflow já disparado por outro Trigger. Esta direção é sempre Automation → AI, nunca AI → Automation.

**Infrastructure** — o espaço reservado para o substrato técnico exigido por `NON_FUNCTIONAL_REQUIREMENTS.md` (Phase 2 de `GATE_G2_IMPLEMENTATION_ROADMAP.md`). Distinto de Core e de Shared por não conter contrato nem utilitário de código — apenas a fronteira onde a configuração de ambiente técnico (não confundir com o componente Configuration desta Sprint, que é o mecanismo de leitura de valor, não o ambiente em si) será tratada.

**Apps** — o espaço reservado para toda aplicação final consumidora da plataforma — primariamente o Dashboard (Experience Layer e Presentation Layer já descritas em `03_AI_ARCHITECTURE.md`), vazio até a Phase 7. Nenhum Blueprint dedicado a "Apps" existe hoje no Documentation System; este agrupamento existe para separar o que é consumido (Core, Shared, Platform Services, Business Hubs, AI, Automation) do que consome.

**Docs** — não é um espaço novo a ser criado por esta estrutura; é o `docs/` já existente e já governado por `DOCUMENTATION_CONSTITUTION.md`. A Package Structure reconhece sua existência como irmã dos pacotes de código, sem duplicá-la nem redefini-la.

Nenhuma árvore de diretórios definitiva é criada por esta seção — cada agrupamento acima é uma função, não um caminho de arquivo.

---

## 6. Validation Criteria

A Package Structure estará corretamente implementada quando:

- Todo Business Hub e todo Platform Service Hub já catalogado em `DOMAIN_OWNERSHIP_MATRIX.md` possuir um espaço reservado correspondente, e nenhum espaço reservado corresponder a um Hub não catalogado.
- Nenhum pacote de Core, Shared, Platform Services, Infrastructure, ou AI contiver referência a uma Regra de negócio ou a uma Entidade específica de um Business Hub.
- Nenhum Business Hub contiver, em sua própria estrutura reservada, uma referência de importação direta a outro Business Hub.
- O pacote de AI não contiver nenhuma referência de importação direta a um Business Hub — apenas ao Core, ao Shared, e aos Platform Services.
- A separação entre Core e Shared for verificável: Core contém apenas o que deriva de Command/Evento/Query/Ownership; Shared contém apenas o que é agnóstico de negócio e de domínio de IA.
- A estrutura for revisável, item a item, contra `DOMAIN_OWNERSHIP_MATRIX.md`, sem exigir interpretação adicional de quem revisa.

---

## 7. Risks

- **Confusão entre `AI_HUB.md` como Platform Service e o agrupamento AI de topo** — por `AI_HUB.md` ser tecnicamente um Platform Service Hub, uma leitura apressada poderia esperá-lo dentro do agrupamento Platform Services, causando inconsistência de localização. *Mitigação*: a distinção está registrada explicitamente na Seção 5 e deve ser preservada em qualquer documentação derivada.
- **Vazamento de acoplamento entre Business Hubs por conveniência futura** — pressão de prazo durante a Phase 5 poderia motivar um atalho de importação direta entre dois Hubs. *Mitigação*: a ausência desse caminho já é uma restrição estrutural (Seção 3), a ser reforçada pelo componente Dependency Management, próximo desta Sprint.
- **Confusão entre o agrupamento Infrastructure e o componente Configuration** — os dois tratam de "configuração" em sentidos diferentes (ambiente técnico vs. leitura de valor), com risco real de sobreposição indevida. *Mitigação*: a distinção está registrada explicitamente na Seção 5.
- **Duplicação do agrupamento Docs** — um esforço futuro poderia, por engano, tentar recriar `docs/` dentro da estrutura de pacotes de código. *Mitigação*: a Seção 5 declara explicitamente que Docs não é um espaço novo.

---

## 8. Approval

| Campo | Valor |
|---|---|
| Status | APPROVED FOR IMPLEMENTATION |
| Version | 1.0 |
| Author | Claude |
