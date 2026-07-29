# Phase 5 — Business Hubs Architecture Definition

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento define a arquitetura da Phase 5 — Business Hubs, servindo de base para todo o backlog de implementação futuro. Nenhum código foi criado. Nenhum componente TypeScript foi criado. Nenhuma Sprint foi iniciada.*

---

## 0. Enquadramento — Este Documento Não Redefine `BUSINESS_HUB_ARCHITECTURE.md`

`docs/architecture/BUSINESS_HUB_ARCHITECTURE.md` já é a constituição oficial de todo Business Hub da plataforma — Domain Ownership, Bounded Context, comunicação por Evento, Capacidades de Negócio, Evolução Independente, integração com Platform Services, Observabilidade, Escalabilidade, o checklist de aceitação (Capítulo 17), doze ADRs, e o próprio roadmap de novos domínios (Capítulo 19). Este documento **não redefine, não altera, e não substitui** nenhum desses princípios.

O papel deste documento é o mesmo já desempenhado por `AI_CORE_ARCHITECTURE_DEFINITION.md` em relação a `AI_HUB.md`: decompor uma arquitetura-mãe já aprovada — aqui, `BUSINESS_HUB_ARCHITECTURE.md` — no escopo específico da Fase do Roadmap em curso, e formalizar o único ponto genuinamente novo desde que aquela constituição foi escrita: a integração com o AI Core, que na época de `BUSINESS_HUB_ARCHITECTURE.md` e de `SYSTEM_BLUEPRINT.md` existia apenas como contrato externo (`AI_HUB.md`), e que agora, após `AI_CORE_INTEGRATION_FINAL_APPROVAL.md`, existe também como onze componentes internos operantes e dez integrações internas aprovadas.

Base obrigatória desta definição: `AI_CORE_ARCHITECTURE_DEFINITION.md`, `AI_CORE_INTEGRATION_ARCHITECTURE.md`, `AI_CORE_INTEGRATION_FINAL_APPROVAL.md`, `docs/architecture/BUSINESS_HUB_ARCHITECTURE.md` (autoridade de governança, ver acima), `docs/implementation/GATE_G2_IMPLEMENTATION_ROADMAP.md` (substituindo `ROADMAP.md`, vazio) e `docs/architecture/SYSTEM_BLUEPRINT.md` (substituindo o `SYSTEM_ARCHITECTURE.md` literal, que corresponde apenas ao documento legado `docs/02-SYSTEM_ARCHITECTURE.md`, descrevendo a arquitetura `src/` já descontinuada por Gate G0).

---

## 1. Visão Geral da Arquitetura

```
                         Platform (visão de camada)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
  Platform Services            AI Core (Phase 4)           Business Hubs (Phase 5)
  Identity · Knowledge ·       11 componentes internos      CRM · Communication ·
  Integration Hub              já aprovados                  Finance · Analytics ·
  (Phase 3)                    (SPRINT_04_FINAL_APPROVAL,        Growth
                                 AI_CORE_INTEGRATION_
                                 FINAL_APPROVAL)
        │                           │                           │
        └─────────────► consumidos exclusivamente por ◄─────────┘
                         contrato externo, nunca por
                         acesso interno direto
```

A Phase 5 introduz a camada de domínios de negócio reconhecíveis pelo cliente. Nenhum Business Hub implementa inteligência, infraestrutura, ou runtime próprios — toda capacidade técnica transversal já construída em Phase 2 (Infrastructure), Phase 3 (Platform Services) e Phase 4 (AI Core) é consumida, nunca duplicada.

---

## 2. Objetivo da Phase 5

Tornar operantes os cinco domínios de negócio já modelados conceitualmente em `BUSINESS_HUB_ARCHITECTURE.md` — CRM, Communication, Finance, Analytics e Growth — cada um consumindo o AI Core (Phase 4) e os Platform Services (Phase 3) já aprovados, sem jamais reimplementar, contornar, ou modificar seu comportamento interno.

Este documento não inicia nenhuma implementação. Ele formaliza a arquitetura sobre a qual o backlog de implementação de cada Business Hub será, no futuro, decomposto — mesmo papel já desempenhado por `AI_CORE_ARCHITECTURE_DEFINITION.md` em relação a `SPRINT_04_IMPLEMENTATION_BACKLOG.md`.

