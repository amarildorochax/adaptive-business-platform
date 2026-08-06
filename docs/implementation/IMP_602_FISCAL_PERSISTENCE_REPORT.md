# IMP-602 — Fiscal Persistence

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-05
Escopo: exclusivamente Persistence (`packages/persistence`) — Arquitetura, Core, HTTP, Frontend e
Workspace permanecem fora de escopo, per instrução explícita desta Sprint.

---

## Nota de Posicionamento

Este relatório documenta a implementação de persistência SQLite real para o **Fiscal Hub**
(`@abp/fiscal-hub`, IMP-601, congelado nesta Sprint), seguindo rigorosamente os quatro blueprints já
consolidados: Supplier Persistence (IMP-202), Purchase Persistence (IMP-302), Inventory Movement
Persistence (IMP-402) e Production Persistence (IMP-502, o mais recente). Nenhum padrão novo foi
criado — toda decisão replica um dos quatro precedentes já existentes.

Confirmado antes de qualquer código: o domínio correto é **Fiscal Hub**, não "Financial Hub" — a
mesma conclusão já formalizada por `ERP_ARCHITECTURE.md`/`FINANCIAL_HUB.md`/ADR-FN-001 e registrada em
`IMP_601_FISCAL_HUB_CORE_REPORT.md`, Seção 1.1. Nenhuma linha de `@abp/finance-hub` foi tocada ou
sequer referenciada por esta Sprint.

---

## Sumário

1. Auditoria Realizada (Passo 1)
2. Migration
3. Tabelas
4. Repositories
5. Manager Registry
6. Transactions
7. Foreign Keys
8. Testes e Cobertura
9. Divergências Encontradas
10. Decisões Tomadas
11. Qualidade (10 Perguntas Oficiais)
12. Validação
13. Preparação para IMP-603

---

## 1. Auditoria Realizada (Passo 1)

Executada antes de qualquer código, comparando Arquitetura → Fiscal Hub Core (IMP-601) → Persistência
existente → Supplier → Purchase → Inventory Movement → Production Persistence.

**Existe alguma Persistence parcial?** Não. Busca completa (`grep -rli "fiscal"`) em
`packages/persistence/src` não retornou nenhum arquivo — confirmado também por leitura direta de
`src/db/migrations/` (6 arquivos, o mais recente `0005_production_hub.sql`), `src/repositories/` (8
pastas, nenhuma `fiscal/`) e `src/composition/createManagerRegistry.ts` (`ManagerRegistry` sem campo
`fiscal`).

**Existe Migration iniciada?** Não — `0006_fiscal_hub.sql` é inteiramente nova, criada por esta
Sprint.

**Existe Repository parcial?** Não — nenhum arquivo `Sqlite{Entity}Repository.ts` relacionado a
Fiscal Hub existia em lugar algum.

**Existe tabela existente?** Não — nenhuma tabela chamada `tax_regimes`/`tax_rules`/
`fiscal_documents`/`fiscal_document_lines`/`fiscal_obligations` (ou variação de nome) existe no schema
atual, confirmado por `sqlite_master` em `migrate.test.ts` antes da alteração.

**Existe ManagerRegistry preparado?** Não — `ManagerRegistry` (interface) listava exatamente oito
campos (`businessProfile`, `branding`, `crm`, `iam`, `supplier`, `purchase`, `inventoryMovement`,
`production`), nenhum `fiscal`.

**Existe código legado?** Não.

**Existe conflito com Finance Hub?** Não — e a razão é mais forte do que "nenhuma colisão de nome":
**`@abp/finance-hub` não é, e nunca foi, uma dependência de `packages/persistence`** — confirmado por
`grep "finance"` em `package.json`/`createManagerRegistry.ts`, zero ocorrência. O Finance Hub existe
como pacote implementado (Core Migration anterior), mas nunca foi incorporado a este Composition Root,
em nenhuma Sprint — nem como Fake, nem como real. Fiscal Hub Persistence não depende dele, não o
referencia, e não é afetado por sua eventual futura incorporação.

---

## 2. Migration

`src/db/migrations/0006_fiscal_hub.sql` — cinco tabelas, aplicada após `0005_production_hub.sql`
(próximo prefixo numérico, descoberta por listagem de diretório + ordenação alfabética, sem índice de
registro separado, mesmo mecanismo de `db/migrate.ts`, inalterado).

## 3. Tabelas

