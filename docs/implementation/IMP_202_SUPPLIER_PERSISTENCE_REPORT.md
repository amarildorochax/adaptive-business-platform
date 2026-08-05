# IMP-202 — Supplier Persistence — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-202 — Supplier Persistence**, a segunda etapa da implementação do Supplier Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-201). Ela adiciona, exclusivamente ao pacote já existente `platform/packages/persistence`, a implementação real em SQLite dos quatro Repository Interfaces já aprovados em `SUPPLIER_HUB.md`/`@abp/supplier-hub` — nenhuma interface nova, nenhuma alteração contratual, nenhuma regra de negócio tocada. Nenhuma API HTTP, nenhum Frontend, nenhum Workspace foi criado. Nenhum arquivo de `packages/supplier-hub` (Core, IMP-201) foi alterado.

---

## 1. Arquitetura Utilizada

Seguido, campo a campo, o padrão já estabelecido por `packages/persistence` para Business Profile, Branding e CRM (FUN-003) e estendido pela IAM Core (FUN-100):

- **Conexão**: `node:sqlite` nativo (`db/client.ts`, já existente) — nenhuma alteração.
- **Migrations**: um arquivo `.sql` numerado, aplicado por `runMigrations` (`db/migrate.ts`, já existente) dentro de uma transação única, registrado em `_migrations` — nenhuma alteração ao mecanismo, apenas um novo arquivo, `0002_supplier_hub.sql`.
- **Repositórios**: uma classe `Sqlite{Entity}Repository` por Repository Interface, implementando-a diretamente, com uma função `to{Entity}`/`hydrate` de conversão row↔Entity, mesmo padrão de `SqliteCustomerRepository`/`SqliteOrganizationRepository` (CRM Hub).
- **Conversão de tipo**: `toMs`/`fromMs`/`toMsOrNull`/`fromMsOrUndefined`/`orNull`/`orUndefined` de `db/sqlUtil.ts` — reutilizados sem nenhuma alteração, nenhuma conversão paralela criada.
- **Composição**: `createManagerRegistry` (`composition/createManagerRegistry.ts`, já existente) estendido com um quinto Manager (`supplier: SupplierManager`), seguindo exatamente a mesma alternância `mode === "real" ? new Sqlite...Repository(handle!.db) : new Fake...Repository()` já usada pelos quatro Managers anteriores — nenhuma condicional nova, nenhum padrão novo.
- **Teste**: `createTestDatabase()` (`testing/createTestDatabase.ts`, já existente) — banco `:memory:` migrado, reutilizado sem alteração.

---

## 2. Integração com `packages/persistence`

`package.json`: adicionada a dependência `@abp/supplier-hub`, mesma posição alfabética das demais. `tsconfig.json`: adicionada a referência `../supplier-hub`. `src/index.ts`: adicionados os quatro novos Repositories ao barrel — nenhuma reexportação de Fake (mesma disciplina já aplicada aos quatro domínios anteriores: Fakes nunca saem de seu próprio pacote de domínio).

---

## 3. Schema Criado

Um novo arquivo de migration, `0002_supplier_hub.sql`, cinco tabelas:

| Tabela | Repository Interface correspondente | Chave primária |
|---|---|---|
| `suppliers` | `SupplierRepository` | `supplier_id` |
| `supplier_contacts` | — (parte interna do Aggregate `Supplier`, sem Repository próprio) | `contact_id` |
| `supplier_catalog_items` | `SupplierCatalogItemRepository` | `catalog_item_id` |
| `supplier_contracts` | `SupplierContractRepository` | `contract_id` |
| `supplier_performance_records` | `SupplierPerformanceRepository` | `record_id` |

Cada coluna espelha, sem reinterpretação, um campo já aprovado da Entity correspondente em `@abp/supplier-hub` — `Money`/`PaymentTerms` (Value Objects embutidos) são achatados em colunas próprias (`list_price_amount`/`list_price_currency_code`, `payment_terms_due_in_days`), mesma disciplina já usada por toda tabela existente desta plataforma para Value Object embutido.

---

## 4. Índices e Constraints — decisões documentadas

**Índices**: um `CREATE INDEX` por coluna de busca frequente, mesmo critério já aplicado a toda tabela existente (`idx_suppliers_tenant_id`, `idx_supplier_contacts_supplier_id`, `idx_supplier_catalog_items_supplier_id`, `idx_supplier_catalog_items_product_id`, `idx_supplier_contracts_supplier_id`, `idx_supplier_performance_records_supplier_id`).

**`UNIQUE (tenant_id, tax_id_value)` em `suppliers`** — aplica, como defesa em profundidade na própria camada de dado, a regra "Duplicidade" já validada em `SupplierValidator.ensureNoDuplicateTaxId` (Core, IMP-201). Nenhuma das duas camadas substitui a outra — a aplicação continua confiando na validação de domínio para a mensagem de erro correta (`DuplicateSupplierTaxIdError`); a constraint de banco existe para o caso em que dois processos concorrentes tentem a mesma escrita entre a checagem e a gravação (condição de corrida que a validação em memória, isolada, não cobre).

