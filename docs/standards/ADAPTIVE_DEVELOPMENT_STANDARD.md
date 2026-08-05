# Adaptive Development Standard

**Adaptive Business Platform**
*The official Engineering reference for every future Sprint of the platform.*

Status: Draft · Version: 0.1 · Category: Implementation Documentation

---

## Nota de Posicionamento Documental

Este documento **não implementa funcionalidade, não altera código, não modifica arquitetura**. É a consolidação oficial do conhecimento adquirido durante a implementação completa dos dois primeiros domínios ERP desta plataforma — **Supplier Hub** (ERP-001, IMP-201 a IMP-205) e **Purchase Hub** (ERP-001, IMP-301 a IMP-305) — cada um levado, sem exceção nem atalho, pelo mesmo ciclo de seis etapas (Capítulo 2). Todo padrão, decisão e convenção aqui descrito já foi comprovado duas vezes, em dois domínios genuinamente distintos, nunca proposto de forma especulativa.

A partir deste documento, a arquitetura da Adaptive deixa de depender de memória individual e passa a depender de regra explícita. Todo futuro Sprint — começando pelo Inventory Movement Hub (Capítulo 17) — deve respeitá-lo integralmente.

Per `DOCUMENTATION_CONSTITUTION.md`, §8.1, todo novo documento nasce obrigatoriamente em status **Draft**. Este documento não é exceção — nasce Draft e deve avançar para Official através do processo de Change Management (Constitution, §10) assim que revisado pela autoridade apropriada, nunca por auto-declaração.

**Fontes analisadas integralmente, na íntegra, para a produção deste documento:** `ERP_FOUNDATION_REPORT.md` (ERP-001); `UX_001_ADAPTIVE_DESIGN_SYSTEM.md`; `UX_002_OPERATIONAL_EXPERIENCE.md`; `IMP_201_SUPPLIER_HUB_CORE_REPORT.md`; `IMP_202_SUPPLIER_PERSISTENCE_REPORT.md`; `IMP_203_SUPPLIER_HTTP_API_REPORT.md`; `IMP_204_SUPPLIER_FRONTEND_REPORT.md`; `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`; `IMP_301_PURCHASE_HUB_CORE_REPORT.md`; `IMP_302_PURCHASE_PERSISTENCE_REPORT.md`; `IMP_303_PURCHASE_HTTP_API_REPORT.md`; `IMP_304_PURCHASE_FRONTEND_REPORT.md`; `IMP_305_PURCHASE_WORKSPACE_REPORT.md`.

---

## Capítulo 1 — Filosofia da Adaptive

### 1.1 A Adaptive como Sistema Operacional para Empresas

A Adaptive Business Platform não é um único sistema monolítico — é um **Sistema Operacional para Empresas**: um conjunto de domínios de negócio independentes (Hubs), cada um um Bounded Context completo, que uma Empresa real liga e desliga conforme seu próprio Business Profile, exatamente como um sistema operacional carrega e descarrega processos. `ERP_FOUNDATION_REPORT.md` torna isso explícito: uma Empresa de serviço puro pode operar com os cinco novos Hubs de ERP inteiramente desabilitados; uma Empresa de revenda usa Purchase/Supplier/Inventory Movement sem nunca habilitar Production; nenhum Hub pressupõe a existência de outro além do que declara como dependência real de Evento.

Isso significa, na prática de engenharia: **nenhum Hub pode presumir que outro Hub existe em tempo de execução.** Toda referência cruzada é um identificador opaco (`string`), nunca um tipo importado — confirmado, sem exceção, em `SupplierCatalogItem.productId`, `PurchaseOrderItem.productId`, `ReorderRule.preferredSupplierId`, e em todo Repository Interface especificado por ERP-001 ("toda referência a Entidade de outro Hub é um identificador opaco no payload, nunca um tipo importado de outro domínio").

### 1.2 Domain-Driven Design

Cada Hub é modelado com o vocabulário DDD completo — Aggregate Roots, Entities, Value Objects, Commands, Events, Repositories, Policies, Factories, Services, Managers, Domain Errors — nunca um subconjunto informal. O Capítulo 5 detalha a responsabilidade exata de cada elemento; a garantia filosófica aqui é mais simples: **o domínio é a única fonte da verdade.** HTTP é transporte puro (Capítulo 7); Frontend é infraestrutura de integração (Capítulo 8); Workspace é experiência operacional (Capítulo 9). Nenhuma dessas três camadas decide uma regra de negócio — elas apenas expõem o que o domínio já decidiu.

### 1.3 Event Driven

Todo Fato relevante de domínio é um Evento, nunca uma instrução — a mesma disciplina "Publish Facts, Not Commands" já herdada do CRM Hub e replicada sem exceção por `SupplierEvent`/`PurchaseEvent`. Um Manager nunca publica em um Event Bus real (nenhuma implementação de `EventPublisher` existe ainda nesta plataforma) — Eventos são coletados e devolvidos ao chamador como parte do resultado da operação (`{result, command, events}`, Capítulo 5.10), despachados pela infraestrutura quando essa infraestrutura existir. Um Command sem Evento correspondente no catálogo aprovado nunca ganha um Evento inventado para preencher a lacuna — ele retorna `events: []`, permanentemente, documentado (Capítulo 11).