---

## 3. Escopo — Os Cinco Business Hubs e Sua Ordem

Conforme `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6, a Phase 5 é composta pelos cinco pares Blueprint/Hub de domínio já existentes, na seguinte ordem obrigatória:

| Ordem | Business Hub | Par Blueprint/Hub | Status documental |
|---|---|---|---|
| 1 | CRM Hub | `CRM_DOMAIN_BLUEPRINT.md` + `CRM_HUB.md` | Frozen — o par mais maduro |
| 2 | Communication Hub | `COMMUNICATION_DOMAIN_BLUEPRINT.md` + `COMMUNICATION_HUB.md` | Official |
| 3 | Finance Hub | `FINANCE_DOMAIN_BLUEPRINT.md` + `FINANCE_HUB.md` | Official |
| 4 | Analytics Hub | `ANALYTICS_DOMAIN_BLUEPRINT.md` + `ANALYTICS_HUB.md` | Official |
| 5 | Growth Hub | `GROWTH_DOMAIN_BLUEPRINT.md` (Official) + `GROWTH_HUB.md` (Draft) | Growth Hub exige promoção de `GROWTH_HUB.md` para Official antes de sua própria Sprint, mesma disciplina já aplicada a qualquer documento Draft pelo `DOCUMENTATION_CONSTITUTION.md` |

Esta ordem já está fixada pelo Roadmap e não é redefinida por este documento. Qualquer novo Business Hub além destes cinco (Projects, HR, Inventory, Legal, Supplier, Document, Field Service, E-commerce — já antecipados em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 19) permanece fora do escopo desta Fase.

---

## 4. Responsabilidades dos Business Hubs

Vinculante a `BUSINESS_HUB_ARCHITECTURE.md`, Capítulos 1, 4, 5 e 7 — não redefinido aqui, apenas reafirmado como condição de aceitação de todo Business Hub desta Fase:

- Representar uma Capacidade de negócio reconhecível pelo cliente — nunca uma conveniência técnica de organização de código.
- Encapsular Regra de negócio dentro de seu próprio Domain Model — Aggregates, Entities, Value Objects, Domain Services, Policies, Specifications.
- Orquestrar Workflow de negócio interno através de Application Services, Commands e Queries — nunca contendo, eles mesmos, regra de negócio substancial fora do Domain Model.
- Consumir o AI Core, os Platform Services, e a Adaptive Intelligence já aprovados, exclusivamente através de seus contratos externos já publicados.
- Publicar Domain Events como Fatos consumados, nunca como instrução — princípio Publish Facts, Not Commands.

---

## 5. Limites Arquiteturais

Os limites abaixo, já anunciados no prompt desta Sprint, são vinculados formalmente à arquitetura já aprovada correspondente — nenhum é uma restrição nova, cada um decorre diretamente de um documento já Official ou Frozen:

| Limite | Fundamento já aprovado |
|---|---|
| Nunca implementam IA | `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14: "nenhum Business Hub implementa lógica de inteligência própria"; `SYSTEM_BLUEPRINT.md`: "AI First — inteligência artificial é fundação, acessada exclusivamente através do AI Hub, nunca implementada de forma paralela por um Hub de domínio" |
| Nunca implementam infraestrutura | `SCOPE_FREEZE_V1.md`; nenhuma tecnologia concreta de armazenamento, mensageria, ou implantação é definida por nenhum Business Hub — permanece substrato de Infrastructure (Phase 2) |
| Nunca implementam runtime | O runtime de Skill e de Tool pertence exclusivamente a Skill Runtime (Component 21) e Tool Runtime (Component 22) do AI Core, já aprovados; nenhum Business Hub reimplementa esse mecanismo |
| Nunca executam Tools diretamente | `AI_CORE_INTEGRATION_ARCHITECTURE.md`, Seção 9: "AI Core chamando um Business Hub diretamente" já é proibido na direção inversa; simetricamente, nenhum Business Hub invoca `ToolDefinition`/`ToolRequirement` (Component 22) diretamente — toda execução de Tool permanece mediada por uma Skill já invocada por um Agente dentro do AI Core |
| Nunca acessam Memory diretamente | Nenhum Business Hub referencia `MemoryEntry`/`memoryId` (Component 16) — memória de IA permanece interna ao AI Core, acessível apenas através do contrato externo do AI Hub |
| Nunca coordenam agentes | `AI_CORE_INTEGRATION_ARCHITECTURE.md`, ADR-INT-001: "toda coordenação de Inteligência Artificial acontece através de um único AI Orchestrator"; nenhum Business Hub referencia `agentId`, `groupId`, ou qualquer artefato de Agent Framework (Component 18) ou Multi-Agent System (Component 23) |