| Tabela | Chave primária | FK (mesmo Hub) | Observação |
|---|---|---|---|
| `tax_regimes` | `tax_regime_id` (TEXT, natural) | — | `UNIQUE (tenant_id)` |
| `tax_rules` | `tax_rule_id` (TEXT, natural) | `tax_regime_id` | |
| `fiscal_documents` | `fiscal_document_id` (TEXT, natural) | — | |
| `fiscal_document_lines` | `fiscal_document_line_id` (TEXT, natural) | `fiscal_document_id`, `tax_rule_id` | `TaxCalculation` achatado nesta tabela |
| `fiscal_obligations` | `fiscal_obligation_id` (TEXT, natural) | — | |

Convenções idênticas às quatro Persistences anteriores: `snake_case`, `TEXT` para string/enum,
`INTEGER` para epoch milissegundos (datas) e boolean (0/1), um `CREATE INDEX IF NOT EXISTS` por coluna
usada em algum `find*`, `IF NOT EXISTS` em toda `CREATE TABLE`/`CREATE INDEX`. Nenhum `CHECK`
(validação permanece exclusivamente em `FiscalValidator`, Core). Nenhum `TRIGGER` (nenhuma das quatro
Entidades é ledger append-only).

**`fiscal_document_lines.fiscal_document_line_id` usa PRIMARY KEY natural (TEXT), não
`INTEGER AUTOINCREMENT`** — diferente de `bom_lines.line_id` (Production Hub), porque
`FiscalDocumentLine` **tem** identificador próprio no Core (`fiscalDocumentLineId`, gerado pelo
chamador — ver `IMP_601_FISCAL_HUB_CORE_REPORT.md`, Divergência 1), mesmo critério já usado para
`production_consumptions.consumption_id`/`production_outputs.output_id` (ambos naturais, porque
`ProductionConsumption`/`ProductionOutput` também têm identificador próprio).

## 4. Repositories

Quatro arquivos em `src/repositories/fiscal/`, um por Repository Interface, exatamente o padrão de
`repositories/<hub>/`:

- **`SqliteTaxRegimeRepository`** — `save` (upsert); `findByTenant`. Tabela única, sem transação
  explícita (upsert de uma única linha já é atômico).
- **`SqliteTaxRuleRepository`** — `save` (upsert, usado tanto para `CreateTaxRule` quanto
  `DeactivateTaxRule`); `findById`; `findApplicable` (reproduz `FiscalPolicy.isTaxRuleApplicable` em
  SQL — `active = 1 AND valid_from <= data AND (valid_until IS NULL OR valid_until >= data)`). Tabela
  única, sem transação explícita.
- **`SqliteFiscalDocumentRepository`** — `save` (upsert do documento + `replaceLines`, uma única
  transação); `findById`; `findByOrigin`. Template direto: `SqliteBillOfMaterialsRepository`/
  `SqliteProductionOrderRepository` (Aggregate + array interno regravado por completo).
- **`SqliteFiscalObligationRepository`** — `save` (upsert); `findById`; `findPending`; `findOverdue`.
  Tabela única, sem transação explícita.

`TaxCalculation` **não** tem Repository próprio — achatada diretamente em `fiscal_document_lines` (ver
Seção 9, Divergência 1), nunca uma tabela ou transação própria.

## 5. Manager Registry

`createManagerRegistry.ts`: `ManagerRegistry.fiscal: FiscalManager` adicionado; construção via padrão
ternário-por-linha (como `supplier`/`production`, não o bloco `if/else` do Inventory Movement Hub —
nenhum dos quatro Repositories de Fiscal precisa de referência cruzada entre si). `fiscal` retornado
junto aos demais oito Managers. Comentário de cabeçalho da função atualizado: "oito domínios/trinta e
seis Repository Interfaces" → **"nove domínios/quarenta Repository Interfaces"**, com nota explícita de
que Finance Hub nunca foi, e não é por esta Sprint, incorporado a este Composition Root (Seção 1).

`createManagerRegistry.test.ts`: contagem de Managers em modo `fake` — oito → **nove**; novo teste
`"mode 'real' — FiscalManager: ..."` exercitando `registerTaxRegime → createTaxRule → calculateTax →
issueFiscalDocument → cancelFiscalDocument → registerFiscalObligation → evaluateFiscalObligations`
sobre SQLite real, mesmo formato dos seis testes `"mode 'real'"` já existentes.

## 6. Transactions

