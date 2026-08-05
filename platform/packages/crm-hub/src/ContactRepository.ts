import type { Contact } from './Contact';

/**
 * ContactRepository — contrato de persistência de Contact. Interface apenas, per IMP-002, Etapa 5.
 */
export interface ContactRepository {
  create(contact: Contact): Promise<Contact>;
  get(contactId: string): Promise<Contact | undefined>;
  list(tenantId: string): Promise<readonly Contact[]>;
}