---

## 6. Bounded Contexts

Vinculante a `BUSINESS_HUB_ARCHITECTURE.md`, Capítulos 8 e 9 — Domain Ownership já fixado, não redefinido:

| Business Hub | Bounded Context (termo central) | Entidade de propriedade exclusiva |
|---|---|---|
| CRM Hub | Relacionamento com Cliente — estágio de funil, canal de origem, histórico de interação | `Customer` |
| Communication Hub | Comunicação em qualquer canal | `Message` |
| Finance Hub | Saúde financeira — transação, situação de pagamento, limite de crédito | `Invoice` |
| Analytics Hub | Indicador consolidado a partir de Evento de todos os demais Hubs | `Metrics` |
| Growth Hub | Aquisição, conteúdo e conversão | `Campaign` |

Nenhum dos cinco Bounded Contexts se sobrepõe a outro. Quando dois Hubs têm interesse legítimo sobre o mesmo conceito de negócio (ex.: "Cliente" no CRM Hub vs. no Finance Hub), cada um mantém sua própria representação local, nunca uma Entidade compartilhada — exatamente como já exemplificado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 8.

---

## 7. Regras de Integração

### 7.1 Integração com AI Core (Phase 4)

Esta é a única cláusula genuinamente nova desde `BUSINESS_HUB_ARCHITECTURE.md` e `SYSTEM_BLUEPRINT.md` terem sido escritos — ambos antecediam a existência dos onze componentes internos do AI Core.

- Todo Business Hub que precisa de inteligência artificial solicita a capacidade ao **AI Hub como ponto único de contrato externo**, exatamente como já fixado em `SYSTEM_BLUEPRINT.md`, Capítulo 3 ("nenhum Hub de domínio acessa um provedor de inteligência artificial sem atravessar esta camada primeiro") e Capítulo 8 (AI Hub como uma das três exceções deliberadas a chamada síncrona direta).
- Nenhum Business Hub referencia, importa, ou depende de qualquer um dos onze componentes internos do AI Core (Context, Memory, Orchestrator, Agent Framework, Reasoning, Planning, Skill Runtime, Tool Runtime, Multi-Agent System, AI Governance, AI Observability) individualmente — apenas o contrato externo já consolidado.
- As dez integrações internas do AI Core (`AI_CORE_INTEGRATION_FINAL_APPROVAL.md`) permanecem inteiramente invisíveis a qualquer Business Hub — nenhuma delas é, ou precisa ser, exposta como Contrato externo.
- Um Business Hub solicita uma capacidade de negócio em termos de negócio ("sugerir resposta a este Lead", "analisar anomalia nesta transação"); o AI Core decide internamente como atendê-la — nunca o inverso, mesmo princípio já fixado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14.

### 7.2 Integração com Platform Services (Phase 3)

Vinculante a `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 14 — não redefinido:

- Identity Hub é consumido para autenticação e autorização de toda operação sobre Entidades do Business Hub — nenhum Hub implementa sua própria verificação de Permissão.
- Knowledge Hub é consumido quando um Business Hub precisa armazenar ou consultar conhecimento não estruturado.
- Integration Hub é consumido quando um Business Hub precisa se comunicar com um sistema externo — nenhum Hub implementa sua própria integração direta com um Provider externo.

### 7.3 Integração com Automation Engine (futura, Phase 6)

- O Automation Engine (Phase 6) ainda não foi iniciado e não é afetado por este documento.
- Quando iniciado, a direção de dependência já fixada em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6, permanece: Automation Engine é construído *sobre* Evento e Command já reais de ao menos um Business Hub — a direção é sempre Business Hub → Automation (via Evento publicado, nunca chamada direta), nunca Automation iniciando uma mudança de estado direta dentro de um Business Hub sem publicação de Evento correspondente.
- Nenhum Business Hub desta Fase invoca o Automation Engine — essa invocação, quando existir, pertence exclusivamente à Fase 6.

### 7.4 Integração entre Business Hubs

Vinculante a `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 10 — não redefinido: toda colaboração entre dois Business Hubs acontece exclusivamente por Evento publicado e consumido de forma assíncrona e independente, nunca por chamada direta. Nenhuma exceção é introduzida por este documento.

