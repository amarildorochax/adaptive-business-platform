# IMP-015 — Knowledge Hub Core — Relatório de Migração

**Status:** Concluída. **Pacote:** `@abp/platform-services` (`platform/packages/platform-services`). **Padrão:** Extrair → Adaptar → Portar.

---

## 1. Fonte de Verdade e Cadeia de Aprovação

Documento arquitetural oficial: `docs/architecture/KNOWLEDGE_HUB.md` ("Knowledge Hub — Arquitetura de
Referência", Documento Técnico Oficial). Documentação complementar já existente confirma uma cadeia
de aprovação completa, análoga à já usada por Identity Hub (Component 12) desta mesma série:

- `docs/implementation/components/COMPONENT_13_KNOWLEDGE_ARTIFACT_IDENTIFICATION.md`
- `docs/implementation/components/COMPONENT_13_KNOWLEDGE_DESIGN.md`
- `docs/implementation/components/KNOWLEDGE_SPECIFICATION.md`
- `docs/implementation/components/KNOWLEDGE_CONCRETE_STRUCTURE.md` (Status: **STRUCTURE APPROVED**) —
  a fonte direta dos sete contratos já scaffolded em `platform/packages/platform-services/src/` desde
  a IMP-001
- `docs/implementation/components/COMPONENT_13_KNOWLEDGE_IMPLEMENTATION_PLAN.md`
- `docs/implementation/components/KNOWLEDGE_BUILD_VALIDATION_REPORT.md`
- `docs/implementation/components/COMPONENT_13_KNOWLEDGE_FINAL_VALIDATION_REPORT.md`

Nenhum conflito entre `KNOWLEDGE_HUB.md` e a cadeia complementar foi encontrado — todos os sete
contratos citados por `KNOWLEDGE_CONCRETE_STRUCTURE.md` correspondem exatamente ao que
`KNOWLEDGE_HUB.md` já descreve nos Capítulos 7, 8 e 9. Onde a regra desta Sprint ("a arquitetura
oficial prevalece") teria sido necessária, ela nunca precisou ser invocada.

**Confirmação de pacote-alvo:** `KNOWLEDGE_CONCRETE_STRUCTURE.md`, seção "Localização", já especifica
que os sete contratos vivem em `platform/packages/platform-services/src/` — "mesmo pacote
`@abp/platform-services` já criado para Identity Hub (Component 12)". Knowledge Hub nunca teve
pacote próprio — é, como Identity, um Platform Service dentro do mesmo pacote (Phase 3 do
`GATE_G2_IMPLEMENTATION_ROADMAP.md`).

## 2. Auditoria de Legado (`src/`)

Busca pelas onze palavras-chave desta Sprint (knowledge, knowledge-base, knowledge hub, document,
knowledge provider, context, repository, knowledge entry, knowledge source, knowledge index,
knowledge reference). Resultado: **legado real e diretamente relevante encontrado** —
`src/core/knowledge/`, um módulo completo de quinze arquivos, autodocumentado como "Repositório
oficial de conhecimento institucional da plataforma... distinto de Business Memory (memória
operacional)". Esta é a segunda Sprint da série (após IMP-008, Analytics/Business Intelligence) com
lógica de negócio genuinamente portável, não apenas forma de campo.

### 2.1 Extração real: lógica portada, nunca campo

| Componente legado | Lógica extraída | Onde foi aplicada nesta Sprint |
|---|---|---|
| `KnowledgeManager.updateDocument()` (`version: existing.version + 1`) | Incrementar versão a partir do estado já existente, nunca aceitar número informado pelo chamador | `KnowledgeVersionService.record()` — calcula a próxima versão a partir do próprio histórico (`previous.length + 1`), mesmo princípio, adaptado ao Repository imutável já aprovado |
| `KnowledgeIndex.byCategory/byTags/byTitle/byText()` (filtro por campo estrutural, `tags.some(...)` = "ao menos uma correspondência") | Busca por correspondência textual sobre metadado estruturado, nunca sobre conteúdo não modelado | `KnowledgeSearchService.search()` — pesquisa `category`/`tags` do já aprovado `KnowledgeAsset`, restrita a `tenantId` (isolamento que o legado, pré-multi-tenant, nunca teve) |
| `KnowledgeProvider.provide()` (filtra por `status === PUBLISHED` antes de expor a qualquer consumidor) | Nunca expor conhecimento fora de um estado "pronto para uso" | `KnowledgeSearchService.search()` — nunca retorna um `KnowledgeAsset` sem `IndexEntry` já registrado, mesmo princípio aplicado ao estágio já aprovado do Ciclo de Vida (Capítulo 9), em vez do `KnowledgeStatus` legado |

### 2.2 Confirmado como fora de escopo, não extraído

- `KnowledgeEmbedding.ts` (`KnowledgeEmbeddingVector`, `KnowledgeSemanticQuery`) — autodocumentado como
  "não implementado... explicitamente proibido implementar embeddings reais ou qualquer vector store"
  já na própria Sprint que o criou. Confirma, do lado do legado, a mesma exclusão já determinada por
  esta Sprint (RAG/Embeddings/Vector Search fora de escopo).
- `KnowledgeSource.ts` — "fonte externa de conhecimento futura... nenhuma integração externa criada".
  Confirma a exclusão de "Integrações externas"/Integration Hub desta Sprint.
- `KnowledgeSnapshot.ts` — "histórico de versões futuro... nenhum componente desta Sprint cria,
  armazena, ou consulta". O já aprovado `KnowledgeVersion{assetId, version, recordedAt}` é
  deliberadamente mais simples que um snapshot de conteúdo completo — coerente com o fato de que
  nenhum campo de conteúdo é modelado no Core aprovado (ver Seção 5).
- `src/app/integrations/core/adapters/KnowledgeAdapter.ts` — autodocumentado "Nenhuma chamada real ao
  Core ainda", placeholder inerte (`NotImplementedCoreModuleAdapter`).
- `src/core/dashboard/KnowledgeWidget.ts` — mesmo padrão de falso amigo já confirmado nas IMP-008/012:
  consome `knowledgeBase.list()` legado apenas para exibição em widget de observabilidade de
  plataforma, nunca uma extensão do domínio de negócio Knowledge Hub em si.

### 2.3 Decisão explícita — nenhum campo de conteúdo foi importado do legado

`KnowledgeDocument` legado carrega `title`/`content`/`summary`/`metadata` — campos ricos, reais e
funcionais. O já aprovado `KnowledgeAsset` (`KNOWLEDGE_CONCRETE_STRUCTURE.md`, "STRUCTURE APPROVED")
**não** carrega nenhum desses campos. Esta Sprint nunca alarga um contrato já aprovado — "Nunca
estreitar tipos públicos" implica, simetricamente, nunca alargá-los sem uma Change Request formal
também. A ausência de um campo de conteúdo é, além disso, coerente com o próprio Roadmap do Blueprint
(Capítulo 19): o Document Parser — responsável por extrair conteúdo de PDF/planilha/texto — é
"curto prazo" apenas como conceito de integração de ponta a ponta, nunca como armazenamento de
conteúdo bruto dentro do Core; a extração de conteúdo real permanece tecnologia de implementação não
decidida por este Blueprint, mesmo raciocínio já aplicado ao "Document Parser" desta Sprint (ver
Seção 5). Esta ausência é registrada como decisão explícita, nunca como omissão silenciosa.

## 3. Contratos Reutilizados (Foundation, IMP-001)

Os sete contratos já existentes desde a IMP-001 foram confirmados, lidos por completo, e
**reutilizados sem nenhuma alteração de campo**:

| Contrato | Campos | Situação |
|---|---|---|
| `KnowledgeAsset` | `assetId`, `tenantId`, `type: KnowledgeType`, `category?`, `tags` | Reaproveitado sem alteração |
| `KnowledgeType` | união fechada de 12 literais (Modelo de Conhecimento, Capítulo 8) | Reaproveitado sem alteração |
| `KnowledgeLifecycleState` / `KnowledgeLifecycleStage` | união fechada de 9 literais (Ciclo de Vida, Capítulo 9) | Reaproveitado sem alteração |
| `KnowledgeVersion` | `assetId`, `version`, `recordedAt` | Reaproveitado sem alteração |
| `IndexEntry` | `assetId`, `indexedAt` | Reaproveitado sem alteração |
| `SearchQuery` / `SearchResult` | `{tenantId, text}` / `{assetId, rank}` | Reaproveitado sem alteração |
| `KnowledgeUpdatedPayload` | `assetId`, `tenantId`, `version` | Reaproveitado sem alteração |

**Nenhuma Entity nova foi criada nesta Sprint** — mesmo padrão já estabelecido pela IMP-013 (Runtime)
e pela IMP-014 (AI Agents).

## 4. Achado Central — Knowledge Hub Tem Catálogo Formal de Command e de Event

Diferente de todo domínio migrado desde a IMP-010 (AI Hub, IAM, Observability, Runtime, AI Agents —
todos sem nenhum Command/Event catalogado), o Knowledge Hub **tem** catálogo formal em ambos os
documentos-fonte de Volume I:

- `COMMAND_CATALOG.md`: `CreateKnowledge`, `UpdateKnowledge`, `IndexKnowledge`, `ArchiveKnowledge` —
  todos com Owner "Knowledge Hub".
- `EVENT_CATALOG.md`: `KnowledgeCreated`, `KnowledgeUpdated`, `KnowledgeIndexed`, `KnowledgeArchived`,
  `SemanticIndexUpdated` — todos com Produtor "Knowledge Hub", Consumidor "AI".

`KnowledgeUpdatedPayload.ts`, já existente desde a IMP-001, é explícito quanto ao mecanismo: "conteúdo
do evento 'KnowledgeUpdated', consumível pelo contrato genérico `Event<TPayload>` já implementado em
`@abp/core`, nunca redefinido aqui". Isso estabelece — e esta Sprint preserva — uma convenção distinta
da usada por CRM/Communication/Finance/Growth (que definem um wrapper local `{Hub}Command`/
`{Hub}Event` com `type` fechado): Knowledge Hub usa os genéricos `Command<TPayload>`/`Event<TPayload>`
já implementados em `@abp/core`, com um payload específico por Command/Event. Sete arquivos de payload
novos foram criados, seguindo exatamente esse padrão já demonstrado pelo único exemplo pré-existente:
`CreateKnowledgePayload`, `KnowledgeCreatedPayload`, `UpdateKnowledgePayload`, `IndexKnowledgePayload`,
`KnowledgeIndexedPayload`, `ArchiveKnowledgePayload`, `KnowledgeArchivedPayload` — nenhum deles é uma
Entity nova; são a forma concreta de quatro Commands e quatro dos cinco Events **já** catalogados
oficialmente, nunca inventados por esta Sprint.

`KnowledgeOperationResult<TEntity> = { result, command?, events? }` — mesma forma opcional já usada
por CRM/Communication/Finance/Growth, presente exatamente nas quatro operações cujo Command já está
catalogado (`createKnowledge`, `updateKnowledge`, `indexKnowledge`, `archiveKnowledge`); toda outra
transição de estágio (`submitForReview`, `approve`, `publish`, `markInUse`, `resumeReview`,
`recoverKnowledge`) retorna apenas `{ result }`, por não ter Command/Event próprio catalogado.

## 5. Componentes Implementados

### 5.1 Repository Interfaces (4)

`KnowledgeAssetRepository`, `KnowledgeLifecycleStateRepository`, `KnowledgeVersionRepository`,
`IndexEntryRepository`. Todos os quatro são fatos observacionais imutáveis — **nenhum tem `update` nem
`remove`** — "Conhecimento nunca é sobrescrito; toda mudança produz uma nova versão preservável"
(ADR-005) aplicado estruturalmente, mesma disciplina já usada em toda Sprint anterior desta série.

### 5.2 Services (5)

| Service | Componentes Internos implementados (Capítulo 7) |
|---|---|
| `KnowledgeAssetService` | Repository Manager + Document Manager + estrutura mínima de Metadata Engine/Classification Engine |
| `KnowledgeLifecycleService` | Knowledge Lifecycle Manager |
| `KnowledgeVersionService` | Knowledge Versioning |
| `KnowledgeIndexService` | Index Manager (nunca Embedding Manager) |
| `KnowledgeSearchService` | Search Engine — restrito a Keyword Search sobre metadado estruturado (nunca Semantic/Hybrid Search) |

**Decisão arquitetural registrada — consolidação de Componentes sem Entity própria.** O Capítulo 7
nomeia 26 Componentes Internos — o maior catálogo de qualquer domínio já migrado nesta série. Destes,
apenas os seis já citados acima têm contrato ou responsabilidade correspondente a algo genuinamente
modelável no Core aprovado (`KnowledgeAsset`/`KnowledgeLifecycleState`/`KnowledgeVersion`/
`IndexEntry`). Repository Manager, Document Manager, Metadata Engine e Classification Engine foram
consolidados em `KnowledgeAssetService` porque nenhum dos quatro tem Entity ou sub-estrutura própria
além dos campos já presentes em `KnowledgeAsset` (`type`/`category`/`tags`) — criar quatro Services
distintos apenas replicaria o mesmo CRUD sobre a mesma Entity, violando proporcionalidade (mesmo
princípio já aplicado ao não criar Services extras sem Componente ou Contrato correspondente em
Runtime, IMP-013). Os vinte Componentes restantes (Document Parser, Tag Manager, Category Manager,
Retrieval Engine, Semantic Search, Keyword Search [absorvido em Search Engine], Hybrid Search,
Embedding Manager, Knowledge History, Approval Workflow, Publishing Engine, Retention Manager,
Knowledge Validator, Knowledge Analytics, Knowledge Monitor, Knowledge Cache, Knowledge Export,
Knowledge Import, Knowledge Synchronizer, Knowledge Connector [Integration], Knowledge Security,
Knowledge Audit, Knowledge Archive, Knowledge Recovery [absorvido em Lifecycle]) não correspondem a
nenhum Entity/Repository já aprovado e/ou pertencem explicitamente a fases posteriores do Roadmap
(médio/longo prazo, Capítulo 19) ou a domínios já excluídos desta Sprint — ver Seção 7.

`KnowledgeLifecycleService` aplica a sequência literal do Capítulo 9 (Criação → Revisão → Aprovação →
Publicação → Indexação → Uso → Atualização → Arquivamento → Recuperação) como máquina de estados com
transições explícitas, nunca pulando nem reordenando um estágio — mesma disciplina já usada em
`ExecutionLifecycleService` (Runtime, IMP-013). **Decisão de interpretação registrada:** o texto do
Blueprint descreve um único ciclo não-linear — "um conhecimento publicado e em uso ativo continua
sujeito a nova Revisão a qualquer momento, sem limite de quantas vezes esse ciclo se repete" — sem
apontar de forma inequívoca a partir de qual estágio exato esse retorno acontece. Esta Sprint
implementa esse retorno como `Atualização → Revisão`, a transição textualmente mais próxima da
afirmação do próprio Capítulo 9 sobre "Atualização": "uma nova Revisão produz uma nova Versão".
`Arquivamento → Recuperação` nunca é automático — exige sempre uma chamada explícita de
`recoverKnowledge()`, nunca disparada internamente por nenhuma outra transição, aplicação literal de
"Knowledge Recovery... é sempre um ato de escolha, nunca um efeito colateral automático".

`KnowledgeSearchService.search()` implementa apenas a fração "curto prazo" do Search Engine —
correspondência textual sobre `category`/`tags` de `KnowledgeAsset`, restrita a `tenantId` (ADR-011)
e apenas a ativos com `IndexEntry` já registrado. **Nunca** implementa Semantic Search nem Hybrid
Search — ambas dependem do Embedding Manager, explicitamente fora de escopo desta Sprint.

### 5.3 KnowledgeManager

Implementa o "Knowledge Manager" (Capítulo 7): "ponto de entrada e orquestrador central... coordena os
demais componentes especializados e garante consistência... sem decidir, ele mesmo, a lógica de
classificação, de indexação ou de busca." Orquestra as quatro operações com Command/Event catalogado
(`createKnowledge`, `updateKnowledge`, `indexKnowledge`, `archiveKnowledge`) e sete transições de
estágio sem Command próprio (`submitForReview`, `approve`, `publish`, `markInUse`, `resumeReview`,
`recoverKnowledge`, mais `search` como Query pura). Nunca contém lógica própria de classificação, de
versionamento, ou de busca — cada chamada delega integralmente a exatamente um Service.

## 6. ACL

Nenhuma linha desta Sprint importa `@abp/crm-hub`, `@abp/communication-hub`, `@abp/content-hub`,
`@abp/growth-hub`, `@abp/commerce-hub`, `@abp/finance-hub`, `@abp/analytics-hub`,
`@abp/automation-engine`, `@abp/ai`, `@abp/ai-agents`, `@abp/runtime`, ou `@abp/infrastructure`.
`tenantId`/`assetId` são sempre identificadores opacos — nenhum tipo de outro Hub é referenciado. Todo
uso do genérico `Command<TPayload>`/`Event<TPayload>` vem exclusivamente de `@abp/core`, já uma
dependência existente do pacote.

## 7. Fora de Escopo — Registrado Explicitamente

- **Tool Registry, MCP, RAG, Embeddings, Vector Search** — explicitamente citados como fora de escopo
  pela Sprint; confirmados como território do Embedding Manager (Capítulo 7) e do médio/longo prazo do
  Roadmap (Capítulo 19). `KnowledgeEmbedding.ts` legado já autodocumentava a mesma exclusão.
- **Integrações externas / Integration Hub** — todo o Capítulo 14 (Knowledge Connector de fontes
  externas, Knowledge Synchronizer, Knowledge Import/Export) depende do Integration Hub, "o único
  ponto de saída da plataforma para sistemas externos" (ADR-007), que permanece, ele mesmo, não
  migrado por nenhuma Sprint IMP até o momento (`PRE_IMP_014_ROADMAP_AUDIT.md`, Seção 4/7). Nenhum
  destes componentes foi implementado.
- **Approval Workflow como orquestração de Workflow** — o Capítulo 7 já define que a Aprovação, quando
  orquestrada como parte de um Workflow mais amplo, consome "o Approval Engine já descrito em
  `AUTOMATION_ENGINE.md`" — este Core nunca reimplementa esse Approval Engine; a transição
  `Revisão → Aprovação` desta Sprint é apenas o registro estrutural do estágio, nunca um motor de
  aprovação condicional por categoria de conhecimento.
- **Dashboard** — Phase 7 original de `GATE_G2_IMPLEMENTATION_ROADMAP.md`; nenhuma menção em
  `KNOWLEDGE_HUB.md` além da consulta indireta via Analytics Hub (Capítulo 16).
- **`SemanticIndexUpdated`** — catalogado em `EVENT_CATALOG.md` como publicado pelo próprio Command
  `IndexKnowledge`, mas sua própria definição ("comunicar atualização geral do Retrieval Index... após
  reprocessamento do índice") depende do Embedding Manager/Vector Index, explicitamente fora de
  escopo. `indexKnowledge()` publica apenas `KnowledgeIndexed` (Index Manager, em escopo); nunca
  inventa uma versão simplificada de `SemanticIndexUpdated` apenas para preencher o catálogo — a
  lacuna é registrada aqui, nunca preenchida silenciosamente.
- **Document Parser (extração real de conteúdo)** — nenhum campo de conteúdo é modelado no Core
  aprovado (ver Seção 2.3); a extração de PDF/planilha/texto em si permanece tecnologia de
  implementação não decidida por nenhum Blueprint desta série.

## 8. Validação

```
pnpm typecheck   → 17/17 pacotes, sucesso
pnpm build       → 17/17 pacotes + apps/web (vite build), sucesso
pnpm lint        → sucesso
pnpm test        → 259/259 testes, 75/75 arquivos de teste (suíte inteira do monorepo)
```

**Testes desta Sprint:** 17 testes em 6 arquivos (`KnowledgeAssetService`, `KnowledgeLifecycleService`,
`KnowledgeVersionService`, `KnowledgeIndexService`, `KnowledgeSearchService`, `KnowledgeManager`),
cobrindo: isolamento por Tenant na criação e na listagem, sequência literal das nove etapas do Ciclo
de Vida (inclusive rejeição de estágio pulado e o ciclo explícito Atualização→Revisão), exigência de
transição explícita para Recuperação (nunca automática), numeração sequencial de versão a partir do
próprio histórico, exclusão de ativo não indexado do resultado de busca, ranking por número de
correspondências restrito ao Tenant, e presença/ausência de `command`/`events` no resultado do
Manager exatamente nas quatro operações com Command catalogado — além do fluxo completo de nove
etapas via `KnowledgeManager`.

## 9. Resumo

| Item | Contagem |
|---|---|
| Entities novas | 0 (todas as sete já existiam desde a IMP-001) |
| Entities reaproveitadas sem alteração | 7 (`KnowledgeAsset`, `KnowledgeType`, `KnowledgeLifecycleState`, `KnowledgeVersion`, `IndexEntry`, `Search` [Query/Result], `KnowledgeUpdatedPayload`) |
| Command/Event payload novos (formalizando catálogo já aprovado) | 7 |
| Repository interfaces | 4 |
| Services | 5 |
| Manager | 1 (`KnowledgeManager`) |
| Commands implementados | 4 de 4 já catalogados (`CreateKnowledge`, `UpdateKnowledge`, `IndexKnowledge`, `ArchiveKnowledge`) |
| Events implementados | 4 de 5 já catalogados (`KnowledgeCreated`, `KnowledgeUpdated`, `KnowledgeIndexed`, `KnowledgeArchived`; `SemanticIndexUpdated` registrado como lacuna, Seção 7) |
| Testes novos | 17 |
| Arquivos de legado (`src/`) com lógica real extraída | 3 padrões de `src/core/knowledge/` (versionamento incremental, filtro por metadado estruturado, exclusão de não-publicado) |
