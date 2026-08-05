# IMP-302 — Purchase Persistence — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-302 — Purchase Persistence**, a segunda etapa da implementação do Purchase Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-301). Ela adiciona, exclusivamente ao pacote já existente `platform/packages/persistence`, a implementação real em SQLite dos quatro Repository Interfaces já aprovados em `PURCHASE_HUB.md`/`@abp/purchase-hub` — nenhuma interface nova, nenhuma alteração contratual, nenhuma regra de negócio tocada. Nenhuma API HTTP, nenhum Frontend, nenhum Workspace foi criado. Nenhum arquivo de `packages/purchase-hub` (Core, IMP-301) foi alterado. O blueprint técnico utilizado integralmente foi `IMP_202_SUPPLIER_PERSISTENCE_REPORT.md`.

---

## 1. Auditoria Realizada (Passo 1, obrigatória antes de qualquer implementação)

Auditados: `packages/persistence/src/db/migrations/` (3 arquivos: `0000_init.sql`, `0001_iam.sql`, `0002_supplier_hub.sql`), todos os `Sqlite{Entity}Repository` existentes (20, cobrindo Business Profile, Branding, CRM, IAM, Supplier Hub), `db/client.ts`, `db/migrate.ts`, `db/config.ts`, `db/sqlUtil.ts`, `composition/createManagerRegistry.ts`, `testing/createTestDatabase.ts`.

**Existe algum padrão diferente do Supplier?** Não. `node:sqlite` nativo, `PRAGMA journal_mode = WAL` + `PRAGMA foreign_keys = ON` (`client.ts`, inalterado desde FUN-003), migrations `.sql` numeradas aplicadas por `runMigrations` dentro de uma transação única e registradas em `_migrations` (`migrate.ts`, inalterado), `createManagerRegistry(mode, handle)` como único ponto de alternância Fake/Real (inalterado em mecanismo, apenas estendido com um quinto par de Repositories). Nenhuma tecnologia nova, nenhum mecanismo novo.

**Existe alguma limitação nova?** Sim, uma: o Purchase Hub é o primeiro domínio desta plataforma cujos Value Objects internos de lista (`ReceivingLine`, `PurchaseRequisitionLine`) não possuem identificador próprio no Core — diferente de `SupplierContact` (Entidade, com `contactId`). Exige uma chave substituta (`INTEGER PRIMARY KEY AUTOINCREMENT`) nunca antes usada nesta plataforma para uma tabela filha — detalhado no Capítulo 4.

**Existe alguma oportunidade de reutilização?** Sim, duas, ambas documentadas no Capítulo 9 (Qualidade) e deliberadamente não executadas nesta Sprint: (1) o padrão "regravar lista filha por completo dentro da mesma transação" (`replaceContacts` em `SqliteSupplierRepository`, `replaceItems` em `SqlitePurchaseOrderRepository`) é agora duplicado entre dois Repositories, candidato a um helper genérico em `sqlUtil.ts`; (2) `Sqlite{Entity}Repository` como classe nunca abstraída em uma base genérica — considerado e descartado, mesma decisão já tomada implicitamente pela IMP-202 ao não introduzir generics.

---

## 2. Integração com `packages/persistence`

`package.json`: adicionada a dependência `@abp/purchase-hub`, posição alfabética correta (entre `@abp/platform-services` e `@abp/supplier-hub`). `tsconfig.json`: adicionada a referência `../purchase-hub`, mesma posição. `src/index.ts`: adicionados os quatro novos Repositories ao barrel — nenhuma reexportação de Fake, mesma disciplina de todo domínio anterior.

---

## 3. Schema Criado

Um novo arquivo de migration, `0003_purchase_hub.sql`, sete tabelas:

| Tabela | Repository Interface correspondente | Chave primária |
|---|---|---|
| `purchase_orders` | `PurchaseOrderRepository` | `purchase_order_id` |
| `purchase_order_items` | — (parte interna do Aggregate `PurchaseOrder`, sem Repository próprio) | `purchase_order_item_id` |
| `receivings` | `ReceivingRepository` | `receiving_id` |
| `receiving_lines` | — (parte interna da Entidade `Receiving`, sem Repository próprio) | `line_id` (substituta, ver Capítulo 4) |
| `purchase_requisitions` | `PurchaseRequisitionRepository` | `requisition_id` |
| `purchase_requisition_lines` | — (parte interna do Aggregate `PurchaseRequisition`, sem Repository próprio) | `line_id` (substituta, ver Capítulo 4) |
| `reorder_rules` | `ReorderRuleRepository` | `rule_id` |

Cada coluna espelha, sem reinterpretação, um campo já aprovado da Entity correspondente em `@abp/purchase-hub` — `Money` (`acquisitionCost`) é achatado em `acquisition_cost_amount`/`acquisition_cost_currency_code`, mesma disciplina já usada por `list_price_amount`/`list_price_currency_code` em `supplier_catalog_items` (IMP-202).

---

## 4. Índices e Constraints — decisões documentadas

**Índices**: um `CREATE INDEX` por coluna de busca frequente, mesmo critério de toda tabela existente (`idx_purchase_orders_tenant_id`, `idx_purchase_orders_supplier_id`, `idx_purchase_order_items_purchase_order_id`, `idx_receivings_purchase_order_id`, `idx_receiving_lines_receiving_id`, `idx_purchase_requisitions_tenant_id`, `idx_purchase_requisition_lines_requisition_id`, `idx_reorder_rules_tenant_id`, `idx_reorder_rules_product_id`).

**Nenhum `UNIQUE` composto.** Diferente de `suppliers` (`UNIQUE (tenant_id, tax_id_value)`, aplicando a regra "Duplicidade" do Core), `PurchaseValidator` (Core, IMP-301) não define nenhuma regra de unicidade — nenhuma constraint de banco foi inventada para compensar uma regra que a arquitetura aprovada nunca exigiu.

**`FOREIGN KEY` — sete no total, todas dentro da fronteira do Purchase Hub.** `purchase_order_items.purchase_order_id`, `receivings.purchase_order_id`, `receiving_lines.receiving_id`, `receiving_lines.purchase_order_item_id`, `purchase_requisition_lines.requisition_id` — cinco relações de contenção direta, mesmo critério de IMP-202. Duas adicionais, novas nesta plataforma: `purchase_orders.requisition_id` e `purchase_requisitions.purchase_order_id`, a **primeira referência cruzada entre dois Aggregate Roots distintos do mesmo Hub** já modelada aqui — ambas nullable, ambas com FOREIGN KEY real, porque o relacionamento é permanente e a tabela referenciada existe dentro do mesmo Hub (mesmo critério que já levou `supplier_catalog_items`/`supplier_contracts`/`supplier_performance_records` — cada um com Repository Interface própria — a declararem `REFERENCES suppliers`, per IMP-202, Capítulo 4). A ordem de escrita real, ditada pelo próprio Core (`PurchaseRequisitionService.convertToPurchaseOrder`: sempre `PurchaseOrderRepository.create` antes de `PurchaseRequisitionRepository.update`), garante que nenhuma das duas FOREIGN KEY jamais é violada em tempo de execução, apesar da referência mútua entre as tabelas — testado explicitamente (`SqliteRepositories.test.ts`, "a referência cruzada requisition↔purchaseOrder sobrevive em ambas as tabelas", e o teste negativo "rejeita um Purchase Order referenciando um requisition_id inexistente").

`reorder_rules` não declara nenhuma FOREIGN KEY — `product_id`/`preferred_supplier_id` são identificadores opacos de outros Hubs (Commerce Hub, Supplier Hub), mesma disciplina de `supplier_catalog_items.product_id` (IMP-202): nenhuma FOREIGN KEY cruza a fronteira de um Hub.

---

## 5. Migrations

