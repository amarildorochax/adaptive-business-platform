# IMP-402 — Inventory Movement Persistence

**Adaptive Business Platform · Relatório de Implementação**

Status: Concluído · 2026-08-01

---

## Nota de Posicionamento

Segunda etapa do Inventory Movement Hub, sob STD-001 — `docs/standards/ADAPTIVE_DEVELOPMENT_STANDARD.md`
e `ADAPTIVE_ENGINEERING_CHECKLIST.md`, seguindo integralmente os blueprints de IMP-202 (Supplier
Persistence) e IMP-302 (Purchase Persistence). Esta Sprint implementa exclusivamente a **Persistência**
do Inventory Movement Hub — nenhuma linha de `packages/inventory-movement-hub` (Arquitetura, Core,
Commands, Events, Entities, Value Objects, Policies, Validators, Factories, Services, Manager,
Repository Interfaces) foi alterada. Nada de HTTP, nada de Frontend, nada de Workspace.

---

## Sumário

1. Auditoria Realizada (Passo 1)
2. Schema SQLite
3. Foreign Keys
4. Append-Only
5. Stock Position
6. Transações e Rollback
7. Integração com ManagerRegistry
8. Testes
9. Divergências Encontradas
10. Limitações
11. Qualidade
12. Validação
13. Preparação para IMP-403

---

## 1. Auditoria Realizada (Passo 1)

Leitura integral de `ERP_ARCHITECTURE.md`, `INVENTORY_MOVEMENT_HUB.md`, `ERP_CONTEXT_MAP.md`,
`DOMAIN_EVENT_CATALOG.md`, `ERP_FOUNDATION_REPORT.md`, `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`,
`IMP_202_SUPPLIER_PERSISTENCE_REPORT.md`, `IMP_302_PURCHASE_PERSISTENCE_REPORT.md`, STD-001. Código
existente de `packages/persistence` lido diretamente — `db/client.ts`, `db/config.ts`, `db/migrate.ts`,
`db/sqlUtil.ts`, `db/migrations/0003_purchase_hub.sql`, `composition/createManagerRegistry.ts`, e os
três `Sqlite*Repository` do Purchase Hub (`SqlitePurchaseOrderRepository`, `SqliteReceivingRepository`,
`SqliteReorderRuleRepository`) como referência estrutural direta, não por memória.

**Existe padrão reutilizável?** Sim, integralmente — `createDatabase`/`runMigrations`/`sqlUtil.ts`
(`toMs`/`toMsOrNull`/`fromMs`/`fromMsOrUndefined`/`orNull`/`orUndefined`/`toBoolInt`/`fromBoolInt`),
`createTestDatabase()` para teste, e a estrutura de arquivo `Sqlite{Entity}Repository.ts` por
Repository Interface — todos reaproveitados sem nenhuma alteração de contrato.

**Existe oportunidade de abstração?** Sim, uma nova, real e documentada nesta Sprint (Seção 4) — os
dois triggers de append-only em `stock_movements` são o primeiro uso de `TRIGGER` em toda a
plataforma; se um domínio futuro (Finance Hub, `Ledger Entry`) precisar do mesmo padrão de ledger
imutável, o par `BEFORE UPDATE`/`BEFORE DELETE` com `RAISE(ABORT, ...)` já está provado aqui como
referência — documentado, nunca extraído preventivamente (Finance Hub está fora de escopo, congelado).

**Existe limitação existente?** Sim, herdada do Core (IMP-401), não desta Sprint — `StockPositionRepository`/
`StockReservationRepository` não recebem `variantId` como parâmetro de consulta (Seção 10).

**Existe conflito arquitetural?** Nenhum novo. O conflito já conhecido — `packages/commerce-hub`
possuir seu próprio `Inventory`/`StockUpdated` — permanece exatamente como IMP-401 o deixou: um Change
Request formal (ADR-IM-001) proposto e nunca executado; esta Sprint não cria nenhuma tabela, view ou
qualquer outra estrutura que colida com `commerce-hub`, e não lê nem escreve nenhuma tabela daquele
Hub.

---

## 2. Schema SQLite

Migration `0004_inventory_movement_hub.sql`, cinco tabelas — `stock_movements`, `stock_positions`,
`stock_reservations`, `stock_locations`, `stock_alert_rules` — cada uma espelhando, campo a campo, a
Entity já aprovada pelo Core (IMP-401), com índice em toda coluna usada por um método `find*` do
Repository correspondente. `_migrations` agora registra 5 arquivos aplicados (era 4).

---

## 3. Foreign Keys

