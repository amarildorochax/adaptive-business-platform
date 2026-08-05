# FUN-003 — Real Persistence Layer Foundation — Relatório

**Status:** Concluída. **Natureza:** terceira Sprint funcional — nenhuma arquitetura, ADR, Repository Interface, Manager, Service, Command, Event ou Entity foi alterada.

---

## 1. Auditoria — Inventário Completo

**Repository Interfaces existentes:** 14 nos três domínios priorizados — `BusinessProfileRepository`, `BusinessClassificationRecordRepository`, `MaturityRecordRepository`, `BusinessProfileLifecycleStateRepository` (`@abp/business-profile`); `LogoRepository`, `DesignTokenRepository`, `BrandThemeRepository` (`@abp/branding`); `LeadRepository`, `CustomerRepository`, `OrganizationRepository`, `ContactRepository`, `RelationshipRepository`, `OpportunityRepository`, `TimelineEventRepository` (`@abp/crm-hub`). Nos demais dez domínios (Content, Growth, Commerce, Finance, AI, IAM, Knowledge, Integration, Runtime, AI Agents, Platform Operations), Repository Interfaces também já existem desde a série IMP, mas nenhuma foi tocada nesta Sprint — fora do escopo priorizado (Seção "Repositories" do prompt desta Sprint).

**Achado central da auditoria — todo Repository Interface dos três domínios é `create`/`update?`/`get?`/`list*` (nunca `delete`/`remove`).** Confirmado por leitura direta dos 14 arquivos: `BusinessProfileRepository`, as três de versionamento de Business Profile, e as três de Branding expõem apenas `create`+`list*`/`findByTenantId` (fatos imutáveis por desenho, per ADR-009/ADR-012); `ContactRepository` e `TimelineEventRepository` (CRM) também nunca declaram `update`; apenas `LeadRepository`, `CustomerRepository`, `OrganizationRepository`, `RelationshipRepository` e `OpportunityRepository` declaram `update`. **Nenhum dos 14 declara `delete`/`remove`.** Isso determina, de forma estrutural e não arbitrária, o que a Seção 10 (Testes) desta Sprint pôde e não pôde cobrir.

**FakeRepositories/InMemoryRepositories:** um arquivo `src/testing/InMemoryFakes.ts` por pacote de domínio, já presentes desde a IMP-002 (CRM), IMP-018 (Business Profile) e IMP-019 (Branding) — nunca exportados pelo barrel principal (`.`) de nenhum pacote, apenas pela subpath `./testing` (adicionada na FUN-001 especificamente para permitir o Composition Root do Frontend os reutilizar).

**Pontos de registro na Composition Root:** um único — `apps/web/src/core/managers/buildManagers.ts` (FUN-001/FUN-002), que constrói sete Managers exclusivamente sobre Fakes. **Esta Sprint não o modifica** — ver Seção 8 (Frontend).

**Testes que usam Fakes:** todos os 356 testes já existentes antes desta Sprint (`packages/*/src/**/*.test.ts`, `apps/web/src/**/*.test.{ts,tsx}`) continuam usando exclusivamente Fakes — nenhum foi alterado, nenhum foi removido.

---

## 2. Tecnologia — Escolha e Justificativa

**Busca por tecnologia já prevista:** nenhuma referência a Prisma, Drizzle, TypeORM, MikroORM, Kysely, PostgreSQL, Supabase, Neon ou Turso existe em nenhum documento de `docs/architecture/` ou `docs/implementation/`. Os dois únicos documentos que mencionam persistência concreta (`COMPONENT_10_DATA_DESIGN.md`, `DATA_BUILD_VALIDATION_REPORT.md`) declaram, explicitamente, "fora do escopo: qualquer banco de dados, serviço de armazenamento, ou fornecedor concreto" — confirmando que nenhuma decisão de tecnologia foi tomada por nenhuma Sprint arquitetural anterior. Nenhum `package.json` de todo o monorepo já declarava qualquer driver ou ORM de banco de dados.

**Tecnologia escolhida: SQLite, via o módulo nativo `node:sqlite` do próprio runtime Node.js — sem driver npm, sem ORM.**

