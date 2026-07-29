# Platform Services Architecture Definition

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Architecture Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento formaliza a decomposição arquitetural da camada Platform Services (Phase 3), a partir de `platform/platform-services/README.md` (já aprovado, Component 01) e dos três Blueprints já Oficiais — `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md`, `INTEGRATION_HUB.md`. Ele define componentes, responsabilidades, interfaces, relações, dependências e princípios — nunca ordem de implementação, nunca backlog, nunca Sprint 3, nunca decomposição em componentes internos numerados, que permanecem fora do escopo desta tarefa. Nenhum elemento aqui registrado é novo: cada um já estava declarado, ainda que de forma dispersa, em documentação oficial já aprovada.*

---

## 1. Método

`platform/platform-services/README.md`, Seção "Responsibilities", já declara o pacote como "o espaço comum de **Identity**, **Knowledge** e **Integration**" — três serviços nomeados, cada um já detalhado em um Blueprint próprio, Oficial, aprovado independentemente:

| Serviço nomeado no README | Blueprint de origem | Status do Blueprint | Elevado a componente? |
|---|---|---|---|
| Identity | `IDENTITY_HUB.md` | Official | Sim — **Identity Hub** |
| Knowledge | `KNOWLEDGE_HUB.md` | Official | Sim — **Knowledge Hub** |
| Integration | `INTEGRATION_HUB.md` | Official | Sim — **Integration Hub** |

Os três já são citados nominalmente, com o mesmo peso, em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 4 (Architectural Inventory) e Seção 6 (Implementation Phases: *"Phase 3 — Platform Services — Identity, Knowledge e Integration Hubs, construídos em paralelo entre si"*). Nenhum quarto serviço é declarado em nenhuma fonte autorizada — `HUB_TO_PACKAGE_MAPPING.md` não os lista porque cobre apenas os cinco Business Hubs, um agrupamento distinto (`PACKAGE_STRUCTURE_MANIFEST.md`, Seção 2).

**Conclusão do método**: três componentes arquiteturais são formalizáveis sem invenção — **Identity Hub**, **Knowledge Hub**, **Integration Hub**.

---

## 2. Componentes

### 2.1 Identity Hub

**Missão** (`IDENTITY_HUB.md`, Seção 2): *"garantir autenticação, autorização, identidade, confiança, auditoria e controle de acesso de forma centralizada, segura e escalável."*

**Responsabilidade central** (`SYSTEM_BLUEPRINT.md`, Seção 4, tabela): *"Autenticar e autorizar todo acesso à plataforma"* — consumido por "Todos os demais Hubs".

**Limites**: Identity Hub não contém Regra de negócio de nenhum Business Hub; não decide o que um Business Hub faz com um acesso já autorizado — apenas se o acesso é ou não legítimo.

**Interfaces**: exposto como **chamada direta síncrona**, nunca como evento, a qualquer Hub de domínio que precise validar acesso (`SYSTEM_BLUEPRINT.md`, linhas 411-424: *"Hub de Domínio ──chama diretamente──► Identity Hub (permitido, obrigatório)"*; *"são serviços transversais consumidos de forma síncrona por qualquer Hub de domínio... autenticação... não faz sentido como evento assíncrono na maioria dos casos de uso"*). Publica os eventos `UserInvited` e `TenantProvisioned` (`SYSTEM_BLUEPRINT.md`, linha 443); não consome eventos de nenhum outro Hub.

**Requisitos não funcionais aplicáveis** (`NON_FUNCTIONAL_REQUIREMENTS.md`): NFR-005 (*"Toda Permission deverá ser verificada antes de qualquer Validation de negócio, conforme já exigido em `IDENTITY_HUB.md`, ADR-006"*), NFR-006 (isolamento absoluto de Tenant, incl. índice de busca e Embedding), NFR-007 (invalidação imediata de Sessão após revogação de Permission), NFR-009 (armazenamento de credencial exclusivamente em Credential Vault dedicado).

---

### 2.2 Knowledge Hub

**Missão** (`KNOWLEDGE_HUB.md`, Seção 2): *"centralizar todo o conhecimento empresarial de forma estruturada, pesquisável, segura, versionada e reutilizável."*

