# GIT-003 — Fiscal Hub Repository Consolidation

**Adaptive Business Platform · Relatório de Consolidação Git**

Status: Concluído · Categoria: Implementation Documentation · Data: 2026-08-06

---

## Nota de Posicionamento Documental

Esta Sprint não implementa funcionalidade, não altera arquitetura, não modifica código de negócio. É exclusivamente uma consolidação de versionamento — auditar o estado do Git, confirmar que toda alteração pendente pertence ao Fiscal Hub (IMP-601–605), a BUG-001, ou a documentação diretamente relacionada, e produzir um único commit. Nenhum arquivo de código foi criado, editado ou corrigido por esta Sprint — todo conteúdo já existia na árvore de trabalho antes dela começar.

---

## 1. Resumo Executivo

O estado do Git antes desta Sprint (`HEAD` = `05cb941`, tag `v0.5-erp-foundation`) tinha 19 arquivos rastreados modificados e 23 arquivos/diretórios não rastreados, produzidos por cinco Sprints não commitadas (IMP-601 a IMP-605, o Fiscal Hub), pela correção de BUG-001, e por dois relatórios de auditoria (`ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md`, `BUG_001_REGISTER_RECEIVING_HTTP500.md`). A auditoria desta Sprint confirmou, arquivo por arquivo, que **cada uma dessas 38 entradas pertence exclusivamente ao Fiscal Hub, a BUG-001, ou à documentação diretamente relacionada a ambos** — nenhuma alteração estranha, nenhum arquivo temporário, nenhum arquivo local, nenhuma documentação esquecida.

Um único commit (`0968e46`, `feat(fiscal): complete Fiscal Hub and resolve BUG-001`) consolidou as 38 entradas em 114 arquivos versionados (a diferença vem de diretórios inteiros como `platform/packages/fiscal-hub/` contendo múltiplos arquivos individuais). A working tree está limpa após o commit. Nenhuma tag foi criada — avaliação técnica no Capítulo 5 recomenda uma, mas a decisão de criá-la é do usuário, nunca desta Sprint.

Com este commit, a ERP Foundation passa a estar **integralmente consolidada no histórico Git** — a segunda das três ressalvas de `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md` está resolvida. Permanece em aberto exclusivamente a terceira ressalva — as inconsistências numéricas entre `ERP_CONTEXT_MAP.md`/`DOMAIN_EVENT_CATALOG.md` e `ADR_INDEX.md` desatualizado —, que esta Sprint explicitamente não teve permissão de tocar ("não corrigir documentação").

---

## 2. Estado Inicial do Git

```
HEAD: 05cb941 (tag: v0.5-erp-foundation, origin/main, origin/HEAD)
      feat(platform): establish Adaptive Business Platform foundation
Branch: main, sincronizada com origin/main
```

`git status` reportava:

- **19 arquivos rastreados, modificados, não staged.**
- **23 entradas não rastreadas** (arquivos individuais e diretórios).
- **0 arquivos já staged** (`git diff --cached --stat` vazio).

`git tag -l` mostrava duas tags pré-existentes: `architecture-foundation-complete` (em `a52573f`) e `v0.5-erp-foundation` (em `05cb941` — o commit que, per `GIT_002_REPOSITORY_CONSOLIDATION_AUDIT.md` e a Sprint ERP-001 Final Review, já havia consolidado quatro dos cinco domínios ERP: Supplier, Purchase, Inventory Movement, Production — mas não Fiscal).

---

## 3. Auditoria — Classificação de Cada Alteração

### 3.1 Arquivos modificados (rastreados)