`0003_purchase_hub.sql`, numerada em sequência após `0002_supplier_hub.sql`, aplicada pelo mesmo `runMigrations` já existente — idempotente por construção (`CREATE TABLE IF NOT EXISTS`/`CREATE INDEX IF NOT EXISTS`, mesmo padrão das três migrations anteriores). `db/migrate.test.ts` foi estendido com as sete novas tabelas em `EXPECTED_TABLES` e a contagem de `_migrations` aplicadas atualizada de 3 para 4 — testado que a migration nova não antecipa nenhuma tabela de outro domínio futuro (Inventory Movement Hub, Production Hub) e que reaplicar `runMigrations` continua idempotente. A query de verificação já excluía `sqlite_sequence` desde a criação do teste (FUN-003) — tabela automática do SQLite para qualquer `AUTOINCREMENT`, nunca antes exercitada nesta plataforma até `receiving_lines`/`purchase_requisition_lines` (Capítulo 4); nenhuma alteração foi necessária nessa exclusão, apenas seu primeiro uso real.

---

## 6. Transações e Atomicidade

`SqlitePurchaseOrderRepository.create`/`.update` envolvem duas tabelas (`purchase_orders`, `purchase_order_items`) em uma única transação explícita (`BEGIN`/`COMMIT`/`ROLLBACK`), exatamente o padrão de `SqliteSupplierRepository`/`supplier_contacts`. `SqliteReceivingRepository.create` envolve `receivings` + `receiving_lines` na mesma disciplina — sem `update` (Receiving é imutável, mesma decisão de `SqliteSupplierPerformanceRepository`/`append`). `SqlitePurchaseRequisitionRepository.create` envolve `purchase_requisitions` + `purchase_requisition_lines`; `.update` toca apenas `purchase_requisitions` (nunca `lines`, ver Capítulo 9) e por isso não precisa de transação explícita — um único `UPDATE` já é atômico por natureza do SQLite. `SqliteReorderRuleRepository` opera sobre uma única tabela, sem tabela filha — nenhuma transação explícita necessária.

Rollback testado explicitamente em três cenários reais, cada um injetando uma falha de constraint genuína e verificando, por consulta direta e crua ao SQLite, que nenhuma linha parcial permaneceu gravada:
- `SqlitePurchaseOrderRepository.create`/`.update`: dois `PurchaseOrderItem` com o mesmo `purchaseOrderItemId` (violação de chave primária de `purchase_order_items`) reverte também a escrita já feita em `purchase_orders`.
- `SqliteReceivingRepository.create`: uma `ReceivingLine` referenciando um `purchase_order_item_id` inexistente (violação de FOREIGN KEY) reverte a escrita já feita em `receivings`.
- `SqlitePurchaseRequisitionRepository.create`: uma segunda tentativa com `requisitionId` duplicado (violação de chave primária de `purchase_requisitions`) não deixa nenhuma linha extra gravada em `purchase_requisition_lines`.

---

## 7. Eventos

Nenhum arquivo desta Sprint importa, cria ou modifica `PurchaseEvent`/`PurchaseCommand` — per instrução explícita ("Persistência nunca poderá modificar os Events"). Cada `Sqlite{Entity}Repository` implementa apenas o contrato de leitura/escrita já definido pela Repository Interface; a produção de Evento continua exclusiva de `PurchaseManager` (Core, IMP-301), que nunca foi tocado.

---

## 8. Manager Registry

`ManagerRegistry` (interface) ganhou um sexto campo, `purchase: PurchaseManager`. `createManagerRegistry(mode, handle)` ganhou a mesma alternância `real`/`fake` já usada pelos cinco Managers anteriores — nenhuma lógica especial, nenhuma condicional além da já existente. `createManagerRegistry.test.ts` foi estendido: o teste "mode 'fake' constrói os Managers" passou a verificar `registry.purchase`, e um novo teste "mode 'real' — PurchaseManager" exercita `createPurchaseOrder → addPurchaseOrderItem → approvePurchaseOrder → sendPurchaseOrderToSupplier → registerReceiving` sobre SQLite real, confirmando que o Purchase Order transiciona corretamente até `Received` e que o dado sobrevive à consulta subsequente.

