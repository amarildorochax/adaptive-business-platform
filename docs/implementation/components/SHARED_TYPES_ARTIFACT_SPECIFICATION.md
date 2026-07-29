# Shared Types Artifact Specification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento especifica, em nível exclusivamente documental, o contrato dos três artefatos previstos do Component 03 — Shared Types. Nenhum Command, Event ou Query é implementado. Nenhuma linguagem, tecnologia ou algoritmo é escolhido. Nenhuma arquitetura é criada e nenhum documento existente é alterado — apenas o que já está aprovado em `COMPONENT_03_SHARED_TYPES_DESIGN.md`, `COMPONENT_03_IMPLEMENTATION_PLAN.md`, `platform/PACKAGE_STRUCTURE_MANIFEST.md`, `BUSINESS_HUB_ARCHITECTURE.md` e `SPRINT_01_IMPLEMENTATION_BACKLOG.md` é organizado.*

---

## Objective

Definir documentalmente o contrato dos três artefatos previstos para o Component 03 — Shared Types (`SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3; `COMPONENT_03_IMPLEMENTATION_PLAN.md`, Seção "Deliverables"), sem realizar nenhuma implementação.

---

## Covered Artifacts

- Generic Command
- Generic Event
- Generic Query

---

## Generic Command

### Architectural Purpose

Ser a forma estrutural genérica através da qual qualquer módulo expressa uma intenção de mudança de estado dentro de seu próprio domínio — sem, ela mesma, pertencer a nenhum domínio específico (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7).

### Conceptual Objective

Realizar, como forma genérica, o conceito de Command já descrito em `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7: *"Commands representam uma intenção de mudança dentro do domínio... processados pelo Application Service correspondente, e distintos de Domain Event porque um Command ainda não aconteceu, é uma solicitação, enquanto um Evento já é um fato consumado."* Corresponde ao princípio "Intenção antes de Fato" já registrado em `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Design Principles".

### Architectural Responsibility

Apenas a já documentada em `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3: residir no agrupamento Core como forma genérica, sem conter nenhum vocabulário de domínio específico. Nenhuma responsabilidade individual adicional, distinta das demais formas genéricas, foi documentada especificamente para Command.

### Required Inputs

Nenhuma entrada concreta é definida por nenhuma das cinco fontes obrigatórias. Conceitualmente, um Command comunica uma intenção de mudança de estado (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7) — nenhum campo, cabeçalho, ou metadado é especificado.

### Expected Outputs

Conceitualmente, o processamento de um Command resulta em mudança de Aggregate e na publicação de um Evento correspondente — `BUSINESS_HUB_ARCHITECTURE.md`, Seção "Observabilidade" (Tracing): *"conecta o processamento de um Command, a mudança de Aggregate resultante, e o Evento publicado em consequência"*; e Seção 18 (caso CRM): *"o Application Service correspondente processa o Command de criação, o Aggregate Customer é criado..., e o Evento `LeadCreated` é publicado."* Um Command pode ser aceito ou recusado pela Validation do módulo proprietário (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7).

### Constraints

- Não pode conter vocabulário de domínio específico (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3).
- É sempre processado exclusivamente pelo módulo proprietário do conceito envolvido — nunca por um consumidor externo (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7).

### Explicitly Out of Scope

Linguagem; tecnologia; estrutura de dado concreta (campos); algoritmo; nome de arquivo; localização — nenhum definido (`COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope").

---

## Generic Event

### Architectural Purpose

Ser a forma estrutural genérica através da qual qualquer módulo comunica um fato de negócio já consumado, servindo como contrato de baixo acoplamento entre módulos (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 5 — "Publish Facts, Not Commands"; Seção 11 — "Eventos do Domínio").

### Conceptual Objective

Realizar, como forma genérica, o conceito de Evento já descrito em `BUSINESS_HUB_ARCHITECTURE.md`, Seção 11: *"Fato é a natureza fundamental de todo Evento de domínio: ele descreve algo que já aconteceu, de forma irrevogável... nunca uma instrução do que fazer a seguir."* Corresponde ao princípio "Publish Facts, Not Commands" já reafirmado em `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Design Principles".

### Architectural Responsibility

Apenas a já documentada — residir no agrupamento Core, sem vocabulário de domínio específico (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3). Nenhuma responsabilidade individual adicional foi documentada.

### Required Inputs

Nenhuma entrada concreta é definida pelas fontes obrigatórias. Conceitualmente, um Evento resulta do processamento de um Command já aceito (`BUSINESS_HUB_ARCHITECTURE.md`, Seção "Observabilidade" — Tracing), mas nenhum campo ou estrutura é especificado.

### Expected Outputs

Um registro de um fato já consumado, publicado para consumo por outros módulos de forma independente — `BUSINESS_HUB_ARCHITECTURE.md`, Seção 18: *"qualquer outro Hub interessado consome esse Evento de forma independente, através de sua própria Anti-Corruption Layer quando aplicável — nunca através de acesso direto à Entidade de origem."*

### Constraints

- Nunca representa uma instrução de ação futura, apenas um fato já consumado — ADR-008, `BUSINESS_HUB_ARCHITECTURE.md`, Seção 20: *"Todo Evento de domínio publicado descreve um Fato já consumado, nunca uma instrução de ação futura."*
- Não pode conter vocabulário de domínio específico (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3).
- Atravessa fronteira de Hub livremente, ao contrário da Query — `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7: *"apenas os Domain Events, e ocasionalmente uma Query explícita quando estritamente necessária, atravessam essa fronteira."*

### Explicitly Out of Scope

Linguagem; tecnologia; estrutura de dado concreta (campos); algoritmo; nome de arquivo; localização — nenhum definido (`COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope").

---

## Generic Query

### Architectural Purpose

Ser a forma estrutural genérica através da qual um módulo realiza leitura sem efeito colateral, atravessando fronteira de Hub apenas de forma excepcional e explícita (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7).

### Conceptual Objective

Realizar, como forma genérica, o conceito de Query — leitura que nunca produz mudança de estado, distinta de Command e de Evento pelo contraste já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Seção 7 (diagrama *"Application Services ── Commands ── Queries"*). Corresponde ao princípio "Query como leitura explícita e excepcional entre Hubs" já registrado em `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Design Principles".

### Architectural Responsibility

Apenas a já documentada — residir no agrupamento Core, sem vocabulário de domínio específico (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3).

### Required Inputs

Nenhuma entrada concreta é definida pelas fontes obrigatórias.

### Expected Outputs

Um resultado de leitura, sem efeito colateral. Quando atravessa fronteira de Hub, o faz apenas de forma estritamente necessária e explícita — `BUSINESS_HUB_ARCHITECTURE.md`, Seção 18 (caso Communication/CRM): *"o conteúdo completo da mensagem permanece propriedade exclusiva do Communication Hub, consultável pelo CRM Hub apenas através de uma Query explícita quando necessário, nunca por acesso direto ao Aggregate Message."*

### Constraints

- Contratos formalizam o formato de toda Query eventualmente exposta entre Hubs, versionados conforme o princípio de Backward Compatibility — `BUSINESS_HUB_ARCHITECTURE.md`, Seção 9.
- Não pode conter vocabulário de domínio específico (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3).
- Cruza fronteira de Hub apenas de forma excepcional, nunca como padrão (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7).

### Explicitly Out of Scope

Linguagem; tecnologia; estrutura de dado concreta (campos); algoritmo; nome de arquivo; localização — nenhum definido (`COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope").

---

## Shared Constraints

Restrições comuns aos três artefatos:

- Nenhum dos três pode conter vocabulário de domínio específico (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3).
- Todos os três residem no agrupamento **Core**, não no agrupamento **Shared** (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 2 e 3; `platform/core/README.md`, Seção "Important Terminology").
- Nenhuma decisão de tecnologia, linguagem, ou algoritmo é autorizada para nenhum dos três (`COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope").
- Cada forma genérica deve ser capaz de representar, sem alteração, qualquer entrada já catalogada em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`, a título de amostra conceitual (`SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3) — esta verificação ainda não foi realizada por nenhuma das fontes obrigatórias.
- Nenhuma dependência técnica formal existe entre os três artefatos; a ordem Command → Evento → Query é uma recomendação de planejamento, não uma regra (`COMPONENT_03_IMPLEMENTATION_PLAN.md`, Seção "Implementation Strategy").

---

## Open Decisions

As seguintes decisões permanecem explicitamente em aberto para os três artefatos (Generic Command, Generic Event, Generic Query):

- **Nome de arquivo** de cada um dos três — não definido.
- **Localização (caminho)** de cada um dos três — não definido.
- **Tecnologia** — nenhuma foi autorizada.
- **Linguagem** — nenhuma foi escolhida.
- **Algoritmo** — nenhum foi definido.
- **Estrutura de dado concreta** (campos, formato) — não definida para nenhum dos três.
- **Verificação formal contra amostra real** dos três catálogos oficiais (`COMMAND_CATALOG.md`, `EVENT_CATALOG.md`, `QUERY_CATALOG.md`) — ainda não realizada por nenhuma das fontes obrigatórias.

---

## Validation Strategy

Critérios já existentes, conforme `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3, e `COMPONENT_03_IMPLEMENTATION_PLAN.md`, Seção "Acceptance Criteria":

✓ As três formas genéricas existirem, com Build aprovado e Validação Final concluída para cada uma.
✓ Nenhuma das três conter nenhum campo específico de nenhum domínio.
✓ Cada forma genérica ser capaz de representar, sem alteração, qualquer entrada já catalogada em `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`, a título de amostra conceitual.
✓ Fidelidade confirmada contra os três catálogos oficiais.

Nenhum critério novo foi criado por este documento.

---

## Traceability

| Seção | Fonte |
|---|---|
| Objective | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3; `COMPONENT_03_IMPLEMENTATION_PLAN.md`, Seção "Deliverables" |
| Generic Command | `BUSINESS_HUB_ARCHITECTURE.md`, Seções 7 e 18; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `COMPONENT_03_SHARED_TYPES_DESIGN.md` |
| Generic Event | `BUSINESS_HUB_ARCHITECTURE.md`, Seções 5, 7, 11, 18 e 20; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `COMPONENT_03_SHARED_TYPES_DESIGN.md` |
| Generic Query | `BUSINESS_HUB_ARCHITECTURE.md`, Seções 7, 9 e 18; `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `COMPONENT_03_SHARED_TYPES_DESIGN.md` |
| Shared Constraints | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 2 e 3; `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope"; `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3; `COMPONENT_03_IMPLEMENTATION_PLAN.md`, Seção "Implementation Strategy" |
| Open Decisions | Ausência confirmada nas cinco fontes obrigatórias |
| Validation Strategy | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3; `COMPONENT_03_IMPLEMENTATION_PLAN.md`, Seção "Acceptance Criteria" |

Nenhum documento ausente foi identificado entre as cinco fontes obrigatórias desta especificação.

---

## Approval

| Campo | Valor |
|---|---|
| Status | SPECIFICATION APPROVED |
| Version | 1.0 |
| Author | Claude |
