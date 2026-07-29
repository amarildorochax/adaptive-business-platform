# Component 13 — Knowledge Hub — Artifact Identification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento identifica, exclusivamente por citação direta de `KNOWLEDGE_HUB.md` e `SYSTEM_BLUEPRINT.md`, os artefatos que compõem o componente Knowledge Hub, restritos aos dez itens de escopo já autorizados: conhecimento institucional, ativos de conhecimento, organização, indexação, classificação, busca, catálogo, versionamento do conhecimento, ciclo de vida do conhecimento, eventos de atualização de conhecimento.*

---

## Método

| Item de escopo | Seção de origem | Elevado a artefato? |
|---|---|---|
| Conhecimento institucional / Ativos de conhecimento / Catálogo | `KNOWLEDGE_HUB.md`, Seção 8 (doze tipos nomeados, incluindo Catálogo) | Sim — **KnowledgeType** |
| Ativos de conhecimento (registro) / Organização / Classificação | `KNOWLEDGE_HUB.md`, Seção 8 (Metadados, Categorias, Tags) e Seção 7 (Classification Engine) | Sim — **KnowledgeAsset** |
| Versionamento do conhecimento | `KNOWLEDGE_HUB.md`, Seção 9 (Knowledge Versioning/History) | Sim — **KnowledgeVersion** |
| Ciclo de vida do conhecimento | `KNOWLEDGE_HUB.md`, Seção 9 (diagrama, nove estágios) | Sim — **KnowledgeLifecycleState** |
| Indexação | `KNOWLEDGE_HUB.md`, Seção 6 (diagrama) e Seção 7 (Index Manager) | Sim — **IndexEntry** |
| Busca | `KNOWLEDGE_HUB.md`, Seção 6 (diagrama, Search Engine/Retrieval Engine) e Seção 10 | Sim — **SearchQuery** / **SearchResult** (mesmo arquivo) |
| Eventos de atualização de conhecimento | `KNOWLEDGE_HUB.md`, Seção 9; `SYSTEM_BLUEPRINT.md`, tabela de comunicação (linha 440: publica `KnowledgeUpdated`) | Sim — **KnowledgeUpdatedPayload** |

**Nota sobre isolamento de Tenant**: embora não listado como item de escopo autônomo pela tarefa, `KNOWLEDGE_HUB.md`, ADR-011, exige isolamento absoluto entre Tenants, "incluindo índice de busca e representação vetorial de Embedding". Este requisito é incorporado como campo `tenantId` em `KnowledgeAsset` e em `SearchQuery`, nunca como artefato isolado — mesmo padrão já aplicado ao Component 12 (`Session.tenantId`).

---

## Artefato 1 — Knowledge Type

| Requisito | Fonte |
|---|---|
| "Documento... Artigo... Procedimento... Manual... FAQ... Política... Contrato... Catálogo... Produto e Serviço... Template... Fluxo..." (doze tipos nomeados) | `KNOWLEDGE_HUB.md`, Seção 8 |

**Conclusão**: união literal dos doze tipos já nomeados textualmente — nenhum tipo adicional inventado, nenhum tipo omitido.

---

## Artefato 2 — Knowledge Asset

| Requisito | Fonte |
|---|---|
| "Metadados, Categorias, Tags, Status e Versão são os elementos estruturais que atravessam todo tipo de conhecimento." | `KNOWLEDGE_HUB.md`, Seção 8 |
| "O Classification Engine determina... a que tipo do Modelo de Conhecimento um novo registro pertence, e sugere Categoria inicial." | `KNOWLEDGE_HUB.md`, Seção 7 |
| "Isolamento de conhecimento entre Tenants é absoluto." | `KNOWLEDGE_HUB.md`, ADR-011 |

**Conclusão**: registro declarativo de um ativo de conhecimento — identificador, Tenant, tipo (`KnowledgeType`), categoria e tags. Campo de versão tratado separadamente no Artefato 3, por já possuir capítulo próprio e mais aprofundado (Seção 9).

---

## Artefato 3 — Knowledge Version

| Requisito | Fonte |
|---|---|
| "O Knowledge Versioning aplica identificação de versão a cada estado relevante de um registro de conhecimento, permitindo reconstruir exatamente qual conteúdo estava vigente em um momento específico do passado." | `KNOWLEDGE_HUB.md`, Seção 7 |
| "Conhecimento nunca é sobrescrito; toda mudança produz uma nova versão preservável." | `KNOWLEDGE_HUB.md`, ADR-005 |

**Conclusão**: registro declarativo de uma versão de um ativo de conhecimento — nenhum mecanismo de reconstrução ou de diff implementado.

---

## Artefato 4 — Knowledge Lifecycle State