**Nenhuma FOREIGN KEY entre as cinco tabelas deste Hub** — divergência real e documentada frente ao
Purchase Hub (IMP-302, primeira FK cross-Aggregate-Root da plataforma). Diferente de `purchase_orders`
↔ `purchase_requisitions` (dois Aggregate Roots que se referenciam mutuamente por desenho de domínio),
os cinco Aggregates do Inventory Movement Hub são estruturalmente independentes — nenhum "contém" nem
é referenciado pelo id de outro; toda relação entre eles (mesmo `product_id`/`location_id`) é por
valor correlacionado, nunca por chave estrangeira. `product_id`/`variant_id`/`location_id`/
`origin_reference_id`/`order_id` são todos identificadores opacos de outros Hubs — mesma disciplina já
aplicada a `reorder_rules.product_id` (IMP-302): nenhuma FOREIGN KEY cruza a fronteira de um Hub.

---

## 4. Append-Only

A característica central deste domínio. `StockMovementRepository` (Core, congelado) já expõe apenas
`append`, nunca `update`/`delete`. Esta Sprint reforça a mesma garantia um nível abaixo, diretamente no
banco — primeiro uso de `TRIGGER` em toda a plataforma:

```sql
CREATE TRIGGER IF NOT EXISTS trg_stock_movements_no_update
BEFORE UPDATE ON stock_movements
BEGIN
  SELECT RAISE(ABORT, 'stock_movements is append-only: UPDATE is not permitted');
END;

CREATE TRIGGER IF NOT EXISTS trg_stock_movements_no_delete
BEFORE DELETE ON stock_movements
BEGIN
  SELECT RAISE(ABORT, 'stock_movements is append-only: DELETE is not permitted');
END;
```

Isso é defesa em profundidade — mesmo um `UPDATE`/`DELETE` executado fora de
`SqliteStockMovementRepository` (SQL direto, uma migration futura mal escrita) falha, nunca silenciosamente
aceito. Testado explicitamente com os quatro cenários obrigatórios do prompt (Seção 8).

Este trigger não duplica nenhuma regra de negócio do Core — `InventoryValidator`/`InventoryPolicy` não
têm (nem precisam ter) uma noção de "impedir update", porque o próprio `StockMovementRepository`
nunca expõe um método de update ao Core; o trigger reforça um invariante estrutural de interface
(contrato de Repository), não uma decisão de domínio.

---

## 5. Stock Position

`SqliteStockPositionRepository.recalculate` é, por desenho já especificado em
`INVENTORY_MOVEMENT_HUB.md`, Capítulo 9, o único lugar de toda a plataforma onde a soma do ledger
acontece: `SUM(quantity_delta)` sobre `stock_movements` + `SUM(quantity)` sobre `stock_reservations`
ativas, seguidos de um upsert (`INSERT ... ON CONFLICT (position_key) DO UPDATE`) em `stock_positions`
— o cache de leitura consultado por `findByProduct`. `computeQuantityAvailable` (a subtração
`onHand - reserved`) é reaproveitada de `@abp/inventory-movement-hub`, a mesma função pura já aprovada
pelo Core — nunca reimplementada em paralelo aqui. **Nenhuma decisão de `InventoryPolicy`/
`InventoryValidator` é duplicada nesta camada** — a soma é derivação aritmética sobre o ledger, não uma
regra de negócio nova.

`position_key` (`product_id || '::' || COALESCE(location_id, '')`, computado em TypeScript, nunca em
SQL) é a chave primária substituta de `stock_positions` — evita a ambiguidade de `PRIMARY KEY`
composta com coluna nullable que o SQLite não garante como verdadeiramente única.

---

## 6. Transações e Rollback

`recalculate` roda dentro de `BEGIN IMMEDIATE`/`COMMIT` — `IMMEDIATE` adquire o lock de escrita já no
início, evitando que um `append`/`create` concorrente altere o ledger entre a soma e a gravação da
projeção. Todo outro método de escrita (`append`, `create`/`update` de Reservation/Location/AlertRule)
é um único `INSERT`/`UPDATE`, atômico por natureza do próprio SQLite — mesmo critério já registrado por
`SqliteReorderRuleRepository` (IMP-302): "Única Entidade sem nenhuma tabela filha — sem transação
explícita, cada INSERT/UPDATE já é atômico".

