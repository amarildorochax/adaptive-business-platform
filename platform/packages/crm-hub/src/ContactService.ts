import type { Contact, ContactAssociationType } from './Contact';
import type { ContactRepository } from './ContactRepository';

/** Campos aceitos por `ContactService.create()`. */
export type CreateContactInput = Pick<Contact, 'tenantId' | 'name' | 'role' | 'email' | 'phone'>;

/**
 * ContactService — adaptado de `src/app/features/crm/types/Client.ts`, cujo papel de Contact hoje
 * é fundido com Customer/Lead no mesmo tipo (`Client`). CRM_VOCABULARY_RECONCILIATION.md, Capítulo
 * 12, decidiu explicitamente contra essa fusão — Contact é sempre associado a exatamente um
 * Customer ou uma Organization, nunca ambos (regra `ContactAssociatesToOneCustomerOrOrganization`,
 * já catalogada em `CRMBusinessRule.ts`), verificada aqui pela própria forma do tipo discriminado
 * `ContactAssociationType`, nunca por validação em tempo de execução redundante.
 */
export class ContactService {
  constructor(private readonly repository: ContactRepository) {}

  async create(
    input: CreateContactInput,
    associationType: ContactAssociationType,
    associationId: string,
  ): Promise<Contact> {
    const contact: Contact = {
      contactId: crypto.randomUUID(),
      associationType,
      associationId,
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(contact);
  }

  async get(contactId: string): Promise<Contact | undefined> {
    return this.repository.get(contactId);
  }

  async list(tenantId: string): Promise<readonly Contact[]> {
    return this.repository.list(tenantId);
  }
}
