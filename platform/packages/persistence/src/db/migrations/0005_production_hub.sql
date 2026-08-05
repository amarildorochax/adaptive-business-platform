-- IMP-502 — Production Persistence.
-- As seis tabelas que sustentam as três Repository Interfaces do Production Hub Core (IMP-501,
-- `@abp/production-hub`) — BillOfMaterials, ProductionOrder, WorkCenter — per `PRODUCTION_HUB.md`,
-- Capítulo 4/5/9. Cada tabela espelha, campo a campo, a Entity já aprovada — nenhuma reinterpretação.
--
-- FOREIGN KEY: usada sempre que a tabela referenciada existe dentro deste mesmo Hub, nunca através da
-- fronteira de um Hub — mesma disciplina já aplicada por Supplier/Purchase/Inventory Movement
-- Persistence. `production_orders.bill_of_materials_id` referencia `bills_of_materials` (mesmo Hub,
-- Capítulo 4: "referencia exatamente uma Bill of Materials") e `production_orders.work_center_id`
-- referencia `work_centers` (mesmo Hub, Capability opcional, nullable). `bom_lines`↔`bills_of_materials`
-- e `production_consumptions`/`production_outputs`↔`production_orders` são relações
-- parte-interna-do-Aggregate, também FK dentro do mesmo Hub. Por outro lado, `output_product_id`
-- (bills_of_materials), `input_product_id`/`variant_id` (bom_lines), `input_product_id`
-- (production_consumptions), `output_product_id` (production_outputs) e `order_id`
-- (production_orders) são todos identificadores opacos de outros Hubs (Commerce Hub, respectivamente)
-- — nenhuma FOREIGN KEY declarada para eles, mesma disciplina de `reorder_rules.product_id` (IMP-302)
-- e `stock_movements.product_id` (IMP-402).
--
-- SEM TRIGGER: `ProductionOrder` é uma máquina de estados (Planned/InProgress/Completed/Cancelled),
-- não um ledger append-only como `stock_movements` — `ProductionOrderRepository` (Core, congelado
-- nesta Sprint) expõe `save`, nunca só `append`. Nenhum trigger de imutabilidade é necessário aqui.
--
-- SEM CHECK: toda validação de negócio (quantidade positiva, custo não negativo, nome não vazio, etc.)
-- já vive em `ProductionValidator`/`isValidBOMLine`/`isValidProductionConsumption`/
-- `isValidProductionOutput` (Core, congelado) — Persistence nunca reimplementa regra de negócio,
-- apenas restrição estrutural (NOT NULL, FOREIGN KEY, PRIMARY KEY).
--
-- SEM UNIQUE em `bills_of_materials`: diferente de `suppliers.UNIQUE (tenant_id, tax_id_value)`
-- (tradução literal de uma regra explícita de `SUPPLIER_HUB.md`, Capítulo 11 — "TaxId único por
-- Tenant"), `PRODUCTION_HUB.md` nunca declara textualmente "apenas uma BillOfMaterials Active por
-- Produto" como regra nomeada — é uma consequência do uso correto de `BillOfMaterialsService.supersede`
-- (Core), nunca uma invariante independente com nome próprio. Nenhuma UNIQUE foi adicionada para não
-- inventar uma restrição de negócio não escrita — decisão documentada em
-- `IMP_502_PRODUCTION_PERSISTENCE_REPORT.md`, Seção "Decisões Tomadas".
--
-- QUANTIDADES COMO REAL, NÃO INTEGER: diferente de `purchase_order_items.quantity_ordered`
-- (INTEGER — insumos de Purchase Hub são sempre contáveis por unidade inteira), toda quantidade deste
-- Hub (`planned_output_quantity`, `quantity_per_output_unit`, `quantity_consumed`,
-- `quantity_generated`) é `REAL` — `UnitOfMeasure` (Core) inclui `Kilogram`/`Liter`/`Meter`, unidades
-- de medida fracionárias são dado de negócio legítimo, nunca arredondadas ou truncadas por esta
-- Sprint (Core já valida apenas "positivo e finito", nunca "inteiro").
--
-- `production_consumptions`/`production_outputs` usam PRIMARY KEY natural (`consumption_id`/
-- `output_id`, TEXT) — diferente de `bom_lines` (`line_id INTEGER PRIMARY KEY AUTOINCREMENT`), porque
-- `ProductionConsumption`/`ProductionOutput` têm identificador próprio no Core (`consumptionId`/
-- `outputId`, `PRODUCTION_HUB.md`, Capítulo 5) — mesmo critério já usado para distinguir
-- `supplier_contacts.contact_id` (natural) de `receiving_lines.line_id`/
-- `purchase_requisition_lines.line_id` (AUTOINCREMENT, Value Object sem identificador próprio no Core).

CREATE TABLE IF NOT EXISTS bills_of_materials (
  bill_of_materials_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  output_product_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  superseded_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_bills_of_materials_tenant_id ON bills_of_materials (tenant_id);
CREATE INDEX IF NOT EXISTS idx_bills_of_materials_output_product_status ON bills_of_materials (output_product_id, status);

CREATE TABLE IF NOT EXISTS bom_lines (
  line_id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_of_materials_id TEXT NOT NULL REFERENCES bills_of_materials (bill_of_materials_id),
  input_product_id TEXT NOT NULL,
  variant_id TEXT,
  quantity_per_output_unit REAL NOT NULL,
  unit_of_measure TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bom_lines_bill_of_materials_id ON bom_lines (bill_of_materials_id);

CREATE TABLE IF NOT EXISTS work_centers (
  work_center_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  nominal_capacity REAL,
  active INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_work_centers_active ON work_centers (active);
CREATE INDEX IF NOT EXISTS idx_work_centers_tenant_id ON work_centers (tenant_id);

CREATE TABLE IF NOT EXISTS production_orders (
  production_order_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  bill_of_materials_id TEXT NOT NULL REFERENCES bills_of_materials (bill_of_materials_id),
  planned_output_quantity REAL NOT NULL,
  status TEXT NOT NULL,
  work_center_id TEXT REFERENCES work_centers (work_center_id),
  order_id TEXT,
  cancel_reason TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_production_orders_tenant_id ON production_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders (status);
CREATE INDEX IF NOT EXISTS idx_production_orders_order_id ON production_orders (order_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_bill_of_materials_id ON production_orders (bill_of_materials_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_work_center_id ON production_orders (work_center_id);

CREATE TABLE IF NOT EXISTS production_consumptions (
  consumption_id TEXT PRIMARY KEY,
  production_order_id TEXT NOT NULL REFERENCES production_orders (production_order_id),
  input_product_id TEXT NOT NULL,
  quantity_consumed REAL NOT NULL,
  acquisition_cost REAL NOT NULL,
  consumed_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_production_consumptions_production_order_id ON production_consumptions (production_order_id);

CREATE TABLE IF NOT EXISTS production_outputs (
  output_id TEXT PRIMARY KEY,
  production_order_id TEXT NOT NULL REFERENCES production_orders (production_order_id),
  output_product_id TEXT NOT NULL,
  quantity_generated REAL NOT NULL,
  generated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_production_outputs_production_order_id ON production_outputs (production_order_id);