### 1.4 Baixo Acoplamento

Nenhum Hub acessa a estrutura interna de outro. Nenhum Command de um Hub é invocado diretamente por outro Hub. Toda comunicação cruzada é, no máximo, um identificador opaco no payload de um Evento — nunca uma leitura de estrutura interna, nunca uma chamada de escrita síncrona entre domínios. `ERP_FOUNDATION_REPORT.md` verificou isso explicitamente para os cinco novos Hubs de ERP e confirmou ausência de dependência circular no `ERP_CONTEXT_MAP.md` — um DAG completo, nunca um ciclo.

### 1.5 Alta Coesão

Um Manager, um Hub, um Bounded Context. Cada Service dentro de um Hub tem responsabilidade única — um Service por Aggregate ou por concern claramente delimitado (`SupplierCatalogService` cuida exclusivamente da associação Fornecedor↔Produto; `ReceivingService` cuida exclusivamente do recebimento físico). Nenhuma regra de negócio é duplicada entre Services do mesmo Hub, nem entre Hubs distintos.

### 1.6 Managers como Única Fachada

Nenhum consumidor externo — nenhuma rota HTTP, nenhum Hook de Frontend, nenhuma tela de Workspace — acessa um Service, um Repository ou uma Factory diretamente. O Manager é o único ponto de entrada de Command e de Query de um Hub, em toda camada, sem exceção. Esta disciplina é verificada em cada Sprint da série (`IMP_201`, Capítulo 4; `IMP_301`, Capítulo 5) e nunca foi violada.

### 1.7 Arquitetura Primeiro, Código Depois

Nenhuma linha de código de domínio é escrita antes de a arquitetura correspondente existir, em status Draft ou superior, em `docs/architecture/`. ERP-001 produziu dez documentos de arquitetura, todos Draft, **zero código** — só então IMP-201 (Supplier) e, mais tarde, IMP-301 (Purchase) traduziram essa arquitetura em pacotes reais. Nenhum domínio desta plataforma jamais começou pela implementação.

---

## Capítulo 2 — Ciclo Oficial de Implementação

Todo domínio da Fase 2 desta plataforma segue, sem pular etapa, o seguinte fluxo:

```
Arquitetura
    ↓
Auditoria (Passo 1, Capítulo 3 — obrigatória a cada etapa, não apenas uma vez)
    ↓
Core
    ↓
Persistência
    ↓
HTTP API
    ↓
Frontend Infrastructure
    ↓
Workspace
    ↓
Validação (pnpm typecheck / build / lint / test, três execuções)
    ↓
Documentação (Relatório de Sprint em docs/implementation/)
```

**Comprovação dupla.** Este ciclo não é uma proposta — é o registro exato do que aconteceu duas vezes:

| Etapa | Supplier Hub | Purchase Hub |
|---|---|---|
| Arquitetura | ERP-001 → `SUPPLIER_HUB.md` (Draft) | ERP-001 → `PURCHASE_HUB.md` (Draft) |
| Core | IMP-201 | IMP-301 |
| Persistência | IMP-202 | IMP-302 |
| HTTP API | IMP-203 | IMP-303 |
| Frontend Infrastructure | IMP-204 | IMP-304 |
| Workspace | IMP-205 | IMP-305 |

**Nenhum domínio poderá pular etapas.** Cada Sprint desta série declarou explicitamente, em sua própria abertura, quais camadas estavam congeladas ("Nenhuma alteração poderá ser feita em: ..."), listando exatamente as etapas já concluídas — o mecanismo de enforcement é textual e obrigatório em todo Sprint futuro: uma Sprint de Persistência nunca pode alterar Core; uma Sprint de HTTP nunca pode alterar Persistência; uma Sprint de Workspace nunca pode alterar Frontend Infrastructure. Regra sem exceção documentada em toda a série.

---

## Capítulo 3 — Passo 1 Obrigatório

**Nenhuma implementação começa sem auditoria.** Toda Sprint desta série, sem exceção, abriu com um "Passo 1" explícito, comparando:

- **Arquitetura** — o que o documento Draft/Official já especifica.
- **Código** — o que já existe de fato no monorepo (via busca/grep completo, nunca amostragem).
- **Documentação** — o que outros relatórios já registraram sobre o mesmo domínio ou domínios vizinhos.
- **Blueprint** — o domínio de referência já validado (Supplier Hub para todo domínio a partir de IMP-301; Supplier Hub + Purchase Hub para todo domínio a partir deste documento, Capítulo 16).

E respondendo explicitamente quatro perguntas, adaptadas por camada mas sempre presentes em espírito:

1. **Existe código morto?**
2. **Existe domínio parcial?**
3. **Existe divergência?**
4. **Existe oportunidade de reutilização?**

**Prova de que não é burocracia — achados reais, cada um resolvido sem correção silenciosa:**