Toda escrita de Aggregate + entidade interna ocorre em uma única transação `BEGIN`/`COMMIT`/`ROLLBACK`
(manual, via `db.exec`), mesmo padrão de `SqliteSupplierRepository`/`SqlitePurchaseOrderRepository`/
`SqliteBillOfMaterialsRepository`: apenas `SqliteFiscalDocumentRepository.save` (FiscalDocument +
`fiscal_document_lines`, incluindo o `TaxCalculation` achatado de cada linha) usa transação explícita —
a única das quatro Entidades do Fiscal Hub com entidade filha própria. `SqliteTaxRegimeRepository`/
`SqliteTaxRuleRepository`/`SqliteFiscalObligationRepository.save` (tabela única) não usam transação
explícita — mesmo critério de `SqliteReorderRuleRepository`/`SqliteWorkCenterRepository`: um
`INSERT`/upsert isolado já é atômico por natureza do próprio SQLite.

## 7. Foreign Keys

Aplicada a regra já idêntica nos quatro relatórios anteriores: **FK sempre que a tabela referenciada
existe dentro do mesmo Hub; nunca através da fronteira de um Hub.**

| Coluna | FK? | Motivo |
|---|---|---|
| `tax_rules.tax_regime_id` | Sim → `tax_regimes` | referência declarada em `FISCAL_HUB.md`, Capítulo 5 (`taxRegimeId`), mesmo Hub |
| `fiscal_document_lines.fiscal_document_id` | Sim → `fiscal_documents` | parte-interna-do-Aggregate, mesmo Hub |
| `fiscal_document_lines.tax_rule_id` | Sim → `tax_rules` | `TaxCalculation.taxRuleId` referencia uma Tax Rule já aplicada, mesmo Hub |
| `fiscal_documents.order_id` | Não | Commerce Hub, identificador opaco |
| `fiscal_documents.invoice_id` | Não | Finance Hub, identificador opaco |
| `fiscal_document_lines.product_id` | Não | Commerce Hub, identificador opaco |
| `tax_rules.classification_code` | Não | Value Object achatado (`TaxClassification`), não uma Entidade referenciável |

Nenhuma FK criada "apenas por consistência visual" — cada uma corresponde a uma referência real já
declarada por `FISCAL_HUB.md`. `fiscal_documents.invoice_id` não recebe FK mesmo sendo um identificador
de negócio nomeado, porque referencia `@abp/finance-hub` — um Hub diferente — nunca uma referência
dentro do próprio Fiscal Hub, mesma disciplina que já impede `production_orders.order_id`↔Commerce Hub
de ganhar FK (IMP-502).

---

## 8. Testes e Cobertura

`src/repositories/fiscal/SqliteRepositories.test.ts` — 36 testes novos, organizados por Repository,
mesmas categorias já exigidas (comparável a IMP-502):

| Categoria | Cobertura |
|---|---|
| CRUD completo | `save`/`findByTenant`/`findById`/`findApplicable`/`findByOrigin`/`findPending`/`findOverdue` para os quatro Repositories, incluindo upsert (nunca duplica linha) |
| Constraints/FK/UNIQUE | `UNIQUE (tenant_id)` em `tax_regimes` (segundo Tax Regime com id diferente para o mesmo Tenant rejeitado); `tax_rules.tax_regime_id`/`fiscal_document_lines.tax_rule_id`/`fiscal_document_id` — inserção direta via SQL cru e via `save()` do Repository referenciando pai inexistente |
| Rollback (atomicidade) | `FiscalDocument` (linha referenciando `taxRuleId` inexistente no meio do laço), verificado por `SELECT` cru pós-falha, confirmando que nem o documento pai sobrevive |
| Persistência entre conexões | as quatro Entidades sobrevivem a fechar/reabrir uma conexão contra arquivo temporário |
| Migration | `migrate.test.ts` estendido — cinco tabelas novas, contagem de `_migrations` 6 → 7 |
| Integridade/domínio | `findApplicable` respeitando `active`/janela de vigência/classificação exatamente como `FiscalPolicy.isTaxRuleApplicable` (Core); datas opcionais preservadas como `undefined`, nunca epoch zero (`validUntil`, `exemptionCondition`, `orderId`/`invoiceId` mutuamente supridos, `number`/`series`/`cancelReason`, `fulfilledAt`); regravação completa (nunca acumulativa) de `fiscal_document_lines` a cada `save`; `TaxCalculation` hidratado corretamente a partir das colunas achatadas |
| ManagerRegistry integration | `createManagerRegistry.test.ts`, novo `"mode 'real' — FiscalManager"`, ciclo completo sobre SQLite real, incluindo a avaliação periódica de obrigação vencida |