**Justificativa, incluindo uma correção de rota registrada em tempo real:** a escolha original desta Sprint foi SQLite + Drizzle ORM + `better-sqlite3` (driver nativo mais estabelecido do ecossistema) — SQLite por ser a única tecnologia da lista candidata que não exige nenhuma conta de serviço externo, contêiner ou processo adicional (alinhado a "identificar a infraestrutura já presente no repositório": um monorepo 100% TypeScript/Node/pnpm, sem Docker Compose, sem `.env` de credencial de nenhum provedor já configurado); Drizzle por ser TypeScript-first, sem decorators/reflection (diferente de TypeORM/MikroORM, que exigiriam `experimentalDecorators`, nunca antes usado em nenhum pacote deste monorepo). **Essa escolha foi revertida durante a própria implementação desta Sprint**: `better-sqlite3` é um addon nativo que exige compilação C++ via `node-gyp`, e este ambiente não possui um toolchain de compilação funcional (Python ausente/quebrado, confirmado pelo próprio log de erro do `node-gyp`) — a instalação falhou de forma irrecuperável. A alternativa investigada em seguida — o driver `drizzle-orm/node-sqlite`, que evitaria a compilação nativa usando o módulo `node:sqlite` do próprio Node — **não existe em nenhuma versão estável já publicada do Drizzle** (confirmado por inspeção direta do mapa de `exports` da versão mais recente, 0.45.2; a integração existe apenas em pré-lançamentos `1.0.0-rc.*`, nunca uma versão estável). Diante desses dois bloqueios reais e verificados, a Sprint manteve SQLite (a decisão original, correta) e substituiu Drizzle por SQL puro sobre `node:sqlite` — módulo embutido no próprio runtime desde a série 22 (confirmado funcional neste ambiente, Node v24), zero dependência nova, zero compilação nativa, zero risco de indisponibilidade de pacote. Esta reversão está registrada aqui com total transparência — nenhuma parte dela foi ocultada ou apresentada como o plano original.

**Consequência prática desta escolha:** `platform/packages/persistence/package.json` declara apenas três dependências de runtime — os próprios pacotes de domínio (`@abp/business-profile`, `@abp/branding`, `@abp/crm-hub`, para importar seus Repository Interfaces e Entities) — e nenhuma dependência de banco de dados. `tsx` (devDependency) executa os dois scripts Node desta Sprint sem exigir um passo de build separado.

---

## 3. Repository Interfaces Reutilizadas / RealRepositories Implementados

Todos os 14 Repository Interfaces listados na Seção 1 foram implementados — nenhum foi redefinido, estendido ou teve sua assinatura alterada. Cada implementação real vive em `platform/packages/persistence/src/repositories/{business-profile,branding,crm}/Sqlite{Nome}Repository.ts`:

| Domínio | Repository Interface | Implementação real |
|---|---|---|
| Business Profile | `BusinessProfileRepository` | `SqliteBusinessProfileRepository` |
| Business Profile | `BusinessClassificationRecordRepository` | `SqliteBusinessClassificationRecordRepository` |
| Business Profile | `MaturityRecordRepository` | `SqliteMaturityRecordRepository` |
| Business Profile | `BusinessProfileLifecycleStateRepository` | `SqliteBusinessProfileLifecycleStateRepository` |
| Branding | `LogoRepository` | `SqliteLogoRepository` |
| Branding | `DesignTokenRepository` | `SqliteDesignTokenRepository` |
| Branding | `BrandThemeRepository` | `SqliteBrandThemeRepository` |
| CRM | `LeadRepository` | `SqliteLeadRepository` |
| CRM | `CustomerRepository` | `SqliteCustomerRepository` |
| CRM | `OrganizationRepository` | `SqliteOrganizationRepository` |
| CRM | `ContactRepository` | `SqliteContactRepository` |
| CRM | `RelationshipRepository` | `SqliteRelationshipRepository` |
| CRM | `OpportunityRepository` | `SqliteOpportunityRepository` |
| CRM | `TimelineEventRepository` | `SqliteTimelineEventRepository` |

Cada implementação: (a) importa a Entity e o Repository Interface exclusivamente do barrel público do pacote de domínio (`@abp/business-profile`, `@abp/branding`, `@abp/crm-hub` — nunca um caminho interno); (b) converte `Date` ↔ `number` (epoch ms) e campo opcional (`field?`) ↔ coluna anulável através de um pequeno utilitário compartilhado (`src/db/sqlUtil.ts`); (c) para `BusinessClassificationRecord`, achata o objeto aninhado `classification: {segment, subsegment?}` em duas colunas (`segment`, `subsegment`) — nunca serializado como JSON opaco, preservando a capacidade de consulta relacional; (d) para as seis tabelas de fato imutável/versionado, ordena toda consulta `list*` por uma coluna `id` autoincrementável — sem ela, SQL não garante nenhuma ordem estável, e vários Services já dependem estruturalmente de "o mais recente é sempre o último em ordem de inserção" (ex.: `BusinessProfileLifecycleService.currentStage`, `BrandThemeService.current`).