- IMP-201 encontrou um stub `Supplier`/`SupplierRegistered` morto dentro do CRM Hub (Frozen, nunca implementado) — documentado, Amendment proposta, nunca corrigido silenciosamente naquele Hub.
- IMP-301 confirmou, por auditoria completa, que Purchase Hub era território genuinamente livre — nenhum código morto, apenas placeholders de Frontend já autodocumentados (FUN-106).
- IMP-303 encontrou, através do próprio rigor do teste de integração completo (não da leitura de código), um bug real de Persistência (IMP-302) — isolado, documentado, testado como conhecido (`it.fails`), nunca corrigido fora do escopo autorizado da Sprint.
- IMP-305 encontrou uma colisão real de rota (`/purchases` já apontava para um Workspace fictício da FUN-106) — resolvida pela substituição íntegra prevista desde ERP-001, nunca uma segunda rota, nunca uma correção silenciosa.

**Regra final deste Capítulo, citada literalmente em toda Sprint da série: "Nunca corrigir silenciosamente. Documentar. Justificar. Propor Amendment quando necessário."** Uma divergência encontrada e não documentada é, por definição, uma violação deste Standard — independentemente de quão pequena pareça.

---

## Capítulo 4 — Estrutura dos Pacotes

### 4.1 `packages/{domain}-hub/` — Core

```
src/
  {ValueObject}.ts × N        — Value Objects do domínio
  {Entity}.ts × N             — Entities, uma delas o Aggregate Root
  {Domain}Command.ts          — união fechada de Commands
  {Domain}Event.ts            — união fechada de Events
  {Entity}Repository.ts × N   — Repository Interfaces, uma por Entidade com Repository próprio
  {Domain}DomainError.ts      — hierarquia de erro tipada, específica do Hub
  {Domain}Policy.ts           — decisões puras, nunca lança exceção
  {Domain}Validator.ts        — validação real, lança Domain Error
  {Domain}Factory.ts          — construção de toda Entidade
  {Entity}Service.ts × N      — um Service por Aggregate/concern
  {Domain}Manager.ts          — única fachada pública
  index.ts                    — barrel de produção
  testing/InMemoryFakes.ts    — fakes em memória, nunca no barrel principal
package.json                  — exports "." e "./testing"
tsconfig.json                 — composite: true, references aos pacotes usados
```

### 4.2 `packages/persistence/` — Implementações Reais

```
src/
  db/
    client.ts                 — createDatabase, único ponto de conexão real
    config.ts                 — resolvePersistenceConfig (development/testing/production)
    migrate.ts                — runMigrations, idempotente
    migrations/000N_{domain}.sql
    sqlUtil.ts                — conversões compartilhadas (toMs/fromMs/orNull/toBoolInt/...)
  repositories/{domain}/Sqlite{Entity}Repository.ts × N
  composition/createManagerRegistry.ts — único ponto de alternância Fake/Real
  testing/createTestDatabase.ts
```

### 4.3 `apps/api/` — HTTP

```
src/
  dtos/{domain}.dto.ts
  mappers/{domain}.mapper.ts
  errors/mapDomainError.ts    — heurística genérica, intocada por Sprint de domínio
  errors/map{Domain}Error.ts  — tradução específica por code, quando o Core lança erro tipado
  routes/{domain}.ts
  plugins/managers.ts         — Composition Root, chama createManagerRegistry uma única vez
  plugins/openapi.ts          — tag do domínio adicionada
```

### 4.4 `apps/web/src/core/{domain}/` — Frontend Infrastructure

```
{domain}.dto.ts               — cópia deliberada dos DTOs de apps/api, nunca import cruzado
{domain}Client.ts             — um método por endpoint, via apiClient singleton
{domain}QueryKeys.ts          — toda chave de cache centralizada
{domain}Cache.ts              — helpers de sincronização pós-Mutation
use{Query}.ts × N             — um Hook por Query
use{Command}.ts × N           — um Hook por Command
testing/realApiServer.ts      — helper de teste, nunca exportado por index
```

### 4.5 `apps/web/src/pages/{domain}/` — Workspace

```
{Domain}Page.tsx
{domain}Sections.ts           — fonte única das seções, hasRealData por seção
sections/*.tsx
Create{Entity}Drawer.tsx × N  — compartilhado entre Ação Rápida e botão in-tab
{domain}HistoryLog.ts         — log de sessão honesto, apenas quando Events não atravessam HTTP
```

Este layout — `core/{domain}/` consolidado, distinto do padrão fragmentado anterior (`core/http/dtos/`, `core/http/clients/`, `core/query/`) usado pelos domínios pré-ERP — é **obrigatório para todo domínio da série ERP a partir de IMP-204**, decisão deliberada, nunca um desvio silencioso.

---

## Capítulo 5 — DDD: Responsabilidade de Cada Elemento

