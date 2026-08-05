import type { Contact, ContactAssociationType, ContactRepository } from "@abp/crm-hub";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, orNull, orUndefined, toMs } from "../../db/sqlUtil.js";

interface Row {
  contact_id: string;
  tenant_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  association_type: string;
  association_id: string;
  created_at: number;
}

/** Implementação real de `ContactRepository`. Sem `update` — o contrato nunca o declarou (Contact é imutável após criação). */
export class SqliteContactRepository implements ContactRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(contact: Contact): Promise<Contact> {
    this.db
      .prepare("INSERT INTO contacts (contact_id, tenant_id, name, role, email, phone, association_type, association_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(contact.contactId, contact.tenantId, contact.name, orNull(contact.role), orNull(contact.email), orNull(contact.phone), contact.associationType, contact.associationId, toMs(contact.createdAt));
    return contact;
  }

  async get(contactId: string): Promise<Contact | undefined> {
    const row = this.db.prepare("SELECT * FROM contacts WHERE contact_id = ?").get(contactId) as unknown as Row | undefined;
    return row ? toContact(row) : undefined;
  }

  async list(tenantId: string): Promise<readonly Contact[]> {
    const rows = this.db.prepare("SELECT * FROM contacts WHERE tenant_id = ?").all(tenantId) as unknown as Row[];
    return rows.map(toContact);
  }
}

function toContact(row: Row): Contact {
  return {
    contactId: row.contact_id,
    tenantId: row.tenant_id,
    name: row.name,
    role: orUndefined(row.role),
    email: orUndefined(row.email),
    phone: orUndefined(row.phone),
    associationType: row.association_type as ContactAssociationType,
    associationId: row.association_id,
    createdAt: fromMs(row.created_at),
  };
}
