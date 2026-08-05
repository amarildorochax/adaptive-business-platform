-- IMP-202 — Supplier Persistence.
-- As cinco tabelas que sustentam as quatro Repository Interfaces do Supplier Hub Core (IMP-201,
-- `@abp/supplier-hub`) — Supplier, SupplierCatalogItem, SupplierContract, SupplierPerformanceRecord
-- — mais `supplier_contacts`, tabela filha sem Repository Interface própria (SupplierContact é
-- parte interna do Aggregate `Supplier`, nunca uma Entidade referenciada por identificador fora
-- dele, per `SUPPLIER_HUB.md`, Capítulo 4). Cada tabela espelha, campo a campo, a Entity já
-- aprovada — nenhuma reinterpretação.
--
-- Esta é a primeira migration desta plataforma a declarar FOREIGN KEY explícita. `0000_init.sql` e
-- `0001_iam.sql` não usam nenhuma, embora `PRAGMA foreign_keys = ON` já esteja ativo desde
-- `client.ts` (FUN-003) — nenhum dos domínios anteriores modelou uma tabela filha genuinamente
-- interna a um único Aggregate (supplier_contacts, supplier_catalog_items, supplier_contracts e
-- supplier_performance_records são todas internas ao Aggregate `Supplier`, nunca referenciadas por
-- nenhum outro Hub). Decisão registrada em `IMP_202_SUPPLIER_PERSISTENCE_REPORT.md`, Capítulo 4 —
-- não é um padrão novo, é a primeira vez que o padrão já ativo (PRAGMA) encontra um caso genuíno de
-- uso.
--
-- `UNIQUE (tenant_id, tax_id_value)` em `suppliers` aplica a regra "Duplicidade"
-- (`SUPPLIER_HUB.md`, Capítulo 11: "Todo Supplier é identificado de forma única por TaxId dentro do
-- Tenant") como defesa em profundidade na própria camada de dado, além da validação já existente em
-- `SupplierValidator.ensureNoDuplicateTaxId` (Core, IMP-201) — nenhuma das duas substitui a outra.

CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  tax_id_value TEXT NOT NULL,
  status TEXT NOT NULL,
  supply_category TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (tenant_id, tax_id_value)
);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_id ON suppliers (tenant_id);

CREATE TABLE IF NOT EXISTS supplier_contacts (
  contact_id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers (supplier_id),
  name TEXT NOT NULL,
  channel_id TEXT,
  role TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier_id ON supplier_contacts (supplier_id);

CREATE TABLE IF NOT EXISTS supplier_catalog_items (
  catalog_item_id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers (supplier_id),
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  list_price_amount REAL NOT NULL,
  list_price_currency_code TEXT NOT NULL,
  lead_time_in_days INTEGER NOT NULL,
  minimum_order_quantity INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_supplier_catalog_items_supplier_id ON supplier_catalog_items (supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_catalog_items_product_id ON supplier_catalog_items (product_id);

CREATE TABLE IF NOT EXISTS supplier_contracts (
  contract_id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers (supplier_id),
  tenant_id TEXT NOT NULL,
  starts_at INTEGER NOT NULL,
  ends_at INTEGER,
  payment_terms_due_in_days INTEGER NOT NULL,
  minimum_volume INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_supplier_contracts_supplier_id ON supplier_contracts (supplier_id);

CREATE TABLE IF NOT EXISTS supplier_performance_records (
  record_id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers (supplier_id),
  tenant_id TEXT NOT NULL,
  purchase_order_id TEXT NOT NULL,
  observation_type TEXT NOT NULL,
  observed_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_supplier_performance_records_supplier_id ON supplier_performance_records (supplier_id);