| Elemento | Responsabilidade | Nunca |
|---|---|---|
| **Aggregate Root** | A Entidade referenciada externamente por identificador; garante a consistência interna do Aggregate inteiro | Referenciado por outro Hub além de por id opaco |
| **Entity (parte interna)** | Vive exclusivamente dentro de um Aggregate, sem Repository próprio (`SupplierContact`, `PurchaseOrderItem`) | Referenciada por identificador fora do Aggregate que a contém |
| **Entity (com Repository)** | Tem ciclo de vida e consulta próprios, ainda que pertença ao mesmo Hub (`SupplierCatalogItem`, `Receiving`) | Confundida com o Aggregate Root que a referencia |
| **Value Object** | Substitui um primitivo sempre que a arquitetura o define (`TaxId`, `Money`, `ApprovalThreshold`) | Substituído por um primitivo "por conveniência" |
| **Command** | Uma instrução, sempre com `operationId`/`type`/`requestedAt`, união fechada, exatamente a lista aprovada | Inventado além do catálogo aprovado |
| **Event** | Um Fato já consumado, união fechada, exatamente `DOMAIN_EVENT_CATALOG.md` | Inventado para preencher uma lacuna de Command-sem-Event (Capítulo 11) |
| **Repository Interface** | Contrato de persistência, apenas interface no Core | Implementado dentro do próprio pacote de domínio |
| **Policy** | Decisão pura, determinística, sem efeito colateral, nunca lança exceção | Usada para lançar erro — essa é responsabilidade do Validator |
| **Validator** | Validação real, consulta a Policy, lança Domain Error tipado | Substituída por um catálogo puramente declarativo adiado para um "engine" nunca implementado |
| **Factory** | Construção de Entidade — id, timestamps, defaults | Usada como Service — nunca contém regra de negócio |
| **Service** | Uma responsabilidade única por Aggregate/concern | Duplica regra de negócio já expressa em outro Service |
| **Manager** | Única fachada pública do Hub; orquestra Services; retorna `{result, command, events}` | Contornado por qualquer camada externa |
| **Domain Error** | Hierarquia tipada, `code` estável, específica do Hub | Reaproveitada de outro Hub |

**Padrão de retorno do Manager**, idêntico nos dois Hubs de referência:

```ts
interface {Domain}OperationResult<TEntity> {
  readonly result: TEntity;
  readonly command: {Domain}Command;
  readonly events: readonly {Domain}Event[];
}
```

Quando um método do Manager não corresponde a nenhum dos Commands aprovados (ex.: `PurchaseManager.evaluateReorderRule`, um mecanismo de orquestração interna, não um Command do catálogo), ele usa uma forma reduzida sem `command` (`{Domain}EvaluationResult<TEntity> = {result, events}`) — nunca finge ser um Command inventando um. Exposto como endpoint/Hook mesmo assim, porque é público no Manager (Capítulo 7.3/8.3).

---

## Capítulo 6 — Persistência

- **Repository Interfaces** viram uma classe `Sqlite{Entity}Repository` por interface, sem nenhuma mudança de contrato — o Core nunca precisa mudar quando a Persistência real chega.
- **SQLite** via `node:sqlite` nativo do Node (nunca um driver npm — `better-sqlite3` foi avaliado e descartado por exigir compilação nativa indisponível neste ambiente). `PRAGMA journal_mode = WAL` e `PRAGMA foreign_keys = ON` são os dois únicos PRAGMA, ativos desde o primeiro pacote de Persistência da plataforma.
- **Transactions** — todo método de Repository que escreve em mais de uma tabela (o Aggregate Root e sua tabela filha interna) envolve `BEGIN`/`COMMIT`/`ROLLBACK` explícitos. Testado com uma violação de constraint real (chave primária duplicada), nunca uma simulação.
- **Foreign Keys** — declaradas sempre que a tabela referenciada existe dentro do mesmo Hub, mesmo quando a Entidade referenciante tem Repository Interface própria (não apenas para partes internas sem Repository) — critério estabelecido por `supplier_catalog_items`/`supplier_contracts`/`supplier_performance_records`, todas com FK para `suppliers` apesar de cada uma ter sua própria Repository Interface. Estendido pela primeira vez a uma referência cruzada entre dois Aggregate Roots distintos do mesmo Hub (`purchase_orders.requisition_id` ↔ `purchase_requisitions.purchase_order_id`) — nunca entre Hubs diferentes (`product_id`/`supplier_id` cruzando fronteira de domínio nunca ganham FK).
- **Surrogate Keys** — quando um Value Object de lista não tem identificador próprio no Core (`ReceivingLine`, `PurchaseRequisitionLine`), a tabela filha usa `INTEGER PRIMARY KEY AUTOINCREMENT` como chave substituta, nunca lida de volta para o domínio.
- **Boolean helpers** — `node:sqlite` não tem tipo boolean; `toBoolInt`/`fromBoolInt` em `db/sqlUtil.ts` (adicionados no primeiro campo boolean real da plataforma, `ReorderRule.active`) são a única conversão aceita.
- **Migrations** — um arquivo `.sql` numerado por Sprint de Persistência (`000N_{domain}.sql`), `CREATE TABLE IF NOT EXISTS`/`CREATE INDEX IF NOT EXISTS` (idempotente por construção), aplicado dentro de uma única transação, registrado em `_migrations`. Nunca antecipa tabela de um domínio futuro.
- **Rollback** — testado explicitamente em pelo menos dois cenários por domínio: uma violação de PRIMARY KEY dentro da mesma transação (item duplicado) e, quando aplicável, uma violação de FOREIGN KEY.
- **Regra para objetos internos** — uma parte interna de Aggregate sem Repository Interface própria (`supplier_contacts`, `purchase_order_items`) é regravada por completo (`DELETE` + reinserção) na mesma transação do Aggregate Root a cada `update`. **Lição real, encontrada por IMP-303 e registrada aqui como regra permanente:** este padrão só é seguro enquanto a tabela filha nunca for, ela mesma, referenciada por FOREIGN KEY de uma terceira tabela — quando for (`purchase_order_items` referenciada por `receiving_lines`), o `DELETE` viola essa FOREIGN KEY assim que a terceira tabela já tiver ao menos uma linha, mesmo dentro da mesma transação. **Toda Sprint futura de Persistência deve avaliar, antes de escolher o padrão delete-e-reinserção, se a tabela filha já é ou poderá ser referenciada por uma tabela neta** — quando a resposta for sim, o padrão correto é um `diff` (atualizar as linhas que mudaram, inserir apenas as novas, excluir apenas as removidas), nunca a recriação completa.