**Resultado**: 45 testes novos/atualizados nesta Sprint (36 de `SqliteRepositories.test.ts` + 2 de
`migrate.test.ts` atualizados + 7 de `createManagerRegistry.test.ts` novos/atualizados — contagem
líquida, não cumulativa de todo o pacote), 100% aprovados, três execuções consecutivas isoladas sem
nenhuma flake. `pnpm test` (workspace completo): 210 arquivos de teste (era 209 antes desta Sprint),
1352 testes — 1351/1350 aprovados + 1 falha esperada (mesma de IMP-303/501/601, não relacionada) — ver
Seção 12 para o flake pré-existente e não relacionado encontrado durante a validação do workspace
completo.

**Comparação com Production Persistence (IMP-502, referência de cobertura mais recente)**: IMP-502
cobriu as mesmas categorias sobre três Repositories, dois com relação Aggregate-pai/filho. Esta Sprint
cobre as mesmas categorias sobre quatro Repositories, um com relação Aggregate-pai/filho
(`FiscalDocument`/`fiscal_document_lines`) mais uma segunda FK dentro da própria tabela filha
(`tax_rule_id`, nunca exercitada por nenhuma Persistence anterior — nenhum Hub anterior teve uma
entidade filha referenciando, ela mesma, uma segunda Entidade além de seu próprio Aggregate pai),
testada explicitamente em "save rejeita uma linha referenciando uma Tax Rule inexistente".

---

