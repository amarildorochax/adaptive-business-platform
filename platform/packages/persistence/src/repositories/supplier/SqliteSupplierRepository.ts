import type { Supplier, SupplierContact, SupplierRepository, SupplierStatus } from "@abp/supplier-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface SupplierRow {
  supplier_id: string;
  tenant_id: string;
  legal_name: string;
  tax_id_value: string;
  status: string;
  supply_category: string | null;
  created_at: number;
  updated_at: number;
}

interface SupplierContactRow {
  contact_id: string;
  supplier_id: string;
  name: string;
  channel_id: string | null;
  role: string;
}

/**
 * Implementação real de `SupplierRepository`. `Supplier.contacts` (parte interna do Aggregate, per
 * `SUPPLIER_HUB.md`, Capítulo 4) é persistido em `supplier_contacts`, uma tabela filha sem
 * Repository Interface própria — `create`/`update` regravam a lista inteira de contatos dentro da
 * mesma transação que grava o Supplier, nunca em duas operações independentes, garantindo que uma
 * falha parcial nunca deixe `suppliers` e `supplier_contacts` divergentes (per instrução explícita
 * de IMP-202: "Nenhuma alteração parcial poderá permanecer gravada").
 */
export class SqliteSupplierRepository implements SupplierRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(supplier: Supplier): Promise<Supplier> {
    this.db.exec("BEGIN");
    try {
      this.insertSupplier(supplier);
      this.replaceContacts(supplier.supplierId, supplier.contacts);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return supplier;
  }

  async update(supplier: Supplier): Promise<Supplier> {
    this.db.exec("BEGIN");
    try {
      this.db
        .prepare(
          "UPDATE suppliers SET tenant_id = ?, legal_name = ?, tax_id_value = ?, status = ?, supply_category = ?, created_at = ?, updated_at = ? WHERE supplier_id = ?",
        )
        .run(
          supplier.tenantId,
          supplier.legalName,
          supplier.taxId.value,
          supplier.status,
          orNull(supplier.supplyCategory),
          toMs(supplier.createdAt),
          toMs(supplier.updatedAt),
          supplier.supplierId,
        );
      this.replaceContacts(supplier.supplierId, supplier.contacts);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }

    return supplier;
  }

  async findById(supplierId: string): Promise<Supplier | undefined> {
    const row = this.db.prepare("SELECT * FROM suppliers WHERE supplier_id = ?").get(supplierId) as unknown as SupplierRow | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  async findByTaxId(tenantId: string, taxIdValue: string): Promise<Supplier | undefined> {
    const row = this.db
      .prepare("SELECT * FROM suppliers WHERE tenant_id = ? AND tax_id_value = ?")
      .get(tenantId, taxIdValue) as unknown as SupplierRow | undefined;
    return row ? this.hydrate(row) : undefined;
  }

  async findActive(tenantId: string): Promise<readonly Supplier[]> {
    const rows = this.db
      .prepare("SELECT * FROM suppliers WHERE tenant_id = ? AND status = 'Active'")
      .all(tenantId) as unknown as SupplierRow[];
    return rows.map((row) => this.hydrate(row));
  }

  private insertSupplier(supplier: Supplier): void {
    this.db
      .prepare(
        "INSERT INTO suppliers (supplier_id, tenant_id, legal_name, tax_id_value, status, supply_category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        supplier.supplierId,
        supplier.tenantId,
        supplier.legalName,
        supplier.taxId.value,
        supplier.status,
        orNull(supplier.supplyCategory),
        toMs(supplier.createdAt),
        toMs(supplier.updatedAt),
      );
  }

  private replaceContacts(supplierId: string, contacts: readonly SupplierContact[]): void {
    this.db.prepare("DELETE FROM supplier_contacts WHERE supplier_id = ?").run(supplierId);

    const insert = this.db.prepare(
      "INSERT INTO supplier_contacts (contact_id, supplier_id, name, channel_id, role) VALUES (?, ?, ?, ?, ?)",
    );
    for (const contact of contacts) {
      insert.run(contact.contactId, supplierId, contact.name, orNull(contact.channelId), contact.role);
    }
  }

  private hydrate(row: SupplierRow): Supplier {
    const contactRows = this.db
      .prepare("SELECT * FROM supplier_contacts WHERE supplier_id = ?")
      .all(row.supplier_id) as unknown as SupplierContactRow[];

    return {
      supplierId: row.supplier_id,
      tenantId: row.tenant_id,
      legalName: row.legal_name,
      taxId: { value: row.tax_id_value },
      status: row.status as SupplierStatus,
      supplyCategory: orUndefined(row.supply_category),
      contacts: contactRows.map(toContact),
      createdAt: fromMs(row.created_at),
      updatedAt: fromMs(row.updated_at),
    };
  }
}

function toContact(row: SupplierContactRow): SupplierContact {
  return {
    contactId: row.contact_id,
    supplierId: row.supplier_id,
    name: row.name,
    channelId: orUndefined(row.channel_id),
    role: row.role as SupplierContact["role"],
  };
}