---

## Capítulo 7 — HTTP

- **OpenAPI First** — Schemas de `body`/`params` declarados diretamente no registro de cada rota Fastify; `@fastify/swagger` gera `/documentation`/`/documentation/json` automaticamente. **Nunca escrever documentação OpenAPI manual.**
- **DTOs** — nunca o tipo de domínio como payload HTTP. Achatamento de Value Object: campo único primitivo (`TaxId` → `taxId: string`) é achatado direto; dois ou mais campos que sempre viajam juntos (`Money`) permanecem aninhados; um VO cujo único campo é ele mesmo um objeto (`ApprovalThreshold = {limit: Money}`) tem o *wrapper* achatado, nunca o objeto interno (`threshold: MoneyDto`, nunca `{limit: MoneyDto}`).
- **Mapper** — uma função pura `to{Entity}ResponseDto` por Entidade exposta; `Date` sempre vira ISO 8601.
- **Error Mapping** — dois níveis, nunca um só: `mapDomainError.ts` (heurística genérica por regex de mensagem, congelada desde sua criação, nunca alterada por Sprint de domínio) como fallback universal; `map{Domain}Error.ts` (mapeamento por `instanceof`/`code`, criado apenas quando o Core do Hub lança uma hierarquia de erro tipada) como tradução específica, sempre delegando ao genérico para qualquer erro não reconhecido.
- **Typed Errors** — quando `PurchaseDomainError`/`SupplierDomainError` existe, o mapeamento é sempre por `code`, nunca por regex — a heurística de texto é reservada exclusivamente para Managers que ainda lançam `Error` puro.
- **PATCH seguro** — nunca reconstruir o corpo da requisição com uma chave presente e valor `undefined` explícito (o bug real de IMP-203: `{...existing, ...input}` no Core sobrescreve um campo já existente quando `input` contém uma chave `undefined`). Construção segura: desestruturar por resto e só incluir uma chave quando de fato enviada. **Corolário comprovado por IMP-303: se o Core do domínio não expõe nenhum Command de atualização parcial por merge, nenhum endpoint `PATCH` deve ser criado — confirmar isso explicitamente na auditoria (Capítulo 3) antes de assumir que um `PATCH` é necessário.**
- **ManagerRegistry** — único Composition Root, chamado exatamente uma vez, em `managersPlugin`. Nenhuma rota instancia um Manager, Service ou Repository diretamente.
- **Transporte puro** — todo handler segue `HTTP → DTO → Manager → DTO → HTTP`; validação limitada a tipo/campo obrigatório/formato/enum — jamais regra de negócio.

---

## Capítulo 8 — Frontend

- **`core/{domain}/`** — diretório único e consolidado (Capítulo 4.4), obrigatório desde IMP-204.
- **ApiClient** — instância única (`apiClient`), nunca uma segunda origem de `fetch`.
- **DTOs** — cópia deliberada dos DTOs de `apps/api`, nunca compartilhados entre as duas aplicações.
- **Hooks** — exaustivamente um por endpoint aprovado, mapeamento 1:1, nunca invenção, nunca omissão — incluindo métodos públicos do Manager que não correspondem a um Command aprovado (Capítulo 5, `evaluateReorderRule`), porque são públicos e reais.
- **Query Keys** — centralizadas em `{domain}QueryKeys.ts`, nunca literalizadas inline em cada Hook.
- **Cache** — apenas `setQueryData` (substituir-ou-acrescentar em listas de chave única); nenhum `invalidateQueries` nem optimistic update sem um padrão já consolidado existente para copiar. **Limitação permanente e documentada:** uma lista cujo cache é chaveado por um campo mutável da própria Entidade (ex.: `requisitionsByStatus(tenantId, status)`) nunca é sincronizada automaticamente entre chaves quando esse campo muda — nenhuma estratégia nova pode ser inventada para mascarar isso dentro do escopo de uma Sprint de Frontend Infrastructure ou Workspace; é uma decisão de padrão que exige sua própria Sprint de consolidação.
- **Mutations/Queries** — mesma exaustividade dos Hooks: um por endpoint.
- **Error Handling** — `ApiError`/`ApiNetworkError` (`core/http/ApiError.ts`), nunca um sistema paralelo; `undefinedOn404` no Client, nunca no Hook, para tratar ausência como dado, não como erro.
- **Nunca acessar HTTP diretamente na UI** — a razão de existir de `core/{domain}/`.

---

## Capítulo 9 — Workspace

