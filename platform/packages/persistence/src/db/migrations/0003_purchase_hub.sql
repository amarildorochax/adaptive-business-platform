-- IMP-302 — Purchase Persistence.
-- As sete tabelas que sustentam os quatro Repository Interfaces do Purchase Hub Core (IMP-301,
-- `@abp/purchase-hub`) — PurchaseOrder, Receiving, PurchaseRequisition, ReorderRule — mais três
-- tabelas filhas sem Repository Interface próprio: `purchase_order_items` (parte interna do
-- Aggregate `PurchaseOrder`), `receiving_lines` (parte interna da Entidade `Receiving`) e
-- `purchase_requisition_lines` (parte interna do Aggregate `PurchaseRequisition`) — per
-- `PURCHASE_HUB.md`, Capítulo 4. Cada tabela espelha, campo a campo, a Entity já aprovada — nenhuma
-- reinterpretação.
--
-- `receiving_lines`/`purchase_requisition_lines` usam `INTEGER PRIMARY KEY AUTOINCREMENT` como
-- chave substituta — `ReceivingLine`/`PurchaseRequisitionLine` são Value Objects sem identificador
-- próprio no Core (`ReceivingLine.ts`/`PurchaseRequisition.ts`), diferente de `SupplierContact`
-- (Entidade, com `contactId` próprio, IMP-202). Decisão registrada em
-- `IMP_302_PURCHASE_PERSISTENCE_REPORT.md`, Capítulo 4 — a chave nunca é lida de volta para o
-- domínio, existe apenas para satisfazer a exigência de `PRIMARY KEY` desta camada.
--
-- `purchase_orders.requisition_id` e `purchase_requisitions.purchase_order_id` são a primeira
-- referência cruzada entre dois Aggregate Roots distintos do mesmo Hub nesta plataforma — ambas
-- nullable, ambas com FOREIGN KEY real (o relacionamento é permanente e pertence inteiramente ao
-- Purchase Hub, mesmo critério já usado pelo Supplier Hub para tabelas com Repository Interface
-- própria, per IMP-202, Capítulo 4: "cada uma declara FOREIGN KEY sempre que a tabela referenciada
-- existe dentro do mesmo Hub"). A ordem de escrita (`PurchaseOrderRepository.create` sempre depois
-- de `PurchaseRequisitionRepository.create`, `PurchaseRequisitionRepository.update` sempre depois
-- de `PurchaseOrderRepository.create` — ver `PurchaseRequisitionService.convertToPurchaseOrder`,
-- Core) garante que nenhuma FOREIGN KEY jamais é violada em tempo de execução, apesar da referência
-- mútua entre as duas tabelas.
--
-- `reorder_rules` não declara nenhuma FOREIGN KEY — `product_id`/`preferred_supplier_id` são
-- identificadores opacos de outros Hubs (Commerce Hub, Supplier Hub), mesma disciplina já aplicada a
-- `supplier_catalog_items.product_id` (IMP-202): nenhuma FOREIGN KEY cruza a fronteira de um Hub.

CREATE TABLE IF NOT EXISTS purchase_orders (
  purchase_order_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  requisition_id TEXT REFERENCES purchase_requisitions (requisition_id),
  status TEXT NOT NULL,
  approved_by_identity_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_id ON purchase_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders (supplier_id);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  purchase_order_item_id TEXT PRIMARY KEY,
  purchase_order_id TEXT NOT NULL REFERENCES purchase_orders (purchase_order_id),
  product_id TEXT NOT NULL,
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL,
  acquisition_cost_amount REAL NOT NULL,
  acquisition_cost_currency_code TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items (purchase_order_id);

CREATE TABLE IF NOT EXISTS receivings (
  receiving_id TEXT PRIMARY KEY,
  purchase_order_id TEXT NOT NULL REFERENCES purchase_orders (purchase_order_id),
  tenant_id TEXT NOT NULL,
  received_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_receivings_purchase_order_id ON receivings (purchase_order_id);

CREATE TABLE IF NOT EXISTS receiving_lines (
  line_id INTEGER PRIMARY KEY AUTOINCREMENT,
  receiving_id TEXT NOT NULL REFERENCES receivings (receiving_id),
  purchase_order_item_id TEXT NOT NULL REFERENCES purchase_order_items (purchase_order_item_id),
  quantity_received INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_receiving_lines_receiving_id ON receiving_lines (receiving_id);

CREATE TABLE IF NOT EXISTS purchase_requisitions (
  requisition_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  origin TEXT NOT NULL,
  status TEXT NOT NULL,
  purchase_order_id TEXT REFERENCES purchase_orders (purchase_order_id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_purchase_requisitions_tenant_id ON purchase_requisitions (tenant_id);

CREATE TABLE IF NOT EXISTS purchase_requisition_lines (
  line_id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisition_id TEXT NOT NULL REFERENCES purchase_requisitions (requisition_id),
  product_id TEXT NOT NULL,
  suggested_quantity INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_purchase_requisition_lines_requisition_id ON purchase_requisition_lines (requisition_id);

CREATE TABLE IF NOT EXISTS reorder_rules (
  rule_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  threshold_quantity INTEGER NOT NULL,
  reorder_quantity INTEGER NOT NULL,
  preferred_supplier_id TEXT,
  active INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reorder_rules_tenant_id ON reorder_rules (tenant_id);
CREATE INDEX IF NOT EXISTS idx_reorder_rules_product_id ON reorder_rules (product_id);