**Divergência documentada frente ao pedido de "testes de rollback"**: o Purchase Hub testou rollback
via violação de FOREIGN KEY em uma escrita multi-tabela (Purchase Order + Items). Este Hub não possui
nenhuma tabela filha nem nenhuma FK entre suas próprias tabelas (Seção 3) — não existe um cenário
FK-triggered de rollback multi-tabela para reproduzir aqui, e fabricar um seria inventar uma
característica que este domínio genuinamente não tem. Em vez disso, os testes de atomicidade/rollback
desta Sprint são os quatro cenários explicitamente exigidos pelo prompt ("TESTES ESPECÍFICOS DO
LEDGER", Seção 8) — a garantia transacional central deste Hub é a imutabilidade do ledger via trigger,
não a reversão de uma escrita multi-tabela.

---

## 7. Integração com ManagerRegistry

`ManagerRegistry.inventoryMovement: InventoryMovementManager` adicionado. `inventoryMovement` é o
primeiro Manager cuja construção em modo `"fake"` não cabe no padrão ternário-por-linha do restante do
arquivo — `FakeStockPositionRepository` (`@abp/inventory-movement-hub/testing`) exige, apenas em modo
teste, uma referência concreta às instâncias Fake de Movement/Reservation para poder recalcular a
posição em memória (decisão já tomada e documentada no próprio Core, IMP-401). Por isso a construção
das cinco Repository deste Hub usa um bloco `if (mode === "real") {...} else {...}`, em vez do padrão
ternário do restante do arquivo — mesmo resultado, forma diferente, decisão documentada explicitamente
no próprio `createManagerRegistry.ts`.

Um comentário desatualizado ("Comentário desatualizado desde IMP-202... corrigido nesta Sprint")
tocado por esta Sprint foi corrigido, mesma disciplina de correção-ao-tocar já registrada por IMP-302.

---

## 8. Testes

97 testes no pacote `@abp/persistence` (era 70 antes desta Sprint — 27 novos). Arquivo principal:
`repositories/inventory-movement/SqliteRepositories.test.ts` (25 testes) + 1 novo teste em
`composition/createManagerRegistry.test.ts` + ajuste de contagem em `db/migrate.test.ts`.

**Os quatro cenários obrigatórios do ledger, verbatim do prompt:**

1. *Registrar movimento → Consultar movimento → Tentar alterar → Falha.* Testado — `UPDATE` direto
   contra `stock_movements` lança `/append-only/`, e o dado consultado antes e depois permanece
   idêntico.
2. *Registrar movimento → Tentar remover → Falha.* Testado — `DELETE` direto lança `/append-only/`.
3. *Registrar sequência de movimentos → Consultar ordem cronológica → Validar integridade.* Testado —
   `findByProduct` ordena por `occurred_at ASC`; a soma dos deltas recuperados bate com o valor
   esperado.
4. *Registrar movimentações simultâneas → Validar consistência.* Testado via `Promise.all` de quatro
   `append` concorrentes — a soma final é exatamente a esperada. **Limitação honesta**: `node:sqlite`
   é uma conexão única, single-threaded, dentro de um único processo Node — não é possível testar
   concorrência real multi-processo/multi-conexão com este driver, mesma limitação já implícita (nunca
   antes testada explicitamente) em todo `Sqlite*Repository` desta plataforma. Este teste valida
   consistência sob concorrência lógica (múltiplas Promises no mesmo event loop), não concorrência de
   processo real.

**CRUD permitido pelo domínio**: `append`/`findByProduct`/`findByOriginReference` (Movement);
`recalculate`/`findByProduct` (Position, incluindo isolamento por `locationId` e upsert-nunca-duplica);
`create`/`update`/`findById`/`findActiveByProduct`/`findByOrder` (Reservation); `create`/`findById`/
`findAllActive` (Location); `create`/`update`/`findById`/`findActiveByProduct` (AlertRule).

**Constraints**: uma coluna NOT NULL ausente (`quantity_delta`) rejeitada diretamente.

**Cross-connection**: um Stock Movement gravado por uma conexão sobrevive ao fechar/reabrir contra o
mesmo arquivo — e o trigger de append-only permanece ativo na nova conexão (parte estrutural do
arquivo `.sqlite3`, não um estado de conexão).

**Migrations**: `db/migrate.test.ts` atualizado — lista exaustiva de tabelas agora inclui as cinco
novas, contagem de `_migrations` de 4 para 5; idempotência (reaplicar não falha nem duplica) já
coberta genericamente por aquele arquivo, sem necessidade de um teste próprio por Hub.

**ManagerRegistry**: novo teste `mode 'real' — InventoryMovementManager` exercitando
`registerStockMovement → createStockReservation → convertReservationToMovement` sobre SQLite real,
mesmo formato dos testes já existentes para Supplier/Purchase.

---

## 9. Divergências Encontradas

Nenhuma divergência exigiu Amendment formal contra documento Official/Frozen. A única decisão de
implementação com desvio de forma (não de contrato) é o bloco `if/else` de `createManagerRegistry.ts`
(Seção 7), documentada no próprio código e aqui.

---

## 10. Limitações

**Herdada do Core, não desta Sprint**: `StockPositionRepository.recalculate`/`findByProduct` e
`StockReservationRepository.findActiveByProduct` não recebem `variantId` — a soma de `stock_positions`
é, portanto, sobre todos os variants de um Produto/Localização combinados; `variantId` no
`StockPosition` retornado é sempre `undefined`. A tabela `stock_positions` deliberadamente não tem
coluna `variant_id` (uma coluna sempre nula sugeriria uma granularidade que esta Sprint não entrega).
Já documentada em `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`, Seção 11.2; permanece sem solução
porque a Repository Interface está congelada nesta Sprint — candidata a Amendment antes de uma futura
extensão de granularidade por variant.

**Concorrência real não testável**: ver Seção 8, cenário 4.

---

## 11. Qualidade

**STD-001 seguido?** Sim — Repository Interfaces intocadas, migrations idempotentes com
`CREATE TABLE/INDEX/TRIGGER IF NOT EXISTS`, PRAGMA `journal_mode=WAL`/`foreign_keys=ON` herdados sem
alteração, `sqlUtil.ts` reaproveitado sem nenhuma nova conversão.

**Append-only preservado?** Sim — reforçado em dois níveis (contrato de interface no Core + trigger no
banco), testado nos quatro cenários obrigatórios.

**Existe duplicação?** Não.

**Existe abstração reutilizável?** Sim — o par de triggers append-only, documentado na Seção 1 como
candidato a um padrão de "Ledger Table" caso um domínio futuro (Finance Hub) precise da mesma garantia;
nunca extraído preventivamente.

**Existe melhoria para Supplier/Purchase?** Não executada (fora de escopo). Observação registrada: os
comentários de `SqliteReorderRuleRepository`/`SqlitePurchaseOrderRepository` já preveem exatamente o
critério "sem tabela filha → sem transação explícita" que esta Sprint reaplicou integralmente — nenhum
ajuste retroativo necessário.

---

## 12. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint`, `pnpm test` executados três vezes na suíte completa do
monorepo (24 pacotes/apps), a partir de `platform/`.

**Run 1**: totalmente limpo — 953 testes passando + 1 `it.fails` esperado (IMP-303) = 954.

**Run 2**: typecheck/build/lint limpos; `pnpm test` teve 2 falhas isoladas em
`apps/web/src/core/purchase/purchaseClient.test.ts` e `.../supplier/supplierClient.test.ts` — ambos
testes de Cliente HTTP real (`testing/realApiServer.ts`, um servidor Fastify real por teste), falha de
contenção de recurso sob carga plena da suíte, não relacionada a nenhum arquivo desta Sprint. Confirmado
transiente por reexecução imediata e isolada de `pnpm test` — limpo (953+1=954).

**Run 3**: encontrou um problema de ambiente/ferramental, não de código — o `pnpm` recursivo (`-r`)
passou a executar um `runDepsStatusCheck` interno que falhou por causa de um aviso pré-existente e
benigno (`[ERR_PNPM_IGNORED_BUILDS] esbuild@0.25.12`, presente desde o primeiro `pnpm install` desta
Sprint, nunca bloqueante até este ponto). Resolvido com `pnpm approve-builds --all` (ação não
interativa, aprova apenas dependências já resolvidas no lockfile, nenhuma mudança de versão) — após
isso, os quatro comandos rodaram normalmente e de forma idêntica aos Runs 1/2: 953+1=954. Um segundo
problema, desta vez do ambiente de execução dos comandos (não do pnpm), foi identificado durante o
mesmo Run 3: um `pnpm -r` disparado a partir do diretório raiz do repositório (`adaptive-business-platform/`,
que não é o workspace pnpm — `platform/` é) silenciosamente escopou para um projeto diferente e menor,
produzindo um build de apenas 497 módulos em vez dos 2162 esperados de `apps/web`. Identificado antes
de qualquer conclusão errônea, corrigido reexecutando os quatro comandos com o diretório de trabalho
correto (`platform/`), resultado final idêntico aos Runs 1/2.

---

## 13. Preparação para IMP-403

`ManagerRegistry.inventoryMovement` está pronto para ser consumido por uma camada HTTP, seguindo
exatamente o blueprint de IMP-303 (Purchase HTTP API) — DTOs, Mapper, `mapInventoryMovementError.ts`
(quando aplicável, delegando a `mapDomainError.ts` genérico para os sete `InventoryDomainError`),
rotas Fastify, OpenAPI. Dois pontos de atenção já identificados para aquela Sprint:

1. `RegisterStockMovement` é, per `INVENTORY_MOVEMENT_HUB.md`, Capítulo 7, "interno, nunca exposto a
   um usuário final diretamente" — a Sprint de HTTP deve decidir explicitamente (e documentar) se esse
   Command recebe um endpoint HTTP mesmo assim (para uso administrativo/de integração futura) ou se
   permanece inacessível via HTTP nesta Fase, nunca uma decisão implícita.
2. A limitação de `variantId` (Seção 10) se propaga naturalmente para qualquer DTO de
   `StockPosition`/`StockReservation` exposto via HTTP — a Sprint de HTTP deve documentá-la de novo em
   seu próprio relatório, nunca presumir que já está resolvida por ter sido apenas mencionada aqui.