| Requisito | Fonte |
|---|---|
| "Criação → Revisão → Aprovação → Publicação → Indexação → Uso → Atualização → Arquivamento → Recuperação." | `KNOWLEDGE_HUB.md`, Seção 9 (diagrama) |
| "Nenhum registro de conhecimento pula uma dessas nove etapas." | `KNOWLEDGE_HUB.md`, Seção 9 |

**Conclusão**: união literal dos nove estágios já nomeados textualmente, e registro declarativo do estágio atual de um ativo — nenhuma lógica de transição implementada.

---

## Artefato 5 — Index Entry

| Requisito | Fonte |
|---|---|
| "O Index Manager mantém o índice de busca atualizado a cada mudança de conhecimento, garantindo que uma nova versão de documento, uma vez publicada, esteja pesquisável dentro de um intervalo aceitável." | `KNOWLEDGE_HUB.md`, Seção 7 |

**Conclusão**: registro declarativo de que um ativo foi indexado e está pesquisável — nenhum mecanismo real de indexação, nenhum Embedding.

---

## Artefato 6 — Search Query / Search Result

| Requisito | Fonte |
|---|---|
| "O Search Engine expõe a interface de consulta central do Knowledge Hub." | `KNOWLEDGE_HUB.md`, Seção 7 |
| "O Retrieval Engine recupera, a partir do resultado produzido pelo Search Engine, o conjunto final de conhecimento mais relevante para uma consulta específica." | `KNOWLEDGE_HUB.md`, Seção 7 |
| "Relevância é o critério central de ordenação de um resultado de busca." | `KNOWLEDGE_HUB.md`, Seção 10 |

**Conclusão**: os dois elementos são tratados no mesmo artefato, por representarem a mesma interação — uma consulta e seu resultado — já apresentados em sequência direta no mesmo diagrama e no mesmo capítulo. Nenhuma distinção entre Keyword/Semantic/Hybrid Search é modelada — mecanismo de busca concreto, fora de escopo.

---

## Artefato 7 — Knowledge Updated Payload

| Requisito | Fonte |
|---|---|
| "Publishing Engine transita o estado e dispara o evento `KnowledgeUpdated` (`SYSTEM_BLUEPRINT.md`)." | `KNOWLEDGE_HUB.md`, Seção 9 |
| "Knowledge Hub \| — \| `KnowledgeUpdated` \| —" | `SYSTEM_BLUEPRINT.md`, tabela de comunicação |

**Conclusão**: registro declarativo do conteúdo (`payload`) do evento `KnowledgeUpdated` já nomeado — consumível pelo contrato genérico `Event<TPayload>` já implementado em `@abp/core` (Component 03, Sprint 1), nunca redefinido aqui.

---

## Elementos Explicitamente Não Elevados a Artefato

Consistente com `COMPONENT_13_KNOWLEDGE_DESIGN.md`, Out of Scope: Knowledge Manager, Repository Manager, Document Manager, Document Parser, Metadata Engine, Tag Manager, Category Manager, Semantic Search, Keyword Search, Hybrid Search, Embedding Manager, Approval Workflow, Publishing Engine, Retention Manager, Knowledge Validator, Knowledge Analytics, Knowledge Monitor, Knowledge Cache, Knowledge Export, Knowledge Import, Knowledge Synchronizer, Knowledge Connector, Knowledge Security, Knowledge Audit, Knowledge Lifecycle Manager, Knowledge Archive, Knowledge Recovery — todos já nomeados em `KNOWLEDGE_HUB.md`, Seção 7, mas não citados entre os dez itens de escopo autorizados por esta tarefa. Ausência registrada, não inventada.

RBAC/ABAC não são redefinidos — já formalizados no Component 12 (`Role`, `Permission`), consumidos conceitualmente por Knowledge Security (fora de escopo), nunca duplicados aqui.

---

## Conclusão

Sete artefatos identificados, todos rastreáveis por citação direta a `KNOWLEDGE_HUB.md` e a `SYSTEM_BLUEPRINT.md`, cobrindo integralmente os dez itens de escopo já autorizados.

---

## Traceability

| Artefato | Fonte |
|---|---|
| Knowledge Type | `KNOWLEDGE_HUB.md`, Seção 8 |
| Knowledge Asset | `KNOWLEDGE_HUB.md`, Seções 7 e 8; ADR-011 |
| Knowledge Version | `KNOWLEDGE_HUB.md`, Seção 7 e 9; ADR-005 |
| Knowledge Lifecycle State | `KNOWLEDGE_HUB.md`, Seção 9 |
| Index Entry | `KNOWLEDGE_HUB.md`, Seção 7 |
| Search Query / Search Result | `KNOWLEDGE_HUB.md`, Seções 7 e 10 |
| Knowledge Updated Payload | `KNOWLEDGE_HUB.md`, Seção 9; `SYSTEM_BLUEPRINT.md` |

---

## Approval

| Campo | Valor |
|---|---|
| Status | ARTIFACT IDENTIFICATION COMPLETED |
| Version | 1.0 |
| Author | Claude |