**`FOREIGN KEY` — a primeira desta plataforma.** `0000_init.sql` (Business Profile/Branding/CRM) e `0001_iam.sql` (IAM) não declaram nenhuma `FOREIGN KEY`, embora `PRAGMA foreign_keys = ON` já esteja ativo desde `client.ts` (FUN-003) — nenhum dos quatro domínios anteriores modelou uma tabela genuinamente filha e interna a um único Aggregate. O Supplier Hub é o primeiro a fazê-lo: `supplier_contacts`, `supplier_catalog_items`, `supplier_contracts` e `supplier_performance_records` são todas internas ao Aggregate `Supplier`, nunca referenciadas por nenhum outro Hub. Por isso, cada uma declara `supplier_id TEXT NOT NULL REFERENCES suppliers (supplier_id)`. Isto **não é um padrão novo** — é a primeira vez que o padrão já ativo (`PRAGMA foreign_keys = ON`, presente desde a primeira Sprint de persistência) encontra um caso de uso genuíno. Testado explicitmente (`SqliteRepositories.test.ts`, "rejeita um supplier_contacts referenciando um supplier_id inexistente").

---

## 5. Migrations

`0002_supplier_hub.sql`, numerada em sequência após `0001_iam.sql`, aplicada pelo mesmo `runMigrations` já existente — idempotente e reexecutável por construção (nenhuma alteração ao mecanismo, apenas `CREATE TABLE IF NOT EXISTS`/`CREATE INDEX IF NOT EXISTS`, mesmo padrão já usado pelas duas migrations anteriores). `db/migrate.test.ts` foi estendido com as cinco novas tabelas na lista `EXPECTED_TABLES` e a contagem de `_migrations` aplicadas atualizada de 2 para 3 — testado que a migration nova não antecipa nenhuma tabela de outro domínio futuro (Purchase Hub, Inventory Movement Hub) e que reaplicar `runMigrations` continua idempotente.

---

## 6. Transações e Atomicidade

`SqliteSupplierRepository.create`/`.update` envolvem duas tabelas (`suppliers` e `supplier_contacts`) em uma única transação explícita (`BEGIN`/`COMMIT`/`ROLLBACK`, mesmo padrão já usado por `db/migrate.ts`) — uma falha em qualquer um dos `INSERT` (por exemplo, dois `SupplierContact` com o mesmo `contactId`, violando a chave primária de `supplier_contacts`) reverte também a escrita já feita em `suppliers` na mesma chamada, nunca deixando as duas tabelas divergentes. Testado explicitamente em dois cenários (`create` e `update`) que injetam uma falha real de constraint e verificam, por consulta direta e crua ao SQLite, que nenhuma linha parcial permaneceu gravada.

Os demais três Repositories (`SqliteSupplierCatalogItemRepository`, `SqliteSupplierContractRepository`, `SqliteSupplierPerformanceRepository`) operam sobre uma única tabela cada — cada `INSERT`/`UPDATE` já é atômico por natureza do próprio SQLite, sem necessidade de transação explícita adicional.

---

## 7. Eventos

Nenhum arquivo desta Sprint importa, cria ou modifica `SupplierEvent`/`SupplierCommand` — per instrução explícita ("Persistência nunca poderá modificar os Events"). Cada `Sqlite{Entity}Repository` implementa apenas o contrato de leitura/escrita já definido pela Repository Interface; a produção de Evento continua exclusiva de `SupplierManager` (Core, IMP-201), que nunca foi tocado.

---

## 8. Manager Registry

`ManagerRegistry` (interface) ganhou um quinto campo, `supplier: SupplierManager`. `createManagerRegistry(mode, handle)` ganhou a mesma alternância `real`/`fake` já usada pelos quatro Managers anteriores — nenhuma lógica especial, nenhuma condicional além da já existente. `createManagerRegistry.test.ts` foi estendido: o teste "mode 'fake' constrói os Managers" passou a verificar `registry.supplier`, e um novo teste "mode 'real' — SupplierManager" exercita `registerSupplier → addSupplierContact → registerSupplierCatalogItem → createSupplierContract → recordSupplierPerformance` sobre SQLite real, confirmando que o dado sobrevive à consulta subsequente.

---

## 9. Decisões Tomadas

**`supplier_contacts` sem Repository Interface própria, gerida internamente por `SqliteSupplierRepository`.** Reflete exatamente a decisão já tomada no Core (IMP-201): `SupplierContact` é parte interna do Aggregate `Supplier`, nunca uma Entidade independente — a camada de persistência preserva essa fronteira, nunca expondo um `SqliteSupplierContactRepository` separado.

**`Money`/`PaymentTerms` achatados em colunas, nunca serializados como JSON.** Mesma disciplina já aplicada a todo Value Object embutido nesta plataforma (nenhuma tabela existente usa uma coluna JSON) — preserva capacidade de indexar/consultar por `list_price_amount`, por exemplo, se uma Sprint futura precisar.

