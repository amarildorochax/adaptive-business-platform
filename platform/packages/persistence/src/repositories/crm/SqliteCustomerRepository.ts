import type { Customer, CustomerRepository } from "@abp/crm-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface Row {
  customer_id: string;
  tenant_id: string;
  relationship_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: number;
}

/** Implementação real de `CustomerRepository`. */
export class SqliteCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(customer: Customer): Promise<Customer> {
    this.db
      .prepare("INSERT INTO customers (customer_id, tenant_id, relationship_id, name, email, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(customer.customerId, customer.tenantId, customer.relationshipId, customer.name, orNull(customer.email), orNull(customer.phone), toMs(customer.createdAt));
    return customer;
  }

  async update(customer: Customer): Promise<Customer> {
    this.db
      .prepare("UPDATE customers SET tenant_id = ?, relationship_id = ?, name = ?, email = ?, phone = ?, created_at = ? WHERE customer_id = ?")
      .run(customer.tenantId, customer.relationshipId, customer.name, orNull(customer.email), orNull(customer.phone), toMs(customer.createdAt), customer.customerId);
    return customer;
  }

  async get(customerId: string): Promise<Customer | undefined> {
    const row = this.db.prepare("SELECT * FROM customers WHERE customer_id = ?").get(customerId) as unknown as Row | undefined;
    return row ? toCustomer(row) : undefined;
  }

  async list(tenantId: string): Promise<readonly Customer[]> {
    const rows = this.db.prepare("SELECT * FROM customers WHERE tenant_id = ?").all(tenantId) as unknown as Row[];
    return rows.map(toCustomer);
  }
}

function toCustomer(row: Row): Customer {
  return {
    customerId: row.customer_id,
    tenantId: row.tenant_id,
    relationshipId: row.relationship_id,
    name: row.name,
    email: orUndefined(row.email),
    phone: orUndefined(row.phone),
    createdAt: fromMs(row.created_at),
  };
}