---

## 8. Regras de Dependência

### Dependências Permitidas

- Sequenciamento de Fase já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6 — Foundation → Infrastructure → Platform Services → AI Core → **Business Hubs**.
- Consumo do contrato externo do AI Hub (Seção 7.1), nunca de seus componentes internos.
- Consumo dos contratos externos de Identity Hub, Knowledge Hub e Integration Hub (Seção 7.2).
- Publicação e consumo de Domain Event entre Business Hubs, através do Event Bus já descrito em `SYSTEM_BLUEPRINT.md`, Capítulo 7 (mecanismo já existente, não redefinido aqui).
- Referência a outra Entidade de negócio exclusivamente por identificador comum, nunca por acesso direto à Entidade de origem — mesmo princípio já aplicado dentro do próprio AI Core desde a Sprint 4.

### Dependências Proibidas

- Import de tipo, estrutura de dado, ou artefato interno de qualquer um dos onze componentes do AI Core.
- Chamada direta síncrona de um Business Hub a outro Business Hub.
- Acesso direto ao armazenamento de dado que pertence a outro Business Hub, mesmo sob infraestrutura física compartilhada (`BUSINESS_HUB_ARCHITECTURE.md`, ADR-007).
- Qualquer Business Hub invocando o Automation Engine antes de sua própria Fase (Phase 6) estar aprovada.
- Qualquer tecnologia concreta de execução, comunicação, ou armazenamento definida por este documento ou por qualquer Business Hub individualmente.

### Direção das Dependências

```
Foundation → Infrastructure → Platform Services → AI Core → Business Hubs
                                                                   │
                                                                   ▼
                                              (futuro) Automation Engine
                                                                   │
                                                                   ▼
                                                    (futuro) Dashboard
```

Nenhuma seta é invertida por este documento. Business Hubs dependem de AI Core, Platform Services e Infrastructure — nenhum dos três depende de nenhum Business Hub.

---

## 9. Princípios de Isolamento e Extensibilidade

Vinculante a `BUSINESS_HUB_ARCHITECTURE.md`, Capítulos 13 e 19 — não redefinido:

- **Isolamento**: um Business Hub pode ser modificado, estendido, ou reimplementado internamente sem exigir mudança coordenada em nenhum outro Hub, desde que seu Contrato externo (Eventos publicados, formato consumido) permaneça estável.
- **Extensibilidade**: todo novo Business Hub futuro além dos cinco desta Fase (Projects, HR, Inventory, Legal, Supplier, Document, Field Service, E-commerce, ou qualquer domínio ainda não antecipado) segue integralmente o mesmo padrão já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, sem exigir nenhuma extensão ou exceção arquitetural — nenhuma dessas expansões futuras é iniciada por este documento.

---

## 10. Regras de Governança

- Nenhum Business Hub é aceito para implementação sem demonstrar conformidade integral ao checklist arquitetural de dez pontos já fixado em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 17.
- `BUSINESS_HUB_ARCHITECTURE.md`, ADR-005, permanece vinculante: "Todo novo Hub deve seguir `BUSINESS_HUB_ARCHITECTURE.md`, sem exceção."
- O risco arquitetural já registrado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 12 — "um Business Hub ser implementado antes que o AI Core esteja genuinamente operante" — está mitigado: a Definition of Ready de AI Core (Phase 4) está satisfeita, conforme `SPRINT_04_FINAL_APPROVAL.md` (Status: SPRINT 4 APPROVED) e `AI_CORE_INTEGRATION_FINAL_APPROVAL.md` (Status: AI CORE INTEGRATION APPROVED).
- Toda mudança estrutural a esta arquitetura, ou a `BUSINESS_HUB_ARCHITECTURE.md`, segue o Architecture Decision Flow já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 11 — Proposta → Revisão → Decisão → Documentação → Aprovação.

