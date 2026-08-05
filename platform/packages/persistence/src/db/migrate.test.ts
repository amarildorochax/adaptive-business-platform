import { describe, expect, it } from "vitest";
import { createTestDatabase } from "../testing/createTestDatabase.js";
import { runMigrations } from "./migrate.js";

const EXPECTED_TABLES = [
  // 0000_init.sql — Business Profile, Branding, CRM (FUN-003)
  "business_profiles",
  "business_classification_records",
  "maturity_records",
  "business_profile_lifecycle_states",
  "logos",
  "design_tokens",
  "brand_themes",
  "leads",
  "customers",
  "organizations",
  "contacts",
  "relationships",
  "opportunities",
  "timeline_events",
  // 0001_iam.sql — IAM Core (FUN-100)
  "credentials",
  "profiles",
  "role_permissions",
  "sessions",
  "access_tokens",
  "access_audit_records",
  // 0002_supplier_hub.sql — Supplier Hub Persistence (IMP-202)
  "suppliers",
  "supplier_contacts",
  "supplier_catalog_items",
  "supplier_contracts",
  "supplier_performance_records",
  // 0003_purchase_hub.sql — Purchase Hub Persistence (IMP-302)
  "purchase_orders",
  "purchase_order_items",
  "receivings",
  "receiving_lines",
  "purchase_requisitions",
  "purchase_requisition_lines",
  "reorder_rules",
  // 0004_inventory_movement_hub.sql — Inventory Movement Persistence (IMP-402)
  "stock_movements",
  "stock_positions",
  "stock_reservations",
  "stock_locations",
  "stock_alert_rules",
  // 0005_production_hub.sql — Production Persistence (IMP-502)
  "bills_of_materials",
  "bom_lines",
  "work_centers",
  "production_orders",
  "production_consumptions",
  "production_outputs",
] as const;

describe("runMigrations", () => {
  it("cria exatamente as tabelas dos domínios já migrados, nunca antecipando outro domínio", () => {
    const handle = createTestDatabase();

    const tables = handle.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name != '_migrations' AND name != 'sqlite_sequence'")
      .all()
      .map((row) => (row as { name: string }).name)
      .sort();

    expect(tables).toEqual([...EXPECTED_TABLES].sort());
    handle.close();
  });

  it("é idempotente — aplicar novamente não falha nem duplica registro em _migrations", () => {
    const handle = createTestDatabase();

    expect(() => runMigrations(handle)).not.toThrow();

    const applied = handle.db.prepare("SELECT COUNT(*) as count FROM _migrations").get() as { count: number };
    expect(applied.count).toBe(6);
    handle.close();
  });
});
