-- IMP-402 — Inventory Movement Persistence.
-- As cinco tabelas que sustentam os cinco Repository Interfaces do Inventory Movement Hub Core
-- (IMP-401, `@abp/inventory-movement-hub`) — StockMovement, StockPosition, StockReservation,
-- StockLocation, StockAlertRule — per `INVENTORY_MOVEMENT_HUB.md`, Capítulo 4/5. Cada tabela espelha,
-- campo a campo, a Entity já aprovada — nenhuma reinterpretação.
--
-- NENHUMA FOREIGN KEY entre as cinco tabelas deste Hub — divergência real em relação ao Purchase Hub
-- (IMP-302, primeira FK cross-Aggregate-Root da plataforma), documentada em
-- `IMP_402_INVENTORY_MOVEMENT_PERSISTENCE_REPORT.md`: diferente de `purchase_orders`↔
-- `purchase_requisitions` (dois Aggregate Roots que se referenciam mutuamente por desenho), os cinco
-- Aggregates deste Hub são estruturalmente independentes entre si — nenhum "contém" nem é referenciado
-- pelo id de outro; toda relação entre eles (mesmo `product_id`/`location_id`) é por valor
-- correlacionado, nunca por chave estrangeira. `product_id`/`variant_id`/`location_id`/
-- `origin_reference_id`/`order_id` são todos identificadores opacos de outros Hubs (Commerce Hub,
-- Purchase Hub, Production Hub) — mesma disciplina já aplicada a `reorder_rules.product_id` (IMP-302):
-- nenhuma FOREIGN KEY cruza a fronteira de um Hub.
--
-- APPEND-ONLY: `stock_movements` é a característica central deste domínio — cada linha é um fato
-- físico imutável (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 4/11: "nunca é editado ou removido após
-- criação"). `StockMovementRepository` (Core, congelado nesta Sprint) já reforça isso no próprio
-- contrato — apenas `append`, nunca `update`/`delete`. Esta migration reforça a mesma garantia um
-- nível abaixo, direto no banco: dois triggers rejeitam qualquer UPDATE/DELETE em `stock_movements`,
-- mesmo um executado fora deste Repository (SQL direto, uma migration futura mal escrita, etc.) —
-- defesa em profundidade, primeira vez que esta plataforma usa TRIGGER, decisão documentada em
-- `IMP_402_INVENTORY_MOVEMENT_PERSISTENCE_REPORT.md`, Seção "Append-Only".
--
-- `stock_positions` é a projeção derivada (`StockPosition`, Core) — cache de leitura recalculado por
-- `SqliteStockPositionRepository.recalculate` a partir de `SUM(quantity_delta)` sobre
-- `stock_movements` e `SUM(quantity)` sobre `stock_reservations` ativas, nunca escrito por nenhum
-- outro caminho. `position_key` (`product_id || '::' || COALESCE(location_id, '')`, computado em
-- TypeScript, nunca em SQL) é a chave primária substituta — evita a ambiguidade de `PRIMARY KEY`
-- composta com coluna nullable (`location_id`) que o SQLite não garante como verdadeiramente única.
-- Nenhuma coluna `variant_id` existe em `stock_positions` — `StockPositionRepository.findByProduct`/
-- `recalculate` (Core, congelado nesta Sprint) não recebem `variantId` como parâmetro, então a soma é
-- necessariamente sobre todos os variants de um Produto/Localização combinados; incluir uma coluna
-- `variant_id` sempre nula sugeriria uma granularidade que esta Sprint não pode entregar — omitida
-- deliberadamente, documentada como limitação herdada do Core em
-- `IMP_402_INVENTORY_MOVEMENT_PERSISTENCE_REPORT.md`.
--
-- `stock_locations.address_line` achata `StockLocationAddress` (`{line: string}`, Core) — único campo
-- do Value Object, mesmo critério de achatamento já aplicado a Value Objects de campo único em toda a
-- série (`TaxId` → `tax_id`, IMP-202).

CREATE TABLE IF NOT EXISTS stock_movements (
  movement_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  location_id TEXT,
  quantity_delta INTEGER NOT NULL,
  origin TEXT NOT NULL,
  origin_reference_id TEXT,
  occurred_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_location ON stock_movements (product_id, location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_origin_reference_id ON stock_movements (origin_reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON stock_movements (tenant_id);

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

CREATE TABLE IF NOT EXISTS stock_positions (
  position_key TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  location_id TEXT,
  quantity_on_hand INTEGER NOT NULL,
  quantity_reserved INTEGER NOT NULL,
  quantity_available INTEGER NOT NULL,
  recalculated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_positions_product_location ON stock_positions (product_id, location_id);

CREATE TABLE IF NOT EXISTS stock_reservations (
  reservation_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  location_id TEXT,
  quantity INTEGER NOT NULL,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_location_status ON stock_reservations (product_id, location_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_order_id ON stock_reservations (order_id);

CREATE TABLE IF NOT EXISTS stock_locations (
  location_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address_line TEXT,
  active INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_locations_tenant_active ON stock_locations (tenant_id, active);

CREATE TABLE IF NOT EXISTS stock_alert_rules (
  rule_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  location_id TEXT,
  threshold_quantity INTEGER NOT NULL,
  active INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_alert_rules_product_location_active ON stock_alert_rules (product_id, location_id, active);
CREATE INDEX IF NOT EXISTS idx_stock_alert_rules_tenant_id ON stock_alert_rules (tenant_id);