- **Toda tela consome apenas Hooks** de `core/{domain}/` — confirmado, em cada Sprint de Workspace, por busca completa de zero import de `ApiClient`/`fetch`/Manager em `pages/{domain}/`.
- **Nunca acessar HTTP diretamente.**
- **Nunca acessar Managers diretamente** — nem mesmo em processo.
- **Nunca criar lógica de negócio** — um botão de ação só aparece quando o estado atual da Entidade já permite aquela transição (mesma máquina de estados já implementada em `{Domain}Policy`, nunca reimplementada no Workspace); se o servidor ainda assim rejeitar (corrida entre abas, por exemplo), o erro real aparece via toast, nunca escondido nem contornado no cliente.
- **Estrutura** — `{Domain}Page.tsx` como único ponto que resolve `tenantId` e a Query de topo mais relevante; `SectionSubNav` para navegação por abas; `PageHeader.actions` para Ações Rápidas cross-aba; um log de sessão honesto (Capítulo 11) quando Eventos reais não atravessam HTTP; `NotConnectedNotice`/`EmptyState` para toda lacuna real, nunca escondida.

---

## Capítulo 10 — UX

- **Design System (UX-001)** — `styles/tokens.css`, Custom Properties CSS, tema escuro como padrão oficial (nunca condicionado a `prefers-color-scheme`), tema claro como sobrescrita das mesmas variáveis. Zero valor literal fora da escala de tokens. Ícones exclusivamente Lucide. Fonte oficial Inter, hospedada localmente. `PageContainer`/`PageHeader`/`AsyncState`/`WidgetCard`/`StatCard` como o esqueleto que toda página herda.
- **`ProcessFlow`** (UX-002, obrigatório) — cadeia horizontal de etapas com status real (`completed`/`current`/`pending`/`blocked`), computado exclusivamente de dado já carregado. **Nunca criar um componente semelhante** — já comprovado reutilizável em três domínios (Supplier, CRM, Purchase).
- **`LiveIndicator`** + `useRecentlyChanged` — acende apenas quando um valor real muda de fato entre dois renders, nunca decorativo, nunca um cronômetro arbitrário.
- **`PageHeader.actions`** — Ações Rápidas cross-aba, sempre reais e já suportadas pelo Manager; nunca uma ação inexistente; um único Drawer compartilhado entre o gatilho de header e o gatilho in-tab.
- **`NotConnectedNotice`** — o primitivo de honestidade: nomeia exatamente quais campos ainda não são reais e por quê.
- **`SectionSubNav`** — navegação contextual por módulo, `hasRealData` sinaliza (selo "Prévia") quando uma seção não tem dado real por trás, nunca escondendo essa condição.
- **Componentes reutilizáveis** — critério de decisão formalizado no Capítulo 14.
- **Interface limpa, fluxos visuais** — avaliados a cada Sprint (nunca uma reforma visual ampla e não solicitada); token/hierarquia já estabelecidos nunca são substituídos sem necessidade real comprovada.

---

## Capítulo 11 — Eventos

- **Quando criar** — apenas quando já está no catálogo aprovado (`DOMAIN_EVENT_CATALOG.md`), um por Fato real de domínio, nunca um por Command.
- **Quando não criar** — sempre que um Command aprovado não tem Evento catalogado correspondente. Codificado pela primeira vez pelo Supplier Hub (dois Commands sem Evento) e repetido exatamente pelo Purchase Hub (quatro Commands sem Evento): o método do Manager retorna `events: []` permanentemente — nunca um Evento inventado, documentado inline no Command, no método do Manager, e testado explicitamente.
- **Commands sem Events** — a lacuna é da arquitetura aprovada, nunca da implementação; corrigir a arquitetura (adicionar o Evento faltante ao catálogo) é decisão de uma Sprint de arquitetura futura, nunca de uma Sprint de Core/HTTP/Frontend/Workspace.
- **Timeline** — quando nenhum endpoint HTTP do Hub devolve o Evento de domínio (confirmado, sem exceção, para Supplier e Purchase — cada handler HTTP extrai apenas `result`, descartando `command`/`events` na própria fronteira), o Workspace nunca inventa uma Timeline. Constrói, em vez disso, um log de sessão local (`{domain}HistoryLog.ts`), gravado apenas no momento exato em que uma Mutation já confirmada pelo servidor resolve com sucesso — nunca antes, nunca sincronizado com o servidor, sempre marcado `hasRealData: false` mais `NotConnectedNotice`.
- **Eventos reais, nunca fabricados** — todo Evento exibido em qualquer camada é sempre o resultado literal de uma operação real já confirmada, nunca uma simulação, nunca uma reconstrução retroativa.

---

## Capítulo 12 — Limitações