**UNIQUE composta em vez de índice simples.** `UNIQUE (tenant_id, tax_id_value)` é a tradução direta e literal da regra de negócio "único por Tenant" (`SUPPLIER_HUB.md`, Capítulo 11) — um `UNIQUE` isolado em `tax_id_value` teria proibido, incorretamente, o mesmo Fornecedor real (mesmo CNPJ) de se cadastrar em duas Empresas diferentes do mesmo Tenant de infraestrutura, violando `SAAS_ARCHITECTURE.md`, Capítulo 6 (Tenant Isolation).

---

## 10. Limitações Encontradas

`SqliteSupplierCatalogItemRepository.findByProduct` faz table scan sobre `product_id` (indexado, mas sem filtro de `tenant_id` no próprio índice) — aceitável no volume desta Sprint; se o Purchase Hub futuro precisar consultar por Produto em escala, um índice composto `(product_id, tenant_id)` é candidato natural, não implementado agora por ausência de caso de uso real ainda.

Um teste pré-existente e não relacionado a este Sprint, `apps/web/src/app/router/routes.test.tsx` ("renderiza o Dashboard na rota raiz"), falhou de forma intermitente em uma das três execuções completas da suíte (falhou na 1ª, passou limpo na 2ª e na 3ª) — um `waitFor` sensível a tempo sob concorrência de carga total da suíte, em um arquivo de `apps/web` nunca tocado por esta Sprint (Persistência não tem nenhuma dependência de Frontend). Documentado, não corrigido — fora do escopo desta Sprint ("Não alterar... Runtime").

---

## 11. Testes Criados

Um novo arquivo, `repositories/supplier/SqliteRepositories.test.ts`, 13 testes, cobrindo exatamente as categorias exigidas:

| Categoria | Teste(s) |
|---|---|
| CRUD completo | create/findById/findByTaxId/update/findActive, para os quatro Repositories |
| Persistência entre conexões | Supplier + contacts sobrevivem ao fechar e reabrir uma nova conexão contra o mesmo arquivo `.sqlite3` |
| Rollback | `create` e `update` revertidos por completo quando a inserção de um contact falha na mesma transação |
| Constraints | `FOREIGN KEY` rejeita `supplier_contacts` órfão |
| Duplicidade | `UNIQUE (tenant_id, tax_id_value)` rejeita duplicata no mesmo Tenant, aceita no Tenant diferente |
| Performance básica | 200 Suppliers criados e listados em menos de 5 segundos |
| Migrations | `db/migrate.test.ts` estendido — 5 novas tabelas, contagem de `_migrations` atualizada, idempotência preservada |

Mais dois testes estendidos em `composition/createManagerRegistry.test.ts` (contagem de Managers em modo fake; roundtrip completo do `SupplierManager` sobre SQLite real). Nenhum mock usado para validar persistência, em nenhum teste — todos operam sobre `node:sqlite` real, `:memory:` ou arquivo temporário, per instrução explícita.

---

## 12. Cobertura Obtida

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados na raiz do monorepo **três vezes** (duas exigidas pelo Sprint, uma terceira para confirmar a natureza intermitente e pré-existente da única falha observada). Typecheck, build e lint: verdes nas três execuções. Test: verde nas execuções 2 e 3 (155 arquivos, 614 testes); a execução 1 teve a falha intermitente pré-existente já documentada no Capítulo 10, sem nenhuma relação com o código desta Sprint.

---

## 13. Divergências Encontradas

Nenhuma divergência entre Arquitetura, Core, Persistência existente ou Documentação foi encontrada nesta Sprint — os quatro Repository Interfaces de `SUPPLIER_HUB.md`/`@abp/supplier-hub` (IMP-201) já estavam completos e estáveis, e o padrão de `packages/persistence` (FUN-003/FUN-100) já cobria integralmente todo caso necessário, exigindo apenas sua primeira aplicação real a uma FOREIGN KEY (Capítulo 4), não uma mudança de padrão.

---

## 14. Amendments Propostos

Nenhum. Esta Sprint não encontrou nenhum conflito entre documentos que exigisse Amendment — apenas a extensão natural de um padrão já ativo (PRAGMA `foreign_keys`) a seu primeiro caso de uso genuíno.

---

## 15. Preparação para a Próxima Etapa (API)

Os cinco Managers de `ManagerRegistry` — incluindo `supplier`, agora — estão prontos para serem consumidos por uma camada de API HTTP futura, seguindo o mesmo padrão já usado pelos quatro domínios anteriores (`apps/api`). Nenhuma mudança de contrato é esperada nessa transição — `SupplierManager` já retorna `SupplierOperationResult<T>` com `result`/`command`/`events`, formato já compatível com serialização HTTP direta, mesma disciplina de toda Manager já implementada nesta plataforma.

---

## 16. Conclusão

O Supplier Hub agora possui persistência real e completa em SQLite, atômica, com constraint de duplicidade e integridade referencial ativas, testada sem mocks e sem alterar nenhuma linha do Core ou da arquitetura já aprovados. O ciclo Arquitetura → Core → Persistência está validado para o Supplier Hub, exatamente como o Objetivo Estratégico desta Sprint exigia — pronto para a próxima etapa (API), repetindo o mesmo ciclo já comprovado pelos módulos anteriores da plataforma.