## 9. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**1. `TaxCalculation` achatado em `fiscal_document_lines`, sem tabela própria — decisão explicitamente
deixada em aberto por `IMP_601_FISCAL_HUB_CORE_REPORT.md`, Seção 14** ("a decisão de achatar seus
campos... ou criar uma tabela filha tax_calculations própria, fica para IMP-602"). Resolução: achatado
diretamente como cinco colunas (`tax_calculation_id`, `tax_rule_id`, `tax_amount_amount`,
`tax_amount_currency_code`, `tax_calculated_at`) — `TaxCalculation` não tem Repository Interface
própria (Core, Capítulo 9 especifica exatamente quatro), tem cardinalidade 1:1 obrigatória com a linha
que a contém, e nenhum ciclo de vida ou Command próprio após criada (`CalculateTax` a produz uma única
vez; nenhum Command a atualiza depois). Mesma disciplina de achatamento de Value Object sem ciclo de
vida próprio já usada para `Money` em `purchase_order_items.acquisition_cost_amount`/`_currency_code`
(IMP-302). Documentado no cabeçalho de `0006_fiscal_hub.sql`.

**2. `Money` (dois campos), `TaxClassification` (um campo) e `TaxRate` (dois campos) achatados em
colunas separadas** — `unit_value_amount`/`_currency_code`, `classification_code`, `rate_type`/
`rate_value`. Mesmo critério já formalizado em `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 7 (para
DTOs HTTP, aplicado aqui à Persistence pela mesma razão — nenhum campo adicional a preservar), e mesmo
padrão de `acquisition_cost_amount`/`_currency_code` (IMP-302) para o caso de dois campos.

**3. `TaxRuleRepository.findApplicable`/`TaxRegimeRepository.findByTenant`/
`FiscalObligationRepository.findPending`/`findOverdue` não recebem `tenantId` explícito em toda
consulta** (`findApplicable` recebe `taxRegimeId`, não `tenantId`; `findPending`/`findOverdue` não
recebem nenhum parâmetro de Tenant) — limitação já herdada e documentada pelo próprio Core (IMP-601,
`TaxRuleRepository.ts`/`FiscalObligationRepository.ts`), implementada aqui exatamente como o contrato
especifica, nunca com um parâmetro adicional não previsto — mesma disciplina de
`StockMovementRepository.findByProduct` (IMP-402) e `BillOfMaterialsRepository.findActiveByProduct`
(IMP-502). `findByTenant` (`TaxRegimeRepository`) é a única consulta deste Hub que já recebe `tenantId`
por especificação literal do Core.

**4. `findApplicable` sem critério de desempate quando mais de uma `TaxRule` é elegível para a mesma
combinação de regime/classificação/data — a arquitetura (Capítulo 9) não especifica ordenação.**
Resolução: `LIMIT 1` sem `ORDER BY` explícito, retornando a primeira correspondência da consulta —
mesmo comportamento não especificado do Fake em memória (`FakeTaxRuleRepository.findApplicable`, Core,
`Array.find`, primeira correspondência em ordem de inserção). Documentado em `SqliteTaxRuleRepository.ts`.

---

## 10. Decisões Tomadas

**`TaxRuleRepository` compartilhado entre `TaxRuleService` e `TaxCalculationService` no
`ManagerRegistry`.** Ambos os Services do Core operam sobre o mesmo Aggregate (`TaxRule`) através do
mesmo Repository Interface — uma única instância (`taxRuleRepository`, variável local) é passada a
ambos os construtores, nunca duas instâncias separadas. Em modo `real`, duas instâncias apontando para
a mesma `handle.db` seriam funcionalmente equivalentes (mesma tabela subjacente); em modo `fake`,
porém, duas instâncias de `FakeTaxRuleRepository` teriam mapas em memória independentes — uma
`TaxRule` criada via `TaxRuleService.create` nunca seria visível para `TaxCalculationService.calculateTax`.
A instância compartilhada evita esse bug em ambos os modos, mesmo padrão já usado por
`purchaseOrderRepository`/`billOfMaterialsRepository` (compartilhados entre múltiplos Services do mesmo
Manager) neste mesmo arquivo.

**Ordem de criação de tabelas na migration.** `tax_regimes` é criada antes de `tax_rules` (que a
referencia via FK); `fiscal_documents` e `tax_rules` são criadas antes de `fiscal_document_lines` (que
referencia ambas); `fiscal_obligations`, sem FK, não tem restrição de ordem. SQLite exige que a tabela
referenciada por uma FK já exista no momento da criação da tabela que a declara.

**Nenhum `UNIQUE` adicional em `tax_rules`/`fiscal_documents`/`fiscal_obligations`.** Diferente de
`tax_regimes.UNIQUE (tenant_id)` (tradução literal de "associado a exatamente uma Empresa por Tenant",
`FISCAL_HUB.md`, Capítulo 5), nenhuma das outras três Entidades tem uma regra de unicidade nomeada
textualmente pela arquitetura — nenhuma foi inventada, mesma disciplina conservadora já aplicada por
IMP-502 (`bills_of_materials`, sem `UNIQUE`).

---

## 11. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — nenhuma tabela ultrapassa o que `FISCAL_HUB.md`/o Core (IMP-601)
   já definem; nenhum campo, coluna ou índice sem correspondência em uma Entidade ou consulta real do
   Core. Quatro divergências reais documentadas na Seção 9, nenhuma resolvida silenciosamente.
2. **Auditoria realizada?** Sim — Seção 1, executada antes de qualquer código.
3. **Blueprint seguido?** Sim — Migration Pattern, Repository Pattern, Transaction Pattern, Manager
   Registry Pattern idênticos a IMP-202/302/402/502; nenhuma infraestrutura paralela criada.
4. **Código duplicado?** Não. `sqlUtil.ts` reutilizado sem alteração; nenhuma função de conversão
   duplicada.
5. **Componentes reutilizados?** Sim — `createTestDatabase`, `createDatabase`, `runMigrations`,
   `sqlUtil.ts` inteiros, sem modificação.
6. **Limitações documentadas?** Sim — Seção 9, quatro divergências, todas com precedente citado.
7. **Testes completos?** Sim — 36 testes novos de Repository cobrindo as sete categorias exigidas,
   mais os testes de `migrate.test.ts`/`createManagerRegistry.test.ts` atualizados. Ver Seção 8 para
   comparação de cobertura com IMP-502.
8. **OpenAPI validada?** Não aplicável — Persistence não expõe HTTP.
9. **Workspace sem acesso direto ao HTTP?** Não aplicável — Persistence não possui Workspace/Frontend.
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura foi alterado.

**Existe melhoria para Supplier/Purchase/Inventory Movement/Production?** Nenhuma identificada —
nenhum dos quatro domínios já concluídos foi tocado por esta Sprint, além da extensão estritamente
necessária de dois arquivos de teste compartilhados (`migrate.test.ts`/`createManagerRegistry.test.ts`),
mesma disciplina já registrada por IMP-502 ao tocar esses mesmos dois arquivos.

Nenhuma refatoração além do estritamente necessário para esta Sprint foi realizada.

---

## 12. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três vezes consecutivas sobre o
workspace completo (27 pacotes + 2 apps, `@abp/persistence` agora com dependência real de
`@abp/fiscal-hub`):

| Execução | typecheck | build | lint | test (workspace completo) |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ⚠️ 1352 testes, 1350 aprovados + 1 falha esperada + **1 falha inesperada** |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 1352 testes, 1351 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 1352 testes, 1351 aprovados + 1 falha esperada |

**Mesmo flake pré-existente e não relacionado já registrado por IMP-601, reconfirmado nesta Sprint.**
`apps/web/src/pages/production/ProductionPage.test.tsx` ("Visão Geral mostra KPIs reais...") falhou na
execução 1 por timeout de `waitFor`, e passou normalmente nas execuções 2 e 3 — mesmo comportamento
intermitente já documentado em `IMP_601_FISCAL_HUB_CORE_REPORT.md`, Seção 13. Este arquivo pertence ao
Production Workspace (IMP-505, Frontend) — **nenhuma linha dele, nem de qualquer arquivo em
`apps/web/`, foi tocada por esta Sprint**, que se limitou a `platform/packages/persistence/` e a duas
linhas de referência de projeto (`platform/packages/persistence/tsconfig.json`,
`platform/packages/persistence/package.json`). Per `STD-001`, Capítulo 13 e Capítulo 12, este achado é
reconfirmado aqui e não corrigido — está fora do escopo autorizado desta Sprint ("somente Persistence").

**O subconjunto de testes desta Sprint** (`repositories/fiscal/SqliteRepositories.test.ts` +
`db/migrate.test.ts` + `composition/createManagerRegistry.test.ts`, 45 testes), isolado, foi executado
três vezes adicionais e obteve 45/45 aprovados nas três execuções, sem nenhuma flake:

| Execução (isolada) | Testes |
|---|---|
| 1 | ✅ 3 arquivos, 45 aprovados |
| 2 | ✅ 3 arquivos, 45 aprovados |
| 3 | ✅ 3 arquivos, 45 aprovados |

`pnpm lint` continua escopado apenas a `apps/api`/`apps/web` — `packages/persistence` (como todo
pacote de domínio/infra) nunca definiu script `lint` próprio, inalterado por esta Sprint.

---

## 13. Preparação para IMP-603

`@abp/fiscal-hub` agora tem persistência SQLite real completa, disponível via
`createManagerRegistry("real", handle).fiscal`, pronta para ser exposta por HTTP:

- Os oito Commands de `FiscalManager` (`registerTaxRegime`, `createTaxRule`, `deactivateTaxRule`,
  `calculateTax`, `issueFiscalDocument`, `cancelFiscalDocument`, `registerFiscalObligation`,
  `markFiscalObligationFulfilled`) mais a orquestração `evaluateFiscalObligations` já funcionam de
  ponta a ponta sobre SQLite real, verificado pelo teste de integração em
  `createManagerRegistry.test.ts`.
- **Limitações herdadas do Core que IMP-603 deve conhecer** (Seção 9, item 3): nenhuma consulta de
  Fiscal Hub além de `findByTenant` filtra por `tenantId` explicitamente — `getTaxRule`/
  `listFiscalDocumentsByOrigin`/`listPendingFiscalObligations`/`listOverdueFiscalObligations` no
  `FiscalManager` (Core) herdam essa mesma limitação. Uma Sprint de HTTP precisará decidir se compensa
  isso na camada de API ou aceita a limitação e a documenta novamente — nunca resolvida silenciosamente
  em nenhuma camada.
- **Padrão de correlação de identificador que a rota HTTP de `IssueFiscalDocument` precisará
  respeitar**: `fiscalDocumentLineId` é gerado pelo chamador, não pelo servidor, e deve permanecer
  estável entre uma chamada anterior a `CalculateTax` (que o referencia no Evento `TaxCalculated`) e a
  chamada a `IssueFiscalDocument` — a rota HTTP precisará decidir como esse identificador é exposto/
  exigido no contrato de request (provavelmente no corpo de `POST /fiscal/tax-calculations`, ecoado
  pelo cliente na chamada seguinte), nunca gerado silenciosamente de novo no meio do fluxo.
- Nenhuma mudança de schema é antecipada — as cinco tabelas já cobrem toda Entidade/Value Object do
  Core.

Ao final desta Sprint: Supplier Hub ✅, Purchase Hub ✅, Inventory Movement Hub ✅, Production Hub ✅,
Fiscal Hub (Core ✅, **Persistence ✅**) — preparando IMP-603 (Fiscal HTTP API), IMP-604 (Fiscal
Frontend), IMP-605 (Fiscal Workspace).