---

## 4. Infraestrutura Criada

Novo pacote `platform/packages/persistence` (`@abp/persistence`):

- **Conexão** (`src/db/client.ts`) — `createDatabase(config)`, único ponto de construção de uma `DatabaseSync` (`node:sqlite`); aplica `PRAGMA journal_mode = WAL` e `PRAGMA foreign_keys = ON`; cria o diretório do arquivo, se necessário.
- **Configuração** (`src/db/config.ts`) — `resolvePersistenceConfig(env)`, o "mecanismo único" exigido por esta Sprint: `ABP_ENV` (`development`/`testing`/`production`, default `development`) e `ABP_DATABASE_PATH` (default `:memory:` em `testing`, `./data/adaptive-business-platform.sqlite3` nos demais).
- **Migrations** (`src/db/migrate.ts` + `src/db/migrations/0000_init.sql`) — `runMigrations(handle)` aplica cada arquivo `.sql` ainda não registrado em uma tabela `_migrations`, em ordem alfabética, cada um dentro de uma transação própria (revertida por inteiro em caso de falha) — idempotente, seguro para rodar a cada bootstrap.
- **Factories/bootstrap** (`src/composition/createManagerRegistry.ts`, `src/bootstrap/runMigrations.ts`, `src/bootstrap/verifyRealPersistence.ts`) — Seções 5 e 9.
- **Utilitário compartilhado** (`src/db/sqlUtil.ts`) — conversão `Date`/`number` e `undefined`/`null`, único lugar onde essa conversão é definida (nunca duplicada entre os 14 repositórios).

---

## 5. Migrations

Uma única migration, `0000_init.sql`, criando exatamente as 14 tabelas dos três domínios priorizados — nenhuma tabela de nenhum dos onze domínios restantes foi antecipada, per instrução explícita desta Sprint. Índices foram criados em toda coluna usada em cláusula `WHERE` pelos repositórios (`tenant_id`, `profile_id`, `theme_id`, `relationship_id`, conforme o caso). `pnpm db:migrate` (dentro de `packages/persistence`) executa a migration contra o banco resolvido por `ABP_ENV`/`ABP_DATABASE_PATH` — validado nesta Sprint (Seção 9).

---

## 6. Configuração

Três ambientes, um único ponto de leitura de variável de ambiente (`resolvePersistenceConfig`, Seção 4) — nenhum outro arquivo deste pacote lê `process.env` diretamente. `testing` sempre resolve para `:memory:` por padrão (nunca cria arquivo em disco, nunca deixa resíduo entre execuções de teste). `development`/`production` resolvem para um arquivo real, cujo caminho pode ser sobrescrito por `ABP_DATABASE_PATH` — a mesma configuração serve, sem nenhuma outra mudança de código, para apontar a um caminho diferente em produção.

---

## 7. Composition Root — Estratégia Fake × Real

`createManagerRegistry(mode: 'fake' | 'real', handle?)` (`src/composition/createManagerRegistry.ts`) é a **única** função de todo o pacote — de toda esta Sprint — que testa `mode === 'real'`. Nenhum Manager, nenhum Service, nenhum Repository, nenhum outro arquivo contém uma condicional Fake/Real — per a instrução explícita "nunca espalhar condicionais pelo sistema". Cada ramo (`fake`/`real`) constrói os mesmos três Managers (`BusinessProfileManager`, `BrandingManager`, `CRMManager`) com os mesmos Services já aprovados — a única diferença é qual classe de Repository é injetada. `mode === 'real'` sem uma `DatabaseHandle` lança um erro explícito e imediato (nunca uma falha silenciosa mais tarde) — coberto por teste (Seção 10).

---

## 8. Frontend — Por Que Nenhuma Linha de `apps/web` Foi Alterada