- **Como documentar** — no capítulo "Limitações"/"Divergências Encontradas" do próprio relatório de Sprint, no momento em que a limitação é encontrada — nunca retroativamente, nunca em um documento separado que ninguém mais lê.
- **Quando usar `NotConnectedNotice`** — qualquer seção de Workspace que exibiria um campo ou uma lista sem nenhuma Query real por trás; o componente nomeia exatamente os campos afetados e o contexto (Hub) responsável pela lacuna.
- **Quando usar Placeholder** — quando uma tela inteira, não apenas um campo, ainda não tem domínio real algum por trás (o precedente FUN-106, décadas atrás no histórico do produto — antes de qualquer Purchase Hub real existir). **Lição codificada por IMP-305: um Placeholder é, por definição, temporário — deve ser substituído integralmente, na mesma rota, no momento em que o domínio real correspondente for concluído. Nunca deixar um Placeholder ao lado do domínio real como uma segunda rota "só por precaução."**
- **Quando criar Amendment** — apenas contra um documento Official/Frozen, quando uma divergência genuína de arquitetura ou governança é encontrada (o stub `Supplier` Frozen do CRM Hub). Uma decisão de implementação local a uma única Sprint de Core/HTTP/Frontend/Workspace nunca é uma Amendment — é apenas uma decisão documentada no próprio relatório.
- **Regra final, acima de todas: nunca esconder limitações.** Nenhuma camada — Core, Persistência, HTTP, Frontend, Workspace — compensa uma limitação de outra camada. A Adaptive deve refletir fielmente o estado real da plataforma, sempre.

---

## Capítulo 13 — Testes

| Camada | Técnica obrigatória | Nunca |
|---|---|---|
| Core | `testing/InMemoryFakes.ts`, um Fake por Repository Interface | Exportado pelo barrel de produção |
| Persistência | SQLite real (`:memory:` ou arquivo temporário, `node:sqlite`) | Mock de banco de dados |
| HTTP | `fastify.inject()` contra um servidor real, totalmente composto | Mock da camada HTTP |
| OpenAPI | Asserção de `/documentation/json` — tag do domínio + lista exata de `paths` | Documentação nunca verificada por teste |
| Hooks | `fetch` mockado, ambiente jsdom — única exceção documentada e justificada (conflito real entre jsdom e `@abp/persistence`, IMP-204) | Mockar a lógica do próprio Hook |
| Cliente HTTP do Frontend | Servidor real via `testing/realApiServer.ts` (ambiente Node, sem o conflito acima) | Nenhuma cobertura sem mock em algum nível |
| Workspace | Hooks reais + `fetch` mockado (`demoApiFetchMock.ts`, simulação em memória do suficiente da máquina de estados do domínio, nunca uma reimplementação completa) | Mockar a lógica do próprio Workspace |
| Integração | Fluxo completo (criar → aprovar → ... → estado terminal), não apenas asserções isoladas | Cobertura só de casos triviais |

**Regra geral, citada literalmente em toda Sprint desta série: "Nunca utilizar mocks quando a camada puder ser testada de verdade."** Cada camada tem sua própria técnica real correspondente (tabela acima); um mock só é aceitável quando a própria camada torna impossível o teste real (a fronteira `fetch`, nunca a lógica atrás dela).

**Validação Final obrigatória, a cada Sprint:** `pnpm typecheck`, `pnpm build`, `pnpm lint`, `pnpm test` — a suíte completa executada **três vezes**; qualquer flake encontrado é documentado, nunca ignorado, nunca corrigido fora do escopo autorizado da Sprint quando o flake é pré-existente e não relacionado.

---

## Capítulo 14 — Reutilização

**Criar componente** — quando nenhuma forma genérica já cobre a necessidade real (`SupplierCard`, `PurchaseStatusBadge` — nenhum `MetricCard`/`Badge` genérico já cobria "resumo de um Fornecedor" ou "status de um Purchase Order").

**Reutilizar componente** — sempre que um primitivo genérico do Design System já cobre a necessidade exatamente. Um `{Domain}MetricCard` foi proposto e deliberadamente recusado em toda Sprint desta série — `MetricCard` já cobre label+valor+tom+hint, um wrapper exclusivo seria redundante. A decisão de recusar deve ser documentada tão explicitamente quanto a decisão de criar.

**Generalizar componente** — apenas depois que um padrão se repete em **três ou mais** instâncias reais e comprovadas, nunca a partir de uma única ocorrência nem de forma especulativa. IMP-305 identificou explicitamente dois candidatos reais neste ponto exato (`EntitySummaryCard`, quatro instâncias: `SupplierCard`/`ContractCard`/`PurchaseOrderCard`/`ReceivingCard`; um `createStatusBadge(toneMap, labelMap)`, três instâncias) — nenhum dos dois foi extraído durante aquela Sprint, ambos ficam registrados como candidatos de alta prioridade para a próxima Sprint de consolidação transversal.

**Quando NÃO abstrair** — durante qualquer Sprint cuja instrução explícita seja "não refatorar" (o caso comum de todo capítulo "Qualidade" desta série) — a observação é sempre documentada, a execução é sempre adiada para uma Sprint dedicada de consolidação, nunca smuggled para dentro de uma Sprint cujo entregável principal é outra coisa.

---

## Capítulo 15 — Checklist Oficial

A forma operacional e curta deste capítulo vive em `docs/standards/ADAPTIVE_ENGINEERING_CHECKLIST.md` — de uso obrigatório antes da aprovação de qualquer Sprint. As dez perguntas que o compõem:

1. Arquitetura respeitada?
2. Auditoria realizada?
3. Blueprint seguido?
4. Código duplicado?
5. Componentes reutilizados?
6. Limitações documentadas?
7. Testes completos?
8. OpenAPI validada?
9. Workspace sem acesso direto ao HTTP?
10. Documentação atualizada?

---

## Capítulo 16 — Blueprints Oficiais