| Arquivo | Pertence a | Verificado por |
|---|---|---|
| `docs/standards/ADAPTIVE_DEVELOPMENT_STANDARD.md` | Fiscal Hub (Roadmap Cap. 17 + novo Cap. 17-A, IMP-605) | `git diff` linha a linha |
| `platform/apps/api/package.json` | Fiscal Hub (dependência `@abp/fiscal-hub`) | `git diff` |
| `platform/apps/api/src/plugins/openapi.ts` | Fiscal Hub (tag `fiscal` no OpenAPI) | `git diff` |
| `platform/apps/api/src/server.ts` | Fiscal Hub (registro de `fiscalRoutes`) | `git diff` |
| `platform/apps/api/tsconfig.json` | Fiscal Hub (referência ao pacote) | `git diff` |
| `platform/apps/api/src/routes/purchase.test.ts` | **BUG-001** (flip de `it.fails` para `it`) | `git diff` |
| `platform/apps/web/src/app/navigation/navEntries.ts`/`.test.ts` | Fiscal Hub (entrada de navegação `/fiscal`, IMP-605) | `git diff` |
| `platform/apps/web/src/app/router/routes.tsx` | Fiscal Hub (rota `/fiscal`) | `git diff` |
| `platform/apps/web/src/core/http/testing/demoApiFetchMock.ts` | Fiscal Hub (mocks de demo para Tax Regime/Rule/Fiscal Document, +291 linhas, 100% aditivo) | `git diff`, checado linha a linha por conteúdo não-fiscal — nenhum encontrado |
| `platform/packages/persistence/package.json`/`tsconfig.json` | Fiscal Hub (dependência/referência ao pacote) | `git diff` |
| `platform/packages/persistence/src/composition/createManagerRegistry.ts`/`.test.ts` | Fiscal Hub (`FiscalManager` wired, 9º domínio) | `git diff` |
| `platform/packages/persistence/src/db/migrate.test.ts` | Fiscal Hub (5 tabelas novas, contagem de migrations 6→7) | `git diff` |
| `platform/packages/persistence/src/repositories/purchase/SqlitePurchaseOrderRepository.ts` | **BUG-001** (correção da causa raiz) | `git diff` |
| `platform/packages/persistence/src/repositories/purchase/SqliteRepositories.test.ts` | **BUG-001** (teste de regressão) | `git diff` |
| `platform/pnpm-lock.yaml` | Fiscal Hub (link do workspace `@abp/fiscal-hub`) | `git diff` — nenhuma versão de dependência externa alterada |
| `platform/tsconfig.json` | Fiscal Hub (referência ao pacote raiz) | `git diff` |

### 3.2 Arquivos/diretórios não rastreados

| Entrada | Pertence a |
|---|---|
| `docs/implementation/IMP_601` a `IMP_605` (5 relatórios) | Fiscal Hub |
| `docs/implementation/BUG_001_REGISTER_RECEIVING_HTTP500.md` | BUG-001 |
| `docs/implementation/ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md` | Documentação relacionada — a auditoria que identificou tanto a pendência do Fiscal Hub quanto o BUG-001 |
| `platform/apps/api/src/{dtos,errors,mappers,routes}/fiscal.*` | Fiscal Hub — HTTP (IMP-603) |
| `platform/apps/web/src/core/fiscal/` (23 arquivos) | Fiscal Hub — Frontend Infrastructure (IMP-604) |
| `platform/apps/web/src/pages/fiscal/` (12 arquivos) | Fiscal Hub — Workspace (IMP-605) |
| `platform/apps/web/src/shared/components/ui/Fiscal*.tsx`, `TaxRegimeCard.tsx`, `TaxRuleCard.tsx` (6 arquivos) | Fiscal Hub — componentes de UI (IMP-604/605) |
| `platform/packages/fiscal-hub/` (33 arquivos) | Fiscal Hub — Core (IMP-601) |
| `platform/packages/persistence/src/db/migrations/0006_fiscal_hub.sql` | Fiscal Hub — Persistência (IMP-602) |
| `platform/packages/persistence/src/repositories/fiscal/` (5 arquivos) | Fiscal Hub — Persistência (IMP-602) |

### 3.3 Respostas explícitas

**Todos os arquivos modificados pertencem ao Fiscal Hub?** Não inteiramente — a grande maioria pertence ao Fiscal Hub, mas três arquivos (`purchase.test.ts`, `SqlitePurchaseOrderRepository.ts`, `SqliteRepositories.test.ts` de `packages/persistence/.../purchase/`) pertencem a **BUG-001**, e dois relatórios (`BUG_001_REGISTER_RECEIVING_HTTP500.md`, `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md`) são documentação relacionada. Isso é esperado e explicitamente autorizado pelo próprio título desta Sprint e pela instrução de Execução (Capítulo "EXECUÇÃO" do brief): "Criar um único commit consolidando: Fiscal Hub, BUG-001, Atualizações da documentação relacionadas."

**Existe alteração estranha?** Não. Toda linha de todo `git diff` foi revisada; nenhuma menciona domínio, feature ou correção fora de Fiscal Hub/BUG-001/documentação relacionada.

**Existe arquivo temporário?** Não. Verificado explicitamente `projeto-atualizado.zip` (existe no disco, mas coberto por `.gitignore:73:*.zip` — nunca aparece em `git status`, nunca seria commitado) e `package-lock 2.json` (existe no disco e está rastreado, mas como parte da baseline original do repositório, herdado desde antes de `711ff85` — não faz parte de nenhuma alteração desta Sprint, `git diff` confirma zero mudança nesse arquivo).

**Existe arquivo local?** Não — nenhum `.env`, nenhuma credencial, nenhum arquivo de configuração pessoal apareceu em `git status`.