**Correção documental oportunista, dentro do mesmo bloco já tocado.** O comentário de `createManagerRegistry` descrevia o escopo como "Business Profile, Branding, CRM (FUN-003) e, desde a FUN-100, IAM Core — quatro domínios" — já desatualizado desde a IMP-202, que adicionou o Supplier Hub sem revisar essa contagem (uma pequena divergência documental pré-existente, não introduzida por esta Sprint). Corrigido nesta Sprint, ao tocar exatamente este bloco, para refletir os seis domínios reais (Business Profile, Branding, CRM, IAM, Supplier Hub, Purchase Hub) e a contagem correta de vinte e oito Repository Interfaces.

---

## 9. Decisões Tomadas / Qualidade — Comparação com Supplier Hub

**O padrão do Supplier foi seguido integralmente.** Mesma estrutura (`Sqlite{Entity}Repository` por Repository Interface, conversão row↔Entity via função `to{Entity}`/`hydrate`, `sqlUtil.ts` reutilizado sem alteração de assinatura existente, transação explícita apenas onde múltiplas tabelas são escritas juntas, `createTestDatabase()` reutilizado sem alteração), mesma disciplina de teste (CRUD completo, Constraints/FOREIGN KEY, Rollback, Persistência entre conexões, Migrations).

**`purchase_order_items`/`receiving_lines`/`purchase_requisition_lines` sem Repository Interface própria, geridas internamente.** Reflete exatamente a decisão já tomada no Core (IMP-301): todas são partes internas de um Aggregate — a camada de persistência preserva essa fronteira, nunca expondo um Repository separado, mesma disciplina de `supplier_contacts` (IMP-202).

**Chave substituta (`INTEGER PRIMARY KEY AUTOINCREMENT`) para `receiving_lines`/`purchase_requisition_lines` — decisão nova, sem precedente direto no Supplier Hub.** `ReceivingLine`/`PurchaseRequisitionLine` são Value Objects sem identificador no Core, diferente de `SupplierContact` (Entidade, `contactId` próprio). A chave substituta nunca é lida de volta para o domínio — existe apenas para satisfazer `PRIMARY KEY`, e nunca aparece em nenhum tipo de `@abp/purchase-hub`. É a primeira vez que esta plataforma usa `AUTOINCREMENT`; a query de teste de `migrate.test.ts` já excluía a tabela automática `sqlite_sequence` desde sua criação (FUN-003), então nenhuma alteração de infraestrutura de teste foi necessária, apenas seu primeiro uso genuíno.

**`toBoolInt`/`fromBoolInt`, primeira adição a `sqlUtil.ts` desde sua criação (FUN-003).** `ReorderRule.active` é o primeiro campo `boolean` persistido nesta plataforma — `node:sqlite` não possui tipo boolean nativo, armazenado como `INTEGER` (0/1), mesma convenção universal de todo driver SQLite. Duas funções de 1 linha cada, no mesmo arquivo e no mesmo estilo de `toMs`/`orNull`, nunca uma conversão paralela criada em outro lugar.

**Referência cruzada entre dois Aggregate Roots do mesmo Hub — sem precedente direto no Supplier Hub** (Capítulo 4). Testada explicitamente nos dois sentidos (positivo: sobrevive em ambas as tabelas; negativo: rejeitada quando a referência não existe).

**Duplicação real identificada, não executada nesta Sprint.** O padrão "regravar lista filha por completo dentro da mesma transação" (`delete` + loop de `insert`) aparece, agora, em duas classes com estrutura quase idêntica: `SqliteSupplierRepository.replaceContacts` (IMP-202) e `SqlitePurchaseOrderRepository.replaceItems` (esta Sprint). Um helper genérico `replaceChildRows(db, table, parentColumn, parentId, rows, insertColumns)` em `sqlUtil.ts` seria um candidato razoável para uma futura Sprint de consolidação — não implementado agora, per instrução explícita ("Não refatorar neste Sprint. Apenas documentar"), e porque uma terceira ocorrência real (Inventory Movement Hub ou Production Hub) tornaria o padrão de generalização mais óbvio do que extrapolar de apenas dois casos.

