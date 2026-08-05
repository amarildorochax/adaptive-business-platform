# Content Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-004 — Content Hub Migration (Fase 1 — Content Core)

---

## Nota de Posicionamento Documental

Esta Sprint difere das duas anteriores em um ponto estrutural que precisa ser dito antes de qualquer outra coisa: **`platform/packages/content-hub/` não existia** — nem como implementação, nem como esqueleto de tipo, diferente de `crm-hub` e `communication-hub`, que já chegaram à IMP-002/IMP-003 com dezenas de arquivos de contrato prontos. `src/core/content/` também não existe, e nenhum dos 28 diretórios de `src/core/` nem dos 14 de `src/app/features/` corresponde a Content, Article, Page, Media ou Category. Esta Sprint criou o pacote inteiro — `package.json`, `tsconfig.json`, o wiring no `tsconfig.json` raiz e em `apps/web` — antes mesmo de poder escrever a primeira Entidade.

**Achado mais importante desta Sprint**: `CONTENT_HUB_ARCHITECTURE.md` — diferente de `CRM_HUB.md` e `COMMUNICATION_HUB.md`, ambos com um catálogo formal e numerado de Commands — **nunca catalogou um conjunto de Commands do Content Hub**. Seu Capítulo 27 cataloga dezenove Eventos com precisão (produtor, consumidor, objetivo, impacto), mas em nenhum lugar do documento existe uma lista equivalente de operações nomeadas como "CreateArticle"/"PublishArticle". Isso não é um descuido a corrigir por esta Sprint — é um fato do Blueprint já existente, e a regra desta própria Sprint ("não criar Commands novos por iniciativa própria") exige que essa ausência seja respeitada, não preenchida. Por isso, diferente de `CRMOperationResult` (IMP-002) e `CommOperationResult` (IMP-003), o `ContentOperationResult` desta Sprint **nunca tem um campo `command`** — nem mesmo opcional. Não há vocabulário aprovado para omitir; simplesmente não existe.

O texto de exemplo da própria Sprint ("Tag", "Revision", "Publication", "ContentMetadata") também diverge do vocabulário já aprovado pelo Blueprint (`ContentTag` — deliberadamente distinto de `Tag`, per ADR-CH-005 —, `ArticleVersion`, e nenhuma Entidade chamada "Publication" ou "ContentMetadata" existe em lugar nenhum). Tratado como ilustrativo, não normativo, mesma resolução já aplicada nas duas Sprints anteriores.

---

## Resumo Executivo

Esta Sprint criou `platform/packages/content-hub` do zero e implementou a Fase 1 já prevista no próprio Blueprint (Capítulo 34, "Fase 1 — CMS Engine e Blog Manager"): o ciclo de vida de `Article` (sete estados, `Idea` → `Archived`), `ArticleVersion` como mecanismo de auditoria imutável, e a Taxonomia/Autoria genérica do CMS Engine (`Category`, `ContentTag`, `Author`, `Page`). `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (17 projetos, um a mais que na IMP-003), com 12 testes novos (50 no total).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| `platform/packages/content-hub/` | — | **Inexistente** — criado nesta Sprint | `ls platform/packages/` não o listava antes desta Sprint |
| Article, Page, Media, Category, Tag/ContentTag, Author, Revision/ArticleVersion, Publication | `src/core/content/` | **Inexistente** | `find src/core/content` vazio; nenhum dos 28 diretórios de `src/core/` corresponde |
| idem, em `src/app/features/` | — | **Inexistente** | Nenhum dos 14 diretórios corresponde |
| `BlogAgent`/`BlogAgentExecutor`/`BlogOutputService` | `src/core/agents/blog/` | Adjacente, fora de escopo | Gera `BlogOutput` (fileName, content, createdAt) — artefato de geração por IA, não uma Entidade de domínio (sem status, sem categoria, sem versionamento); IA está explicitamente fora do escopo desta Sprint |
| Commands do Content Hub | — | **Inexistente, também no Blueprint** | `CONTENT_HUB_ARCHITECTURE.md` cataloga 19 Eventos (Capítulo 27) mas nunca um catálogo de Commands — confirmado por leitura integral do documento |
| Events do Content Hub (19) | `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 27 | Já aprovado, reutilizado integralmente | Catálogo completo declarado em `ContentEvent.ts`, quatro efetivamente exercidos nesta Sprint |

---

## Componentes Criados

**Pacote**: `platform/packages/content-hub/` inteiro — `package.json`, `tsconfig.json`, wiring em `tsconfig.json` raiz e em `apps/web` (`package.json` e `tsconfig.json`).

**Entidades**: `Article.ts` (sete estados: `Idea`/`Draft`/`Review`/`Approval`/`Published`/`Outdated`/`Archived`, preservando integralmente a sequência já descrita no Blueprint, Capítulo 23.1), `ArticleVersion.ts` (snapshot imutável), `Category.ts`, `ContentTag.ts` (nome deliberadamente distinto de `Tag`, per ADR-CH-005), `Author.ts` (humano ou Agente de IA, nunca duplicando `Identity`), `Page.ts`.

**Repositórios** (contratos apenas, per Etapa 7): `ArticleRepository.ts`, `ArticleVersionRepository.ts` (sem `update` — imutável), `CategoryRepository.ts`, `ContentTagRepository.ts`, `AuthorRepository.ts`, `PageRepository.ts`.