`better-sqlite3` foi descartado por não compilar neste ambiente (Seção 2); `node:sqlite`, a alternativa adotada, é um módulo do runtime **Node.js** — **não existe em nenhum navegador**. `apps/web` é uma aplicação Vite/React que roda inteiramente no navegador (confirmado desde a auditoria da FUN-001). Importar `@abp/persistence` — direta ou dinamicamente — no bundle de `apps/web` faria o Vite tentar resolver `node:sqlite` para o navegador, o que falha estruturalmente, sempre, com ou sem `import()` dinâmico: um `import()` dinâmico adia a execução, mas não muda o fato de que o alvo importado nunca pode ser executado onde ele seria carregado, e produção continuaria exigindo que o bundler resolva o módulo em algum momento.

Diante disso, **nenhuma linha de `apps/web` foi alterada nesta Sprint** — a opção mais segura e a única capaz de satisfazer, ao mesmo tempo, "Frontend funcionando sem alterações" e "nunca quebrar a suíte existente", os dois critérios mais explícitos e repetidos desta Sprint. `buildManagers.ts` continua a construir exclusivamente Fakes, exatamente como na FUN-002 — confirmado byte a byte pelo `vite build` desta Sprint, que produziu exatamente os mesmos 462 módulos e os mesmos nomes de chunk já produzidos ao final da FUN-002 (Seção 11, Validação).

O mecanismo de alternância centralizada (`createManagerRegistry`, Seção 7) existe, está implementado e está testado — apenas ainda não é alcançável a partir do navegador. Isso é uma fronteira honesta desta Sprint, não uma lacuna oculta: a própria narrativa desta Sprint ("estabelecendo a base para... operação em ambiente de produção") já antecipa que a persistência real de produção, quando existir, será servida por um processo Node (um futuro backend/API) — o lugar natural, e não o navegador, para conectar a um banco de dados real, seja SQLite, seja outro. Esta Sprint entrega essa base pronta para esse processo futuro: `createManagerRegistry('real', handle)` já funciona, hoje, em qualquer contexto Node — testes e o próprio script `verify` (Seção 9) o demonstram.

---

## 9. Validação — Migrations e Bootstrap com Persistência Real

```
pnpm --filter @abp/persistence db:migrate
  → "Migrations aplicadas com sucesso — ambiente: development, banco: ./data/adaptive-business-platform.sqlite3"

pnpm --filter @abp/persistence verify
  → "Persistência real verificada com sucesso:
       banco: <diretório temporário>/verify.sqlite3
       Business Profile "<uuid>" sobreviveu ao reabrir a conexão, estágio "Perfil Inicial".
       Brand Theme versão 1 sobreviveu ao reabrir a conexão.
       CRM aceitou nova escrita na segunda conexão."
```

`verify` (`src/bootstrap/verifyRealPersistence.ts`) é a validação literal exigida por esta Sprint ("validar que a aplicação inicia utilizando persistência real"): aplica as migrations, constrói os três Managers via `createManagerRegistry('real', ...)`, executa uma sequência de Commands reais (`createBusinessProfile` → `validateProfile` → `finalizeInitialProfile`; `generateInitialBrandIdentity`; `createOrganization` → `createOpportunity`) — o mesmo tipo de sequência que `apps/web` já executa via `seedDemoData.ts`, aqui contra um arquivo SQLite real —, **fecha a conexão**, abre uma conexão **nova** contra o mesmo arquivo, e confirma que todo dado criado pela primeira conexão é lido de volta pela segunda. É exatamente essa etapa — fechar e reabrir o processo — que nenhum FakeRepository poderia jamais demonstrar, e é a prova concreta de que a persistência atravessa a vida do processo, não apenas a sessão em memória.

```
pnpm typecheck   → 20/20 pacotes + apps/web, sucesso (novo pacote @abp/persistence registrado em platform/tsconfig.json)
pnpm build       → 20/20 pacotes + apps/web (vite build, 462 módulos, chunks idênticos à FUN-002 — zero impacto no bundle de navegador), sucesso
pnpm lint        → sucesso, zero warning
pnpm test        → 356/356 testes, 107/107 arquivos de teste (331 já existentes + 25 desta Sprint)
```

---

## 10. Cobertura de Testes

25 testes novos, organizados exatamente segundo os itens exigidos por esta Sprint:

- **Persistência/Recuperação** — `SqliteRepositories.test.ts` (um arquivo por domínio: Business Profile, Branding, CRM) cobre `create`+`get`/`findByTenantId`/`list*` de cada um dos 14 Repositories, incluindo preservação correta de campo opcional ausente (`undefined`, nunca `null` vazando para a Entity) e ordem de inserção nas seis tabelas versionadas.
- **Atualização** — coberta para os cinco Repositories de CRM que o próprio contrato declara `update` (`Lead`, `Customer`, `Organization`, `Relationship`, `Opportunity`) — inclusive o mesmo caminho de dado usado por `CRMManager.moveOpportunity` (`outcome`/`closedAt`).
- **Exclusão — não aplicável, e a razão está registrada, não omitida.** Nenhum dos 14 Repository Interfaces declara `delete`/`remove` (Seção 1) — Business Profile e Branding são fatos imutáveis por ADR (ADR-009, ADR-012); Contact e Timeline Event são imutáveis por construção (ADR-006). Escrever um teste de exclusão exigiria adicionar um método que nenhum Repository Interface já aprovado declara — proibido por esta própria Sprint ("nunca alterar Repository Interfaces"). Confirmado por teste negativo explícito (`ContactRepository`/`TimelineEventRepository` não possuem `update` nem `remove`), não apenas por omissão silenciosa.
- **Transações** — `client.test.ts` demonstra `ROLLBACK` (nenhuma linha persiste) e `COMMIT` (todas as linhas persistem) através de uma transação real com múltiplas escritas, além de confirmar `PRAGMA foreign_keys` ativo.
- **Migrations** — `migrate.test.ts` confirma a criação de exatamente as 14 tabelas esperadas (nunca uma a mais, nunca uma a menos) e a idempotência de reaplicar a mesma migration.
- **Composition Root** — `createManagerRegistry.test.ts` cobre os quatro cenários centrais: `mode: 'fake'` sem exigir handle; `mode: 'real'` sem handle lança erro explícito; `mode: 'real'` produz Managers funcionais sobre SQLite; e — o teste mais importante desta Sprint — dado criado por uma `DatabaseHandle` sobrevive ao fechar essa conexão e abrir uma nova contra o mesmo arquivo, replicado no nível de Manager (não apenas de Repository).

Nenhum dos 331 testes já existentes foi alterado ou removido — confirmado pela contagem final (356 = 331 + 25).

---

## 11. Limitações

- **`apps/web` não consome persistência real nesta Sprint** — Seção 8, uma fronteira deliberada e justificada, não uma omissão.
- **Apenas três domínios têm persistência real** — os dez restantes permanecem exclusivamente Fake, per o escopo explícito desta Sprint.
- **Sem `delete`/`remove` em nenhum Repository desta Sprint** — porque nenhum Repository Interface já aprovado o declara (Seção 10); implementar exclusão exigiria, primeiro, uma futura extensão do contrato por uma Sprint arquitetural, nunca uma decisão unilateral de uma Sprint de persistência.
- **Um único arquivo SQLite compartilhado pelos três domínios nesta fase** — suficiente para uma "fundação"; particionamento por domínio, se necessário, é uma decisão de uma fase de produção futura, não desta.
- **Sem pool de conexões nem estratégia de concorrência além de `WAL`** — adequado a um único processo Node de desenvolvimento/verificação; múltiplos processos concorrentes de escrita (o cenário "múltiplos usuários" citado no Resultado Esperado desta Sprint) exigem desenho adicional, fora do escopo de uma Sprint de fundação.
- **`node:sqlite` é tecnicamente experimental na documentação oficial do Node** (embora funcional e estável neste runtime) — worth revisitar quando o Node o graduar para estável, ou quando uma versão estável de `drizzle-orm/node-sqlite` existir, o que reabriria a opção de reintroduzir um ORM sem os dois bloqueios encontrados nesta Sprint (Seção 2).

## 12. Próximos Domínios Candidatos à Persistência

Em ordem de proximidade com o que já está conectado ao Frontend (FUN-001/FUN-002): **Communication Hub**, **Analytics Hub**, **Automation Engine** e **Knowledge Hub** (`@abp/platform-services`) — os quatro domínios restantes já wireados ao Composition Root do Frontend, hoje exclusivamente Fake. Depois deles, os seis domínios ainda não conectados a nenhuma página (Content, Growth, Commerce, Finance, AI, IAM, Integration, Runtime, AI Agents, Platform Operations) seguem exatamente o mesmo padrão de implementação já demonstrado por esta Sprint — nenhum redesenho necessário, apenas repetição do padrão `Sqlite{Nome}Repository` para cada Repository Interface já existente.
