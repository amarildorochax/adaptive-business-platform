# IMP-502 — Production Persistence

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-04
Escopo: exclusivamente Persistence (`packages/persistence`) — Arquitetura, Core, HTTP, Frontend e
Workspace permanecem fora de escopo, per instrução explícita desta Sprint.

---

## Nota de Posicionamento

Este relatório documenta a implementação de persistência SQLite real para o **Production Hub**
(`@abp/production-hub`, IMP-501, congelado nesta Sprint), seguindo rigorosamente os três blueprints já
consolidados: Supplier Persistence (IMP-202), Purchase Persistence (IMP-302) e Inventory Movement
Persistence (IMP-402, o mais recente). Nenhum padrão novo foi criado — toda decisão replica um dos três
precedentes já existentes.

---

## 1. Auditoria Realizada (Passo 1)

Executada antes de qualquer código, comparando Arquitetura → Production Hub Core (IMP-501) →
Persistência existente → Supplier → Purchase → Inventory Movement Persistence.

**Existe persistência parcial?** Não. Nenhuma tabela, Repository SQLite ou wiring de
`createManagerRegistry` relacionado a Production existia em `packages/persistence` antes desta Sprint —
confirmado por leitura completa de `src/db/migrations/` (4 arquivos, o mais recente
`0004_inventory_movement_hub.sql`), `src/repositories/` (7 pastas, nenhuma `production/`) e
`src/composition/createManagerRegistry.ts` (`ManagerRegistry` sem campo `production`).

**Existe migração já criada?** Não — `0005_production_hub.sql` é inteiramente nova, criada por esta
Sprint.

**Existe colisão?** Não. Nenhuma tabela nova (`bills_of_materials`, `bom_lines`, `work_centers`,
`production_orders`, `production_consumptions`, `production_outputs`) colide, por nome ou por
propósito, com nenhuma das 27 tabelas já existentes.

**Existe oportunidade de reutilização?** `sqlUtil.ts` (`toMs`/`fromMs`/`toMsOrNull`/
`fromMsOrUndefined`/`orNull`/`orUndefined`/`toBoolInt`/`fromBoolInt`) já cobre integralmente as
conversões necessárias — nenhuma função nova foi adicionada a esse arquivo compartilhado. `Sqlite
PurchaseOrderRepository` (Aggregate + array interno de Entidade filha) é o template estrutural direto
para `SqliteProductionOrderRepository` (mesmo padrão, duas listas internas em vez de uma).