**Supplier Hub e Purchase Hub tornam-se, a partir deste documento, os blueprints oficiais da Fase 2.** Não porque sejam os domínios mais simples, nem os mais valiosos ao negócio — mas porque são os únicos dois domínios já levados, integralmente e duas vezes seguidas, pelo ciclo completo de seis etapas (Capítulo 2), sem nenhum atalho e sem nenhuma exceção. A segunda execução (Purchase Hub) não apenas repetiu o padrão — comprovou que o padrão sobrevive ao contato com um domínio genuinamente mais complexo (três Aggregate Roots em vez de um, doze Commands em vez de nove, seis Queries de Frontend em vez de uma).

**Decisões que se tornaram padrão oficial** (aplicam-se a todo domínio futuro, sem exceção):

- Auditoria Passo 1 obrigatória, antes de qualquer código (Capítulo 3).
- `{Domain}OperationResult<T> = {result, command, events}` como forma de retorno do Manager (Capítulo 5).
- Commands sem Evento correspondente retornam `events: []`, nunca um Evento inventado (Capítulo 11).
- Domain Errors tipados, por Hub, mapeados por `code` no HTTP quando existem (Capítulo 7).
- `core/{domain}/` consolidado como layout obrigatório de Frontend Infrastructure (Capítulo 4.4).
- `ProcessFlow`/`LiveIndicator`/`NotConnectedNotice`/`SectionSubNav`/`PageHeader.actions` como primitivos obrigatórios de Workspace (Capítulo 10).
- Testes reais por camada, mock reservado exclusivamente para a fronteira `fetch` (Capítulo 13).
- Nunca corrigir silenciosamente — documentar, justificar, propor Amendment (Capítulo 3/12).

**Decisões que permanecem específicas de domínio, nunca super-generalizadas:** a unicidade de `TaxId` por Tenant (regra de negócio exclusiva do Supplier Hub, nunca implícita em outro domínio); a estrutura de três Aggregate Roots do Purchase Hub (`PurchaseOrder`/`PurchaseRequisition`/`ReorderRule`, uma consequência do próprio domínio de Procurement, não um número mínimo ou máximo obrigatório para todo Hub futuro); o achatamento específico de `ApprovalThreshold` (uma decisão de forma de DTO, correta para um VO-que-envolve-outro-objeto, não uma regra sobre todo VO futuro além do princípio geral já descrito no Capítulo 7).

---

## Capítulo 17 — Roadmap da Fase 2

Registrado oficialmente, per `ERP_FOUNDATION_REPORT.md`, Capítulo 6 — ordem por menor acoplamento de dependência de Evento, um domínio nunca começa antes do domínio do qual depende:

```
Supplier Hub (✅ completo — ERP-001, IMP-201–205)
        ↓
Purchase Hub (✅ completo — ERP-001, IMP-301–305)
        ↓
Inventory Movement Hub (✅ completo — ERP-001, IMP-401–405) — depende de Purchase Hub (PurchaseReceived/PurchasePartiallyReceived)
        ↓
Production Hub (✅ completo — ERP-001, IMP-501–505) — depende de Inventory Movement Hub
        ↓
Fiscal Hub — depende de Finance/Commerce Hub, já existentes; independente dos três anteriores, podendo ser paralelizado
        ↓
Financial Hub — reconciliação, extensão de Finance Hub (nunca um novo Owner, per ADR-ERP-001)
```

**Atualizado por IMP-505** (Capítulo 17, índice de status) — Production Hub torna-se o quarto domínio
ERP integral desta plataforma, mesmo ciclo de seis etapas de Supplier/Purchase/Inventory Movement Hub,
sem exceção nem atalho. Ver `IMP_505_PRODUCTION_WORKSPACE_REPORT.md`, "Encerramento do Production Hub",
para as melhorias arquiteturais identificadas ao longo da série IMP-501 → IMP-505, registradas como
referência para Fiscal Hub e Financial Hub — nenhum Hub já concluído foi alterado retroativamente.

**Cada um destes domínios deverá seguir integralmente o padrão definido por este documento** — o mesmo ciclo de seis etapas (Capítulo 2), a mesma auditoria Passo 1 obrigatória (Capítulo 3), a mesma estrutura de pacote (Capítulo 4), a mesma disciplina DDD (Capítulo 5), a mesma disciplina de Persistência/HTTP/Frontend/Workspace/UX/Eventos/Limitações/Testes/Reutilização (Capítulos 6–14), verificado contra o Checklist Oficial (Capítulo 15) antes de qualquer aprovação. Nenhum processo de desenvolvimento novo deve ser criado — o processo já existe, já foi comprovado duas vezes, e está registrado neste documento.

---

## Fechamento

A partir deste documento, a arquitetura da Adaptive Business Platform deixa de depender de memória — cada regra aqui descrita substitui um conhecimento que, antes, existia apenas na experiência de quem executou as dez Sprints que o originaram. A qualidade deixa de depender de julgamento individual a cada nova Sprint — passa a depender da conformidade verificável contra este Standard e contra o Checklist Oficial que o acompanha. Supplier Hub e Purchase Hub são, a partir de agora, os blueprints oficiais da plataforma; este documento é a razão escrita de por que o são, e a regra que todo domínio futuro deve seguir para merecer o mesmo status.