**Serviços**: `ArticleService.ts`, `ArticleVersionService.ts`, `CategoryService.ts`, `ContentTagService.ts`, `AuthorService.ts`, `PageService.ts`.

**Orquestrador**: `ContentManager.ts` — expõe `createArticle`, `updateArticle`, `publishArticle`, `archiveArticle`, `createCategory`, `createContentTag`, `createAuthor`, `createPage`, `publishPage`, `archivePage`. Toda atualização/publicação de Article produz automaticamente uma nova `ArticleVersion` (auditoria por construção, per Blueprint Capítulo 30).

## Componentes Reutilizados

O padrão `{result, events}` de retorno de operação — sem o campo `command`, pela primeira vez nesta série — ainda assim reutiliza a disciplina de coleta de Domain Events já estabelecida por `CRMManager` e `CommunicationManager`: nenhum Event é publicado em um Event Bus real, todos são coletados e retornados, aguardando uma Sprint de Infrastructure para conectá-los a um `EventPublisher` real.

## Componentes Ausentes

Landing Page Builder (`LandingPage`, `Form`, `FormField`, `FormSubmission`), CTA Manager (`CallToAction`), Download Center (`Download`), Media Library (`MediaAsset`), Newsletter Manager (`NewsletterIssue`), Web Stories Manager (`WebStory`, `StorySlide`), SEO Manager (`SEOProfile`, `Keyword`, `ContentCluster`), Editorial Workflow como Entidade própria (`ContentBrief`, `EditorialCalendar`/`EditorialSlot`), `ContentTemplate` — todos já descritos no Blueprint (Capítulo 22), nenhum implementado nesta Sprint, todos correspondendo às Fases 2–7 já sequenciadas no próprio Roadmap Evolutivo do Blueprint (Capítulo 34).

---

## Lacunas Arquiteturais

**Nenhum Command foi ou pôde ser portado — o Blueprint nunca os catalogou.** Diferente de `CRMCommand.ts` (11 Commands, herdados de `CRM_HUB.md`, Frozen) e `CommCommand.ts` (13 Commands, herdados de `COMMUNICATION_HUB.md`, Official), não existe nenhum documento-fonte com um catálogo equivalente para Content Hub. Esta é a lacuna mais significativa encontrada por esta Sprint, e a recomendação correspondente (Capítulo seguinte) é a mais importante deste relatório.

**`Category`, `ContentTag`, `Author` e `Page` não têm nenhum Evento de domínio próprio** no catálogo de 19 já aprovado — apenas `Article` tem cobertura completa (`ArticleCreated`/`Updated`/`Published`/`FlaggedForUpdate`/`Archived`). `ContentManager` reflete isso com precisão: essas quatro operações retornam `events: []`, nunca um Evento inventado.

**`ArticleFlaggedForUpdate` não foi implementado** — depende do SEO Manager (Fase 3, fora de escopo) para detectar queda de desempenho; o Evento existe no catálogo, mas nenhum produtor real o dispara ainda.

---

## Riscos

Mesmos riscos estruturais já registrados por `CRM_CORE_MIGRATION_REPORT.md` e `CONVERSATION_CORE_MIGRATION_REPORT.md`: nenhum Event Bus real existe, então todo `ContentEvent` retornado é coletado, nunca publicado. Um risco específico desta Sprint: a ausência de catálogo de Commands pode ser confundida, por uma equipe futura, com uma omissão desta implementação, quando na verdade é uma lacuna do próprio documento de arquitetura — sem a correção recomendada abaixo, o risco de reintrodução de confusão nesse ponto persiste.

---

## Recomendações

**Registrar, como item de governança prioritário, a ausência de catálogo de Commands em `CONTENT_HUB_ARCHITECTURE.md`.** Diferente das lacunas pontuais já registradas para CRM (Organization/Contact) e Communication (Participant), esta é uma lacuna sistêmica que afeta o domínio inteiro — recomenda-se que uma futura revisão daquele documento (Change Request, já que seu status é Draft) adicione um Capítulo de Commands, espelhando a estrutura já usada por `CRM_HUB.md`/`COMMUNICATION_HUB.md`. Priorizar Media Library como próxima extensão (Fase 4 do próprio Roadmap), já que `MediaAsset` é referenciado por quase todos os módulos de produção ainda não implementados. Ao implementar SEO Manager (Fase 3), conectar `ArticleFlaggedForUpdate` como o primeiro Evento efetivamente disparado por um produtor diferente do Blog Manager.

---

## Conclusão

Esta foi a primeira Sprint da série a construir não apenas um domínio, mas o próprio chão sobre o qual o domínio existe — nenhum pacote, nenhum contrato, nenhuma linha prévia esperava por esta Sprint. E, ao construir esse chão, ela encontrou algo que nem CRM nem Conversation haviam revelado: um Blueprint inteiro, cuidadosamente escrito, com doze módulos e vinte e cinco Entidades e dezenove Eventos, que nunca chegou a decidir como suas próprias mudanças de estado deveriam se chamar. Isso não diminui o que `CONTENT_HUB_ARCHITECTURE.md` já construiu — apenas confirma que mesmo a documentação mais cuidadosa desta série ainda tem lacunas reais, e que encontrá-las, uma por uma, através da implementação, é exatamente o propósito desta fase da plataforma.