**Existe abstração válida?** Nenhuma nova extraída — mesma resposta conservadora já dada por IMP-202/
IMP-302/IMP-402 ("Persistence só estende padrões já existentes ao seu primeiro caso de uso real, nunca
redefine um contrato do Core").

**Existe melhoria para STD-001?** Nenhuma identificada — o padrão Migration/Repository/Transaction/
Manager Registry já documentado em `ADAPTIVE_DEVELOPMENT_STANDARD.md` cobriu integralmente as
necessidades deste domínio, incluindo o caso "Aggregate com dois arrays internos" (generalização direta
do caso de um array já coberto por Purchase Hub).

---

## 2. Migration

`src/db/migrations/0005_production_hub.sql` — seis tabelas, aplicada após `0004_inventory_movement_hub.sql`
(próximo prefixo numérico, descoberta por listagem de diretório + ordenação alfabética, sem índice de
registro separado, mesmo mecanismo de `db/migrate.ts`, inalterado).

## 3. Tabelas

| Tabela | Chave primária | FK (mesmo Hub) | Observação |
|---|---|---|---|
| `bills_of_materials` | `bill_of_materials_id` (TEXT, natural) | — | |
| `bom_lines` | `line_id` (INTEGER AUTOINCREMENT) | `bill_of_materials_id` | `BOMLine` sem id próprio no Core |
| `work_centers` | `work_center_id` (TEXT, natural) | — | |
| `production_orders` | `production_order_id` (TEXT, natural) | `bill_of_materials_id`, `work_center_id` (nullable) | |
| `production_consumptions` | `consumption_id` (TEXT, natural) | `production_order_id` | `ProductionConsumption` tem id próprio no Core |
| `production_outputs` | `output_id` (TEXT, natural) | `production_order_id` | `ProductionOutput` tem id próprio no Core |

Convenções idênticas às três Persistences anteriores: `snake_case`, `TEXT` para string/enum, `INTEGER`
para epoch milissegundos (datas) e boolean (0/1), um `CREATE INDEX IF NOT EXISTS` por coluna usada em
algum `find*`, `IF NOT EXISTS` em toda `CREATE TABLE`/`CREATE INDEX`. Nenhum `CHECK` (validação
permanece exclusivamente em `ProductionValidator`, Core). Nenhum `TRIGGER` (`ProductionOrder` é máquina
de estados, não ledger append-only — ver Seção 10).

**Divergência de tipo, documentada**: `planned_output_quantity`, `quantity_per_output_unit`,
`quantity_consumed`, `quantity_generated` são `REAL`, não `INTEGER` como o equivalente em Purchase Hub
(`purchase_order_items.quantity_ordered`) — `UnitOfMeasure` (Core, IMP-501) inclui `Kilogram`/`Liter`/
`Meter`, quantidade fracionária é dado de negócio legítimo (Core já valida apenas "positivo e finito",
nunca "inteiro"). Documentado no cabeçalho da migration.

## 4. Repositories

Três arquivos em `src/repositories/production/`, um por Repository Interface, exatamente o padrão de
`repositories/<hub>/`:

- **`SqliteBillOfMaterialsRepository`** — `save` (upsert `INSERT ... ON CONFLICT DO UPDATE`) +
  `replaceLines` (DELETE + INSERT em laço) em uma única transação; `findById`; `findActiveByProduct`
  (sem `tenantId` — ver Seção 8).
- **`SqliteProductionOrderRepository`** — `save` (upsert) + `replaceConsumptions` + `replaceOutputs`
  (dois DELETE + INSERT em laço) em uma única transação; `findById`; `findByStatus`; `findByOrigin`
  (nenhum recebe `tenantId` — ver Seção 8). Template direto: `SqlitePurchaseOrderRepository`
  (Aggregate + array interno), generalizado para dois arrays.
- **`SqliteWorkCenterRepository`** — `save` (upsert, tabela única, sem transação explícita — um único
  `INSERT` já é atômico, mesmo critério de `SqliteReorderRuleRepository`); `findActive` (sem
  `tenantId`).

`ProductionConsumption`/`ProductionOutput` **não** têm Repository próprio — são partes internas de
`ProductionOrder` per `PRODUCTION_HUB.md`, Capítulo 4/9 (apenas três Repository Interfaces
especificadas), regravadas por completo a cada `save()` do Aggregate pai, mesma disciplina de
`purchase_order_items`.

## 5. Manager Registry

`createManagerRegistry.ts`: `ManagerRegistry.production: ProductionManager` adicionado; construção via
padrão ternário-por-linha (como `supplier`/`purchase`, não o bloco `if/else` do Inventory Movement Hub —
nenhum dos três Fakes de Production precisa de referência cruzada entre si, diferente de
`FakeStockPositionRepository`); `production` retornado junto aos demais sete Managers. Comentário de
cabeçalho da função atualizado: "sete domínios/trinta e três Repository Interfaces" →
**"oito domínios/trinta e seis Repository Interfaces"**.

`createManagerRegistry.test.ts`: contagem de Managers em modo `fake` — sete → **oito**; novo teste
`"mode 'real' — ProductionManager: ..."` exercitando `createBillOfMaterials → createProductionOrder →
startProduction → registerProductionConsumption → registerProductionOutput → completeProduction` sobre
SQLite real, mesmo formato dos cinco testes `"mode 'real'"` já existentes.

## 6. Transactions

Toda escrita de Aggregate + entidade interna ocorre em uma única transação `BEGIN`/`COMMIT`/`ROLLBACK`
(manual, via `db.exec`, já que `node:sqlite` não expõe um helper `db.transaction(...)`), mesmo padrão de
`SqliteSupplierRepository`/`SqlitePurchaseOrderRepository`: `SqliteBillOfMaterialsRepository.save` (BOM
+ `bom_lines`) e `SqliteProductionOrderRepository.save` (ProductionOrder + `production_consumptions` +
`production_outputs`, três tabelas em uma única transação). `SqliteWorkCenterRepository.save` (tabela
única) não usa transação explícita — mesmo critério de `SqliteReorderRuleRepository`/
`SqliteStockLocationRepository`: um `INSERT`/upsert isolado já é atômico por natureza do SQLite.

## 7. Foreign Keys

Aplicada a regra já idêntica nos três relatórios anteriores: **FK sempre que a tabela referenciada
existe dentro do mesmo Hub; nunca através da fronteira de um Hub.**

| Coluna | FK? | Motivo |
|---|---|---|
| `bom_lines.bill_of_materials_id` | Sim → `bills_of_materials` | parte-interna-do-Aggregate, mesmo Hub |
| `production_orders.bill_of_materials_id` | Sim → `bills_of_materials` | referência declarada em `PRODUCTION_HUB.md`, Capítulo 4, mesmo Hub |
| `production_orders.work_center_id` | Sim → `work_centers` (nullable) | Capability opcional, mesmo Hub |
| `production_consumptions.production_order_id` | Sim → `production_orders` | parte-interna-do-Aggregate |
| `production_outputs.production_order_id` | Sim → `production_orders` | parte-interna-do-Aggregate |
| `bills_of_materials.output_product_id` | Não | Commerce Hub, identificador opaco |
| `bom_lines.input_product_id`/`variant_id` | Não | Commerce Hub, identificador opaco |
| `production_orders.order_id` | Não | Commerce Hub, identificador opaco |
| `production_consumptions.input_product_id` | Não | Commerce Hub, identificador opaco |
| `production_outputs.output_product_id` | Não | Commerce Hub, identificador opaco |

Nenhuma FK criada "apenas por consistência visual" — cada uma corresponde a uma referência real
declarada por `PRODUCTION_HUB.md`. Nenhum `UNIQUE` foi adicionado (ver Seção 11, decisão explícita de
não replicar o padrão `UNIQUE (tenant_id, tax_id_value)` de Supplier Hub sem uma regra de negócio
nomeada equivalente).

---

## 8. Testes e Cobertura

`src/repositories/production/SqliteRepositories.test.ts` — 33 testes novos, organizados por
Repository, mesmas sete categorias já exigidas (comparável a IMP-402):

| Categoria | Cobertura |
|---|---|
| CRUD completo | `save`/`findById`/`findActiveByProduct`/`findByStatus`/`findByOrigin`/`findActive` para os três Repositories, incluindo upsert (nunca duplica linha) |
| Constraints/FK | inserção direta via SQL cru contra `bom_lines`/`production_consumptions`/`production_outputs` referenciando pai inexistente; `save()` via Repository rejeitando `billOfMaterialsId`/`workCenterId` inexistente |
| Rollback (atomicidade) | `BillOfMaterials` (line malformada — `NOT NULL` — no meio do laço) e `ProductionOrder` (consumption duplicado — colisão de `PRIMARY KEY` — no meio do laço), ambos verificados por `SELECT` cru pós-falha, confirmando que nem o pai sobrevive |
| Persistência entre conexões | `BillOfMaterials`+`BOMLine` e `ProductionOrder`+`consumptions` sobrevivem a fechar/reabrir uma conexão contra arquivo temporário |
| Migration | `migrate.test.ts` estendido — seis tabelas novas, contagem de `_migrations` 5 → 6 |
| Integridade/domínio | quantidade fracionária (`REAL`) preservada exatamente; datas opcionais preservadas como `undefined`, nunca epoch zero; round-trip de `WorkCenter.active` (boolean ↔ INTEGER); regravação completa (nunca acumulativa) de `bom_lines`/`consumptions`/`outputs` a cada `save` |
| ManagerRegistry integration | `createManagerRegistry.test.ts`, novo `"mode 'real' — ProductionManager"`, ciclo completo sobre SQLite real |

**Resultado**: 124 testes no pacote `@abp/persistence` completo (33 novos de Production, os demais já
existentes de Business Profile/Branding/CRM/IAM/Supplier/Purchase/Inventory Movement), 100% aprovados,
três execuções consecutivas sem flake. `pnpm test` (workspace completo): 198 arquivos de teste (era 197
antes desta Sprint), 1151 testes aprovados + 1 falha esperada (mesma de IMP-501/IMP-303, não
relacionada), idêntico nas três execuções.

**Comparação com Inventory Movement Persistence (IMP-402, referência de cobertura explícita desta
Sprint)**: IMP-402 cobriu as mesmas sete categorias sobre cinco Repositories sem relação
Aggregate-pai/filho entre si (nenhum teste de "Aggregate + entidade interna em transação"). Esta Sprint
cobre as mesmas sete categorias sobre três Repositories, dois dos quais (`BillOfMaterials`,
`ProductionOrder`) *são* Aggregate + entidade(s) interna(s) — replicando, portanto, também a categoria
de teste de IMP-302 (Purchase Hub) que IMP-402 não precisou exercitar (rollback de Aggregate + filha
via transação). Cobertura combinada, superior em amplitude de cenário à de IMP-402 isoladamente.

---

## 9. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**1. Quantidades como `REAL`, não `INTEGER`** (ver Seção 3) — já documentada no cabeçalho da migration,
decisão explícita diante do precedente `INTEGER` de Purchase Hub.

**2. `findActiveByProduct`/`findById` (BillOfMaterials) e `findActive` (WorkCenter) e `findByStatus`/
`findByOrigin` (ProductionOrder) não recebem `tenantId`** — limitação já herdada e documentada pelo
próprio Core (IMP-501, `BillOfMaterialsRepository.ts`/`WorkCenterRepository.ts`/
`ProductionOrderRepository.ts`), implementada aqui exatamente como o contrato especifica, nunca com um
parâmetro adicional não previsto — mesma disciplina de `StockMovementRepository.findByProduct`
(IMP-402, ausência de `variantId`). Consequência prática: uma consulta `findActiveByProduct('bread')`
teoricamente pode atravessar Tenants caso dois Tenants distintos usem o mesmo `outputProductId` —
aceito como limitação herdada, não resolvido silenciosamente nesta Sprint.

**3. `ProductionOrderRepository.save`/`BillOfMaterialsRepository.save`/`WorkCenterRepository.save` são
o único método de escrita especificado (Core, Capítulo 9) — implementados como upsert
(`INSERT ... ON CONFLICT DO UPDATE`), diferente do par `create`/`update` que Purchase/Supplier
especificam.** Nenhuma Amendment necessária — o contrato já era assim desde o Core (IMP-501), a
Persistence apenas implementa a única forma de escrita definida.

---

## 10. Decisões Tomadas

**Nenhum `TRIGGER` de imutabilidade.** `ProductionOrder` é uma máquina de estados
(`Planned`/`InProgress`/`Completed`/`Cancelled`), não um ledger append-only como `stock_movements` —
`ProductionOrderRepository` (Core) expõe `save`, nunca apenas `append`. `production_consumptions`/
`production_outputs`, embora descritos como "registro imutável" no Core, são regravados em bloco
(DELETE + INSERT) a cada `save()` do Aggregate pai — mesmo padrão não-`TRIGGER`-enforced de
`purchase_order_items` (cujo `quantityReceived` também é um "fato registrado" sem enforcement a nível
de trigger).

**Nenhum `UNIQUE` em `bills_of_materials`.** Diferente de `suppliers.UNIQUE (tenant_id, tax_id_value)`
(tradução literal de uma regra nomeada explicitamente em `SUPPLIER_HUB.md`, Capítulo 11 — "TaxId único
por Tenant"), `PRODUCTION_HUB.md` nunca nomeia uma regra equivalente para "apenas uma BillOfMaterials
Active por Produto" — é uma consequência de uso correto de `BillOfMaterialsService.supersede` (Core),
nunca uma invariante independente com nome próprio. Avaliado e conscientemente não adicionado, para
não inventar uma restrição de negócio não escrita pela arquitetura.

**`Money`/Value Objects com múltiplos campos não se aplicam aqui.** Diferente de Purchase Hub
(`acquisition_cost_amount`/`acquisition_cost_currency_code` achatados de `Money`), Production Hub não
possui nenhum Value Object de campo múltiplo no seu modelo de dados persistido — `acquisitionCost` é um
`number` simples (decisão já tomada no Core, IMP-501, Divergência 1), armazenado em uma única coluna
`REAL`, sem achatamento necessário.

**Ordem de criação de tabelas na migration.** `bills_of_materials` e `work_centers` são criadas antes
de `production_orders` (que referencia ambas via FK); `production_orders` é criada antes de
`production_consumptions`/`production_outputs` (que a referenciam). SQLite exige que a tabela
referenciada por uma FK já exista no momento da criação da tabela que a declara.

---

## 11. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — nenhuma tabela ultrapassa o que `PRODUCTION_HUB.md`/o Core (IMP-501)
   já definem; nenhum campo, coluna ou índice sem correspondência em uma Entidade ou consulta real do
   Core.
2. **Auditoria realizada?** Sim — Seção 1.
3. **Blueprint seguido?** Sim — Migration Pattern, Repository Pattern, Transaction Pattern, Manager
   Registry Pattern idênticos a IMP-202/IMP-302/IMP-402; nenhuma infraestrutura paralela criada.
4. **Código duplicado?** Não. `sqlUtil.ts` reutilizado sem alteração; nenhuma função de conversão
   duplicada.
5. **Componentes reutilizados?** Sim — `createTestDatabase`, `createDatabase`, `runMigrations`,
   `sqlUtil.ts` inteiros, sem modificação.
6. **Limitações documentadas?** Sim — Seção 9, três divergências, todas com precedente citado.
7. **Testes completos?** Sim — 33 testes novos cobrindo as sete categorias exigidas, mais os dois testes
   de integração em `createManagerRegistry.test.ts`. Ver Seção 8 para comparação de cobertura com IMP-402.
8. **OpenAPI validada?** Não aplicável — Persistence não expõe HTTP.
9. **Workspace sem acesso direto ao HTTP?** Não aplicável — Persistence não possui Workspace/Frontend.
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura foi alterado.

**Existe melhoria para Supplier/Purchase/Inventory Movement?** Nenhuma identificada — apenas uma
correção de comentário desatualizado em `createManagerRegistry.ts` (contagem de domínios/Repository
Interfaces), já sinalizada como pendente desde IMP-402 e corrigida ao tocar o mesmo bloco nesta Sprint
(per instrução "nunca corrigir silenciosamente" — corrigida porque a própria Sprint já editava aquele
comentário, não uma refatoração proativa fora de escopo).

Nenhuma refatoração além do estritamente necessário para esta Sprint foi realizada.

---

## 12. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três vezes consecutivas sobre o
workspace completo (26 pacotes + 2 apps, `@abp/persistence` agora com dependência real de
`@abp/production-hub`):

| Execução | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 198 arquivos, 1151 aprovados + 1 falha esperada |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 198 arquivos, 1151 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 198 arquivos, 1151 aprovados + 1 falha esperada |

**Nenhuma flake observada** — resultado idêntico nas três execuções. A única falha (`it.fails`) é o bug
de duplo `registerReceiving` já documentado por IMP-303
(`docs/implementation/IMP_303_PURCHASE_HTTP_API_REPORT.md`), pré-existente, não relacionado a esta
Sprint. `pnpm lint` continua escopado apenas a `apps/api`/`apps/web` — `packages/persistence`
(como todo pacote de domínio/infra) nunca definiu script `lint` próprio, inalterado por esta Sprint.

---

## 13. Preparação para IMP-503

`@abp/production-hub` agora tem persistência SQLite real completa, disponível via
`createManagerRegistry("real", handle).production`, pronta para ser exposta por HTTP:

- Os nove Commands de `ProductionManager` (`createBillOfMaterials`, `supersedeBillOfMaterials`,
  `createProductionOrder`, `startProduction`, `registerProductionConsumption`,
  `registerProductionOutput`, `completeProduction`, `cancelProduction`, `createWorkCenter`) já
  funcionam de ponta a ponta sobre SQLite real, verificado pelo teste de integração em
  `createManagerRegistry.test.ts`.
- **Limitações herdadas do Core que IMP-503 deve conhecer** (Seção 9, item 2): nenhuma consulta de
  Production Hub filtra por `tenantId` — `getBillOfMaterials`/`getActiveBillOfMaterialsForProduct`/
  `listProductionOrdersByStatus`/`listProductionOrdersByOrigin`/`listActiveWorkCenters` no
  `ProductionManager` (Core) herdam essa mesma limitação. Uma Sprint de HTTP precisará decidir se
  compensa isso na camada de API (ex.: filtro pós-consulta) ou aceita a limitação e a documenta
  novamente — nunca resolvida silenciosamente em nenhuma camada.
- **Limitação de domínio já resolvida no Core, relevante para o design de rotas HTTP**: `StartProduction`
  recebe `availableQuantities: ReadonlyMap<string, number>` como parâmetro explícito (IMP-501,
  Divergência 2) — a rota HTTP de `StartProduction` precisará decidir como essa Query real ao Inventory
  Movement Hub é montada antes de chamar `ProductionManager.startProduction` (provavelmente compondo
  `InventoryMovementManager.getStockPosition` por linha da BOM na própria camada HTTP/aplicação, nunca
  dentro de `@abp/production-hub`).
- Nenhuma mudança de schema é antecipada — as seis tabelas já cobrem toda Entidade/Value Object do Core.

Ao final desta Sprint: Supplier Hub ✅, Purchase Hub ✅, Inventory Movement Hub ✅, Production Hub
(Core ✅, **Persistence ✅**) — preparando IMP-503 (Production HTTP API), IMP-504 (Production
Frontend), IMP-505 (Production Workspace).