**Responsabilidade central** (`SYSTEM_BLUEPRINT.md`, Seção 4, tabela): *"Organizar conhecimento acumulado da empresa"* — consumido primariamente pelo AI Hub.

**Limites**: Knowledge Hub não gera conhecimento por si — organiza, versiona e disponibiliza para busca o conhecimento já produzido pela empresa ou por outros Hubs; não interpreta nem decide com base nesse conhecimento (interpretação é responsabilidade do AI Hub).

**Interfaces**: diferente de Identity e Integration, o Knowledge Hub **não** é um serviço transversal de chamada direta — `SYSTEM_BLUEPRINT.md` o lista explicitamente entre os Hubs que "nunca se chamam entre si diretamente" (linha 422: *"CRM Hub, Finance Hub, Growth Hub, Automation Hub, Communication Hub, Branding Hub e Knowledge Hub nunca se chamam entre si diretamente"*). Publica o evento `KnowledgeUpdated`, consumido pelo AI Hub (`SYSTEM_BLUEPRINT.md`, linhas 440, 444); não possui chamada direta de saída registrada.

**Requisitos não funcionais aplicáveis**: nenhum capítulo de `NON_FUNCTIONAL_REQUIREMENTS.md` cita `KNOWLEDGE_HUB.md` nominalmente. O único item aplicável, de forma indireta, é NFR-046 (*"Toda busca textual ou semântica deverá aplicar filtro de Permission antes de qualquer ranking de relevância"*), que rege o comportamento de busca do Knowledge Hub sem nomeá-lo. Esta assimetria em relação a Identity e Integration é registrada explicitamente na Seção "Nota sobre Assimetria de Fundamentação NFR", abaixo — não é tratada como bloqueio.

---

### 2.3 Integration Hub

**Missão** (`INTEGRATION_HUB.md`, Seção 2): *"centralizar todas as integrações externas de maneira segura, desacoplada, observável, resiliente e escalável."*

**Responsabilidade central** (`SYSTEM_BLUEPRINT.md`, Seção 4, tabela): *"Prover a única saída para sistemas externos"* — consumido frequentemente por Growth Hub, Communication Hub, Finance Hub.

**Limites**: Integration Hub é "o único ponto de saída da plataforma para qualquer sistema externo" (`SYSTEM_BLUEPRINT.md`, linha 111) — nenhum Hub de domínio possui integração direta própria com terceiro; Integration Hub não decide regra de negócio sobre o que fazer com o dado trocado, apenas media a troca.

**Interfaces**: exposto como **chamada direta síncrona**, junto com AI Hub e Identity Hub, a qualquer Hub de domínio que precise alcançar sistema externo (`SYSTEM_BLUEPRINT.md`, linha 413: *"Hub de Domínio ──chama diretamente──► Integration Hub (permitido, obrigatório)"*). Repassa eventos de sistemas externos e consome eventos que exigem saída externa (`SYSTEM_BLUEPRINT.md`, linha 445); também chamado diretamente pelo AI Hub quando aplicável (linha 444).

**Requisitos não funcionais aplicáveis**: NFR-028 (*"Todo Provider externo deverá ser acessado exclusivamente através do Integration Hub, conforme `INTEGRATION_HUB.md`, ADR-001"*), NFR-029 (validação de origem e assinatura de todo Webhook antes de processamento), NFR-030 (política de Rate Limit obrigatória), NFR-031 (política de Retry obrigatória), NFR-032 (versionamento obrigatório de mudança de contrato de integração).

---

## 3. Relações Entre Componentes

Nenhuma fonte oficial consultada declara dependência de um destes três componentes sobre outro:

- **Identity não depende de Knowledge.**
- **Knowledge não depende de Integration.**
- **Integration não depende de Identity.**

Confirmado por dupla evidência:

1. `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 5 (Dependency Graph): *"Identity, Knowledge e Integration são Platform Service Hubs paralelos entre si — nenhum depende dos outros dois — mas todos dependem de Infrastructure já operante, e todos são, por sua vez, pré-requisito do AI Core."*
2. `SYSTEM_BLUEPRINT.md`, tabela de comunicação (linhas 432-445): nenhuma linha registra Identity Hub, Knowledge Hub, ou Integration Hub chamando diretamente ou consumindo evento de qualquer um dos outros dois.

Os três são arquiteturalmente irmãos: cada um sustenta uma capacidade distinta e independente, todos residentes no mesmo agrupamento Platform Services, nenhum dependendo do outro para existir.

**Nenhuma ordem de implementação é definida por este documento** — decidir a sequência entre Identity Hub, Knowledge Hub e Integration Hub permanece fora do escopo desta tarefa, reservado a um futuro planejamento de Sprint 3. `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 12, já adverte que os três devem ser tratados como "um único marco de saída de fase" — nenhum planejamento futuro deve declarar Phase 3 concluída com apenas um ou dois dos três prontos.

---

## 4. Dependências

Duas camadas de dependência distintas, já reconhecidas separadamente pelo próprio governance do projeto (`docs/implementation/components/INFRASTRUCTURE_ARCHITECTURE_AUDIT_REPORT.md`) — sequenciamento de Fase não é o mesmo que dependência de pacote:

**Sequenciamento de Fase** (`GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 5):

```
Infrastructure (Phase 2 — já concluída)
      │
      ▼
Identity Hub ── Knowledge Hub ── Integration Hub   (Phase 3 — paralelos entre si)
      │
      ▼
AI Core (Phase 4)
```

Infrastructure precisa estar operante antes de Platform Services por sequenciamento temporal de implementação — não por importação de código.

**Dependência de pacote** (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 4 e 5): Platform Services depende, no nível de pacote, apenas de **Core** e **Shared**. Platform Services nunca depende de AI, Business Hubs, Automation, Infrastructure ou Apps — consistente com `platform/platform-services/README.md`, Seção "Dependency Rules": *"Platform Services depende apenas de: Core, Shared... Platform Services nunca depende de: AI, Business Hubs, Automation, Infrastructure, Apps."* A seta "Infrastructure → Platform Services" no diagrama de Fase acima é, portanto, de sequenciamento de entrega, nunca de importação de código — assim como já esclarecido para a própria Infrastructure em `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md`, Seção 4.

Todos os agrupamentos superiores (AI, Business Hubs, Automation, Apps) podem depender de Platform Services no nível de pacote.

---

## 5. Princípios Arquiteturais

Já declarados em `platform/platform-services/README.md`, Seção "Design Principles" — este documento não os redefine, apenas os reafirma como aplicáveis igualmente aos três componentes:

- Reutilização.
- Desacoplamento.
- Composição.
- Independência tecnológica.
- Estabilidade arquitetural.

Reforçados, especificamente para Identity Hub, por `IDENTITY_HUB.md`, Seção 5 (15 Design Principles próprios); para Knowledge Hub, por `KNOWLEDGE_HUB.md`, Seção 5 (14 Design Principles próprios); para Integration Hub, por `INTEGRATION_HUB.md`, Seção 5 (14 Design Principles próprios) — nenhum deles é redefinido ou resumido aqui, permanecem vigentes em seus próprios Blueprints.

---

## 6. Fora de Escopo

Este documento **não define**:

- Backlog de Sprint 3.
- Ordem de implementação entre Identity Hub, Knowledge Hub e Integration Hub.
- Decomposição em componentes internos numerados — os 28 a 32 sub-componentes já nomeados em cada Blueprint (ex.: Authentication Manager, RBAC Engine, Search Engine, Connector Registry) permanecem descritos em seu Blueprint de origem, mas nenhum é elevado individualmente a artefato de implementação por este documento.
- Cronograma.
- Critérios de conclusão por componente (Completion Criteria) — pertencem ao futuro backlog, no mesmo padrão já usado em `SPRINT_02_IMPLEMENTATION_BACKLOG.md`, Seção 5.

Esses assuntos pertencem à próxima etapa: um futuro `SPRINT_03_IMPLEMENTATION_BACKLOG.md`, a ser derivado deste documento exatamente como `SPRINT_02_IMPLEMENTATION_BACKLOG.md` foi derivado de `INFRASTRUCTURE_ARCHITECTURE_DEFINITION.md`.

---

## Nota sobre Assimetria de Fundamentação NFR

Identity Hub e Integration Hub possuem itens de `NON_FUNCTIONAL_REQUIREMENTS.md` que citam seu próprio Blueprint nominalmente, por número de ADR (NFR-005 → `IDENTITY_HUB.md`, ADR-006; NFR-028 → `INTEGRATION_HUB.md`, ADR-001). Knowledge Hub não possui nenhuma citação equivalente — apenas NFR-046, que rege comportamento de busca sem nomear `KNOWLEDGE_HUB.md`. Esta assimetria é registrada explicitamente, não descartada silenciosamente: ela não impede a formalização do componente Knowledge Hub (sua missão, limites e interfaces já são rastreáveis ao próprio `KNOWLEDGE_HUB.md`, Oficial, e a `SYSTEM_BLUEPRINT.md`), mas deve ser considerada por qualquer planejamento futuro de Sprint 3 que dependa de fundamentação NFR por capítulo, no mesmo padrão usado para Infrastructure.

---

## Validação

✓ Nenhuma expansão de escopo — nenhum componente além dos três rastreáveis foi definido.
✓ Nenhum componente inventado — cada um corresponde a um Blueprint Oficial já citado nominalmente em `platform/platform-services/README.md` e em `GATE_G2_IMPLEMENTATION_ROADMAP.md`.
✓ Toda definição rastreável — ver tabela da Seção 1 e citações de Blueprint/NFR/SYSTEM_BLUEPRINT em cada Seção 2.
✓ Compatibilidade com o Roadmap — Seção 3 e Seção 4 confirmam literalmente a estrutura já declarada em `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seções 5, 6 e 12.
✓ Compatibilidade com `SYSTEM_BLUEPRINT.md` — interfaces de cada componente (Seção 2) citam exclusivamente as regras de comunicação já fixadas nas Seções 4 e 8 daquele documento.
✓ Compatibilidade com `NON_FUNCTIONAL_REQUIREMENTS.md` — cada NFR citado já existia; nenhum foi criado ou reinterpretado.
✓ Compatibilidade com os três Blueprints — nenhuma Missão, Responsabilidade, ou Design Principle foi redefinida, apenas referenciada.
✓ Nenhuma decisão arquitetural contraditória — a distinção entre sequenciamento de Fase e dependência de pacote (Seção 4) segue o precedente já estabelecido em `INFRASTRUCTURE_ARCHITECTURE_AUDIT_REPORT.md`.
✓ Nenhuma decomposição em componentes internos numerados — permanece fora de escopo (Seção 6).
✓ Nenhuma ordem de implementação ou backlog produzidos — fora do escopo desta tarefa.

---

## Traceability

| Seção | Fonte |
|---|---|
| Componentes | `platform/platform-services/README.md`; `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md`, `INTEGRATION_HUB.md` (todos Official); `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seções 4 e 6 |
| Interfaces | `SYSTEM_BLUEPRINT.md`, Seção 4 (tabela de responsabilidade) e Seção 8 (regras de comunicação, linhas 405-445) |
| Requisitos não funcionais | `NON_FUNCTIONAL_REQUIREMENTS.md`, NFR-005, 006, 007, 009 (Identity); NFR-028 a 032 (Integration); NFR-046 (Knowledge, indireto) |
| Relações | `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seções 5 e 12; `SYSTEM_BLUEPRINT.md`, linhas 432-445 |
| Dependências | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 4 e 5; `platform/platform-services/README.md`, Seção "Dependency Rules"; `docs/implementation/components/INFRASTRUCTURE_ARCHITECTURE_AUDIT_REPORT.md` (precedente de distinção Fase/pacote) |
| Princípios Arquiteturais | `platform/platform-services/README.md`, Seção "Design Principles"; Design Principles próprios de cada Blueprint |

---

## Approval

| Campo | Valor |
|---|---|
| Status | PLATFORM SERVICES ARCHITECTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