---

## 11. Convenções Arquiteturais

- Cada Business Hub mantém a Estrutura Interna já fixada em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 7 (Domain Model, Application Layer, Superfície externa, Suporte) — nenhuma convenção alternativa é introduzida.
- Cada Business Hub é tratado, para fins de isolamento arquitetural, com o mesmo grau de separação já aplicado a Platform Services e a AI Core nesta plataforma — nenhum Business Hub compartilha Domain Model com outro Business Hub, com Platform Services, ou com AI Core.
- Nomenclatura de Evento, Command e Query segue os catálogos já existentes (`EVENT_CATALOG.md`, `COMMAND_CATALOG.md`, `QUERY_CATALOG.md`) — nenhum novo catálogo paralelo é criado por este documento.
- Nenhuma convenção de tecnologia, linguagem, framework, ou estrutura de pacote é definida por este documento — permanece disciplina de `IMPLEMENTATION_GUIDELINES.md`, aplicada Sprint a Sprint, mesmo princípio já fixado em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 12 ("nenhuma decisão de tecnologia é tomada por este Gate ou por nenhum documento arquitetural").

---

## 12. Critérios de Aprovação da Arquitetura

Esta arquitetura é considerada aprovada quando:

- Todos os cinco Business Hubs têm seu par Blueprint/Hub já Official ou Frozen, ou uma justificativa formal de exceção documentada (caso de `GROWTH_HUB.md`, ainda Draft).
- Nenhuma responsabilidade, limite, Bounded Context, ou regra de integração definida neste documento contradiz `BUSINESS_HUB_ARCHITECTURE.md`, `SYSTEM_BLUEPRINT.md`, ou `AI_CORE_INTEGRATION_ARCHITECTURE.md`.
- A Definition of Ready de `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 8, aplicada ao escopo desta Fase, está satisfeita: dependência do Dependency Graph concluída (AI Core, Platform Services), arquitetura correspondente já aprovada, documentação sincronizada, e nenhum contrato inferido durante a própria Sprint.
- Nenhuma Sprint de implementação de Business Hub específico inicia antes que este documento, e o eventual backlog que dele decorrer, estejam formalmente aprovados.

---

## 13. Architecture Decision Records

**ADR-P5-001 — A ordem de implementação dos cinco Business Hubs segue exatamente `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 6: CRM → Communication → Finance → Analytics → Growth.** Contexto: CRM Hub já é Frozen, o par mais maduro; Growth Hub permanece Draft e exige promoção antes de sua própria Sprint.

**ADR-P5-002 — Nenhum Business Hub acessa componente interno do AI Core; toda integração de inteligência artificial passa exclusivamente pelo contrato externo do AI Hub.** Contexto: preserva a fronteira já estabelecida em `SYSTEM_BLUEPRINT.md` mesmo após a existência interna dos onze componentes de Volume II, evitando que a nova profundidade interna do AI Core vaze para fora de sua própria fronteira.

**ADR-P5-003 — Este documento não é uma nova constituição de Business Hub; `BUSINESS_HUB_ARCHITECTURE.md` permanece a autoridade única sobre o padrão interno de todo Business Hub.** Contexto: mesmo raciocínio já aplicado em `AI_CORE_INTEGRATION_ARCHITECTURE.md`, ADR-INT-002, em relação ao Roadmap.

---

## 14. Confirmação Final

Nenhum código foi implementado. Nenhum componente TypeScript foi criado. Nenhuma Sprint foi iniciada. Nenhuma arquitetura já aprovada — `BUSINESS_HUB_ARCHITECTURE.md`, `SYSTEM_BLUEPRINT.md`, `AI_CORE_ARCHITECTURE_DEFINITION.md`, `AI_CORE_INTEGRATION_ARCHITECTURE.md` — foi alterada. AI Core, Foundation, Infrastructure e Platform Services permanecem intocados.

---

## Approval

| Campo | Valor |
|---|---|
| Status | PHASE 5 ARCHITECTURE DEFINED |
| Version | 1.0 |
| Author | Claude |