**Nenhuma classe base `SqliteRepository<T>` genérica foi introduzida.** Considerado e descartado — a mesma decisão implícita já tomada pela IMP-202 ao não abstrair, com a mesma justificativa: cada Repository tem forma de linha, colunas e regras de hidratação (`orUndefined`/`orNull`/`toMs`/`toBoolInt`) suficientemente distintas para que uma base genérica exigisse mais parâmetros de configuração do que economizaria em código.

---

## 10. Limitações Encontradas

Nenhum índice composto `(tenant_id, status)` em `purchase_orders`/`purchase_requisitions` — `findByStatus`/`findOpen` filtram por `tenant_id` (indexado) e avaliam `status` por varredura da linha, mesmo critério de simplicidade já aceito por IMP-202 para `supplier_catalog_items.product_id` sem `tenant_id` composto; candidato natural de otimização apenas se um volume real futuro justificar.

`purchase_order_items.product_id`/`purchase_requisition_lines.product_id`/`reorder_rules.product_id`/`reorder_rules.preferred_supplier_id` não são validados contra nenhuma tabela real (`Commerce Hub`, `Supplier Hub`) — por desenho, mesma disciplina de `supplier_catalog_items.product_id` (IMP-202): nenhuma FOREIGN KEY cruza a fronteira de um Hub, a responsabilidade de validação cross-hub pertence a uma orquestração futura, nunca a este Repository.

Um teste pré-existente e não relacionado a este Sprint, `apps/web/src/pages/suppliers/SupplierPage.test.tsx` ("Catálogo mostra o NotConnectedNotice de listagem"), falhou por timeout em uma das três execuções completas da suíte (falhou na 2ª, passou limpo na 1ª e na 3ª) — um `waitFor`/interação de usuário sensível a tempo sob concorrência de carga total da suíte, em um arquivo de `apps/web` nunca tocado por esta Sprint (Persistência não tem nenhuma dependência de Frontend). Mesma classe de flake intermitente já documentada desde IMP-202 (`routes.test.tsx`, não reproduzida desta vez) — sintoma do mesmo tipo de sensibilidade a tempo sob carga total, em um arquivo diferente. Documentado, não corrigido — fora do escopo desta Sprint.

---

## 11. Testes Criados

Um novo arquivo, `repositories/purchase/SqliteRepositories.test.ts`, 17 testes, cobrindo exatamente as categorias exigidas:

| Categoria | Teste(s) |
|---|---|
| CRUD completo | create/findById/update/findBySupplier/findByStatus/findOpen (`PurchaseOrder`), create/findByPurchaseOrder (`Receiving`), create/update/findByStatus (`PurchaseRequisition`), create/update/findActiveByProduct/findAllActive (`ReorderRule`) |
| Persistência entre conexões | Purchase Order + items sobrevivem ao fechar e reabrir uma nova conexão contra o mesmo arquivo `.sqlite3` |
| Rollback | `create`/`update` de Purchase Order revertidos quando um item duplicado viola PRIMARY KEY; `create` de Receiving revertido quando uma linha viola FOREIGN KEY; `create` de Requisition não deixa linha extra quando `requisitionId` duplicado viola PRIMARY KEY |
| Constraints/Foreign Keys | `purchase_order_items` órfão rejeitado; `receiving_lines` órfão (por `receiving_id`) rejeitado; `purchase_requisition_lines` órfão rejeitado; Purchase Order com `requisition_id` inexistente rejeitado (primeira FK entre dois Aggregate Roots do mesmo Hub) |
| Referência cruzada | conversão de Requisition em Purchase Order sobrevive em ambas as tabelas, nos dois sentidos |
| Boolean (novo) | `ReorderRule.active` como `INTEGER` 0/1, round-trip correto |
| Migrations | `db/migrate.test.ts` estendido — 7 novas tabelas, contagem de `_migrations` atualizada, idempotência preservada |