**Existe documentação esquecida?** Não — todos os cinco relatórios IMP-601–605, o relatório BUG-001, e o relatório da auditoria ERP-001 estavam presentes no disco e foram todos incluídos.

**Existe relatório não versionado?** Sim, era exatamente esse o estado inicial (Capítulo 2) — os sete relatórios (5 IMP + BUG-001 + ERP-001 Final Review) estavam todos não rastreados antes desta Sprint; todos os sete agora estão commitados (Capítulo 4).

---

## 4. Verificação — Presença de Cada Item Exigido

| Item | Presente? | Caminho |
|---|---|---|
| IMP-601 report | ✅ | `docs/implementation/IMP_601_FISCAL_HUB_CORE_REPORT.md` |
| IMP-602 report | ✅ | `docs/implementation/IMP_602_FISCAL_PERSISTENCE_REPORT.md` |
| IMP-603 report | ✅ | `docs/implementation/IMP_603_FISCAL_HTTP_API_REPORT.md` |
| IMP-604 report | ✅ | `docs/implementation/IMP_604_FISCAL_FRONTEND_INFRASTRUCTURE_REPORT.md` |
| IMP-605 report | ✅ | `docs/implementation/IMP_605_FISCAL_WORKSPACE_REPORT.md` |
| BUG-001 report | ✅ | `docs/implementation/BUG_001_REGISTER_RECEIVING_HTTP500.md` |
| Fiscal Hub — Core | ✅ | `platform/packages/fiscal-hub/` — 33 arquivos, 27 de produção + 6 de teste |
| Fiscal Hub — Persistence | ✅ | `platform/packages/persistence/src/repositories/fiscal/` (5 arquivos, incl. 1 de teste) + `migrations/0006_fiscal_hub.sql` |
| Fiscal Hub — HTTP | ✅ | `platform/apps/api/src/routes/fiscal.ts` + `fiscal.test.ts` + `dtos/fiscal.dto.ts` + `mappers/fiscal.mapper.ts` + `errors/mapFiscalError.ts` |
| Fiscal Hub — Frontend | ✅ | `platform/apps/web/src/core/fiscal/` — 23 arquivos, incl. 3 de teste (`fiscalClient.test.ts`, `useFiscalMutations.test.tsx`, `useFiscalQueries.test.tsx`) |
| Fiscal Hub — Workspace | ✅ | `platform/apps/web/src/pages/fiscal/` — 12 arquivos, incl. `FiscalPage.test.tsx` |
| Testes | ✅ | Confirmados em cada camada acima — nenhuma camada sem cobertura própria |
| `ADAPTIVE_DEVELOPMENT_STANDARD.md` | ✅ | Modificado, staged, commitado |
| Roadmap | ✅ | `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 17, Fiscal Hub marcado `✅ completo`; Capítulo 17-A ("Lições Aprendidas") presente |

Todos os itens exigidos pela auditoria desta Sprint estão confirmados presentes.

---

## 5. Execução — Commit Realizado

**Staging.** As 38 entradas de `git status` (Capítulo 3) foram adicionadas explicitamente por caminho — nunca `git add -A`/`git add .` — para que nenhum arquivo fora da lista já auditada pudesse entrar no commit por acidente. `git status --porcelain` confirmou, após o `add`, que a working tree não tinha nenhuma entrada fora do stage (nenhum ` M`/`??` remanescente).

**Commit único:**

```
commit 0968e46
Author: Amarildo <amarildorochax@gmail.com>

feat(fiscal): complete Fiscal Hub and resolve BUG-001

Consolidates the Fiscal Hub (IMP-601-605) — the fifth and final ERP
Foundation domain — Core, Persistence, HTTP API, Frontend
Infrastructure and Workspace, closing the 25-Sprint ERP Foundation
series (Supplier/Purchase/Inventory Movement/Production/Fiscal).

Also includes BUG-001: fixes the Purchase Hub registerReceiving
HTTP 500 (SqlitePurchaseOrderRepository.replaceItems switched from
delete+reinsert to a selective diff, since purchase_order_items is
referenced by FOREIGN KEY from receiving_lines).

Plus the ERP-001 Final Review audit report and the corresponding
ADAPTIVE_DEVELOPMENT_STANDARD.md Roadmap/Lições Aprendidas update.

