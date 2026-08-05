import type { SupplierCatalogItem, SupplierCatalogItemRepository } from "@abp/supplier-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface Row {
  catalog_item_id: string;
  supplier_id: string;
  tenant_id: string;
  product_id: string;
  list_price_amount: number;
  list_price_currency_code: string;
  lead_time_in_days: number;
  minimum_order_quantity: number;
  created_at: number;
}

/** Implementação real de `SupplierCatalogItemRepository`. */
export class SqliteSupplierCatalogItemRepository implements SupplierCatalogItemRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(item: SupplierCatalogItem): Promise<SupplierCatalogItem> {
    this.db
      .prepare(
        "INSERT INTO supplier_catalog_items (catalog_item_id, supplier_id, tenant_id, product_id, list_price_amount, list_price_currency_code, lead_time_in_days, minimum_order_quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        item.catalogItemId,
        item.supplierId,
        item.tenantId,
        item.productId,
        item.listPrice.amount,
        item.listPrice.currencyCode,
        item.leadTimeInDays,
        item.minimumOrderQuantity,
        toMs(item.createdAt),
      );
    return item;
  }

  async update(item: SupplierCatalogItem): Promise<SupplierCatalogItem> {
    this.db
      .prepare(
        "UPDATE supplier_catalog_items SET supplier_id = ?, tenant_id = ?, product_id = ?, list_price_amount = ?, list_price_currency_code = ?, lead_time_in_days = ?, minimum_order_quantity = ?, created_at = ? WHERE catalog_item_id = ?",
      )
      .run(
        item.supplierId,
        item.tenantId,
        item.productId,
        item.listPrice.amount,
        item.listPrice.currencyCode,
        item.leadTimeInDays,
        item.minimumOrderQuantity,
        toMs(item.createdAt),
        item.catalogItemId,
      );
    return item;
  }

  async findById(catalogItemId: string): Promise<SupplierCatalogItem | undefined> {
    const row = this.db.prepare("SELECT * FROM supplier_catalog_items WHERE catalog_item_id = ?").get(catalogItemId) as unknown as Row | undefined;
    return row ? toCatalogItem(row) : undefined;
  }

  async findBySupplier(supplierId: string): Promise<readonly SupplierCatalogItem[]> {
    const rows = this.db.prepare("SELECT * FROM supplier_catalog_items WHERE supplier_id = ?").all(supplierId) as unknown as Row[];
    return rows.map(toCatalogItem);
  }

  async findByProduct(productId: string): Promise<readonly SupplierCatalogItem[]> {
    const rows = this.db.prepare("SELECT * FROM supplier_catalog_items WHERE product_id = ?").all(productId) as unknown as Row[];
    return rows.map(toCatalogItem);
  }
}

function toCatalogItem(row: Row): SupplierCatalogItem {
  return {
    catalogItemId: row.catalog_item_id,
    supplierId: row.supplier_id,
    tenantId: row.tenant_id,
    productId: row.product_id,
    listPrice: { amount: row.list_price_amount, currencyCode: row.list_price_currency_code },
    leadTimeInDays: row.lead_time_in_days,
    minimumOrderQuantity: row.minimum_order_quantity,
    createdAt: fromMs(row.created_at),
  };
}