Mais dois testes estendidos em `composition/createManagerRegistry.test.ts` (contagem de Managers em modo fake; roundtrip completo do `PurchaseManager` sobre SQLite real, do `CreatePurchaseOrder` até `Received`). Nenhum mock usado para validar persistência, em nenhum teste — todos operam sobre `node:sqlite` real, `:memory:` ou arquivo temporário, per instrução explícita.

---

## 12. Cobertura Obtida

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados na raiz do monorepo três vezes. Typecheck, build e lint: verdes nas três execuções. Test: verde nas execuções 1 e 3 (172 arquivos, 783 testes); a execução 2 teve a falha intermitente pré-existente já documentada no Capítulo 10, sem nenhuma relação com o código desta Sprint — os 18 testes novos desta Sprint (17 de `SqliteRepositories.test.ts` + 1 de `createManagerRegistry.test.ts`) passaram nas três execuções, sem exceção.

---

## 13. Divergências Encontradas

Nenhuma divergência entre Arquitetura, Core, Persistência existente ou Documentação foi encontrada nesta Sprint que exigisse Amendment — os quatro Repository Interfaces de `PURCHASE_HUB.md`/`@abp/purchase-hub` (IMP-301) já estavam completos e estáveis, e o padrão de `packages/persistence` (FUN-003/FUN-100/IMP-202) já cobria integralmente todo caso necessário, exigindo apenas duas extensões mínimas e não conflitantes: (1) uma chave substituta para Value Objects de lista sem identificador próprio (Capítulo 4/9), e (2) duas funções de conversão boolean em `sqlUtil.ts` (Capítulo 9) — nenhuma das duas é uma mudança de padrão, ambas são a extensão natural do padrão já ativo ao seu primeiro caso de uso real, exatamente como a FOREIGN KEY foi para o Supplier Hub em IMP-202.

Uma divergência documental pré-existente e menor foi encontrada e corrigida (Capítulo 8): o comentário de `createManagerRegistry` estava desatualizado desde IMP-202.

---

## 14. Amendments Propostos

Nenhum. Esta Sprint não encontrou nenhum conflito entre documentos que exigisse Amendment — apenas extensões naturais de padrões já ativos a seus primeiros casos de uso genuínos.

---

## 15. Preparação para a Próxima Etapa (IMP-303 — API HTTP)

`ManagerRegistry.purchase` (`PurchaseManager`) está pronto para ser consumido por uma camada de API HTTP futura, seguindo exatamente o mesmo padrão já usado pelos cinco domínios anteriores (`apps/api`). Nenhuma mudança de contrato é esperada nessa transição — `PurchaseManager` já retorna `PurchaseOperationResult<T>` com `result`/`command`/`events` (e `PurchaseEvaluationResult<T>` para `evaluateReorderRule`, o único método que não corresponde a um Command aprovado), formato já compatível com serialização HTTP direta, mesma disciplina de todo Manager já implementado nesta plataforma. `mapDomainError` (`apps/api`, já existente desde IMP-203) precisará de um novo mapeamento equivalente para `PurchaseDomainError` — nenhuma reutilização do mapeamento de `SupplierDomainError`, mesma disciplina "Domain Errors nunca reutilizados entre Hubs" já aplicada no Core.

---

## 16. Conclusão

O Purchase Hub agora possui persistência real e completa em SQLite, atômica, com integridade referencial ativa — incluindo a primeira referência cruzada entre dois Aggregate Roots do mesmo Hub nesta plataforma —, testada sem mocks e sem alterar nenhuma linha do Core ou da arquitetura já aprovados. O ciclo Arquitetura → Core → Persistência está validado para o Purchase Hub, confirmando que o processo consolidado pelo Supplier Hub é totalmente reproduzível em um segundo domínio ERP, sem adaptações especiais e sem exceções — exatamente o Objetivo Estratégico desta Sprint. Pronto para a próxima etapa (IMP-303 — API HTTP), repetindo o mesmo ciclo já comprovado pelos módulos anteriores da plataforma.