114 files changed, 11330 insertions(+), 42 deletions(-)
```

Nenhum código foi alterado por este commit além do que já existia na árvore de trabalho antes desta Sprint — o commit é puramente um snapshot do trabalho já produzido e já validado pelas Sprints IMP-601–605 e BUG-001.

---

## 6. Histórico Atualizado

```
0968e46 (HEAD -> main) feat(fiscal): complete Fiscal Hub and resolve BUG-001
05cb941 (tag: v0.5-erp-foundation, origin/main, origin/HEAD) feat(platform): establish Adaptive Business Platform foundation
711ff85 chore(repository): establish clean repository baseline
a52573f (tag: architecture-foundation-complete) chore(repository): create safety checkpoint before architecture implementation
dcf0fee chore: Phase 3 - Directory Cleanup (remove backups/ and orphan files)
```

`git status` pós-commit: `nothing to commit, working tree clean`; branch `main` está 1 commit à frente de `origin/main` (o commit não foi enviado ao remoto — esta Sprint não recebeu instrução para `push`, e alterar o histórico remoto é uma ação que exige confirmação explícita separada, per disciplina padrão de operações Git irreversíveis/visíveis a terceiros).

---

## 7. Avaliação de Tag

**É apropriado criar uma nova tag?** Sim, tecnicamente apropriado — este commit fecha, pela primeira vez, os cinco domínios completos da ERP Foundation (o commit anterior, `v0.5-erp-foundation`, cobria apenas quatro) e resolve o único bug de produção conhecido da série. É um marco de encerramento de fase genuíno, exatamente o tipo de commit que as duas tags já existentes (`architecture-foundation-complete`, `v0.5-erp-foundation`) foram usadas para marcar.

**Nome sugerido:** `v0.6-erp-foundation-complete`.

Justificativa do nome: mantém a convenção numérica sequencial já em uso (`v0.5-erp-foundation` → `v0.6-...`), e o sufixo `-complete` marca explicitamente a diferença semântica em relação à tag anterior — `v0.5-erp-foundation` cobria uma consolidação parcial (4 de 5 domínios); este commit é a primeira vez que os cinco domínios e o único bug de produção conhecido estão, simultaneamente, resolvidos e commitados. Uma tag `v1.0-...` foi considerada e descartada nesta avaliação — a própria `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md` certificou a ERP Foundation **com ressalvas**, não sem elas (uma ressalva documental ainda em aberto, Capítulo 8 daquele relatório), e um `v1.0` correria o risco de sinalizar uma conclusão mais absoluta do que a auditoria formalmente concedeu.

**Esta tag não foi criada por esta Sprint** — per instrução explícita ("Nunca criar automaticamente"), a decisão de criá-la, e sob qual nome, permanece do usuário.

---

## 8. Pendências Remanescentes

Após este commit, a ERP Foundation tem exatamente **uma** pendência conhecida, per `ERP_001_ERP_FOUNDATION_FINAL_REVIEW.md`, Capítulo 8 — a terceira ressalva daquele relatório, ainda não corrigida por nenhuma Sprint até agora:

**DOC-001 (sincronização documental)** — duas inconsistências numéricas entre documentos de arquitetura Draft: `ERP_CONTEXT_MAP.md` declara "31 novos Eventos", enquanto a contagem real de `DOMAIN_EVENT_CATALOG.md`/código é 36; e `ADR_INDEX.md` (327 ADRs) nunca foi atualizado para incorporar os 27 novos ADRs registrados pela série ERP (`ERP_ARCHITECTURE.md` a `FISCAL_HUB.md`). Nenhuma das duas foi tocada por esta Sprint — fora de escopo ("Não corrigir documentação. Somente consolidar.").

O bug de produção (BUG-001) e o estado de commit do Fiscal Hub — as outras duas ressalvas daquele mesmo relatório — estão ambos resolvidos: BUG-001 por sua própria Sprint (`docs/implementation/BUG_001_REGISTER_RECEIVING_HTTP500.md`), e o commit por esta Sprint.

---

## 9. Conclusão

A pendência de versionamento identificada pela auditoria ERP-001 está resolvida. O Fiscal Hub (IMP-601–605), a correção de BUG-001, e a documentação diretamente relacionada a ambos foram auditados arquivo por arquivo — confirmando ausência de qualquer alteração estranha, arquivo temporário, arquivo local, ou documentação esquecida — e consolidados em um único commit limpo (`0968e46`), sem misturar nenhum trabalho não relacionado. A working tree está limpa, o histórico é consistente, e todos os itens exigidos pela auditoria desta Sprint (5 relatórios IMP, relatório BUG-001, Fiscal Hub em suas cinco camadas com testes, Standard atualizado, Roadmap atualizado) estão confirmados presentes e versionados.

A ERP Foundation permanece, a partir de agora, com **uma única pendência formal**: DOC-001, a sincronização documental descrita no Capítulo 8. Nenhuma decisão silenciosa foi tomada por esta Sprint — a avaliação de tag foi entregue como recomendação técnica (Capítulo 7), nunca executada; nenhum `push` ao remoto foi realizado sem instrução explícita separada.
