import type { Contact } from '../Contact';
import type { ContactRepository } from '../ContactRepository';
import type { Customer } from '../Customer';
import type { CustomerRepository } from '../CustomerRepository';
import type { Lead } from '../Lead';
import type { LeadRepository } from '../LeadRepository';
import type { Opportunity } from '../Opportunity';
import type { OpportunityRepository } from '../OpportunityRepository';
import type { Organization } from '../Organization';
import type { OrganizationRepository } from '../OrganizationRepository';
import type { Relationship } from '../Relationship';
import type { RelationshipRepository } from '../RelationshipRepository';
import type { TimelineEvent } from '../TimelineEvent';
import type { TimelineEventRepository } from '../TimelineEventRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-002, Etapa 8). Nunca exportados pelo
 * barrel do pacote (`index.ts`) e nunca referenciados por nenhum Service em `src/` fora de teste —
 * per Etapa 5, o pacote de produção expõe apenas o contrato de Repository, nunca uma implementação
 * de persistência. Estes fakes existem só para que a regra de negócio dos Services seja exercitada
 * sem depender de infraestrutura real, que não é escopo desta Sprint.
 */

export class FakeLeadRepository implements LeadRepository {
  private readonly rows = new Map<string, Lead>();
  async create(lead: Lead) {
    this.rows.set(lead.leadId, lead);
    return lead;
  }
  async update(lead: Lead) {
    this.rows.set(lead.leadId, lead);
    return lead;
  }
  async get(leadId: string) {
    return this.rows.get(leadId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((l) => l.tenantId === tenantId);
  }
}

export class FakeCustomerRepository implements CustomerRepository {
  private readonly rows = new Map<string, Customer>();
  async create(customer: Customer) {
    this.rows.set(customer.customerId, customer);
    return customer;
  }
  async update(customer: Customer) {
    this.rows.set(customer.customerId, customer);
    return customer;
  }
  async get(customerId: string) {
    return this.rows.get(customerId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakeOrganizationRepository implements OrganizationRepository {
  private readonly rows = new Map<string, Organization>();
  async create(organization: Organization) {
    this.rows.set(organization.organizationId, organization);
    return organization;
  }
  async update(organization: Organization) {
    this.rows.set(organization.organizationId, organization);
    return organization;
  }
  async get(organizationId: string) {
    return this.rows.get(organizationId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((o) => o.tenantId === tenantId);
  }
}

export class FakeContactRepository implements ContactRepository {
  private readonly rows = new Map<string, Contact>();
  async create(contact: Contact) {
    this.rows.set(contact.contactId, contact);
    return contact;
  }
  async get(contactId: string) {
    return this.rows.get(contactId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((c) => c.tenantId === tenantId);
  }
}

export class FakeRelationshipRepository implements RelationshipRepository {
  private readonly rows = new Map<string, Relationship>();
  async create(relationship: Relationship) {
    this.rows.set(relationship.relationshipId, relationship);
    return relationship;
  }
  async update(relationship: Relationship) {
    this.rows.set(relationship.relationshipId, relationship);
    return relationship;
  }
  async get(relationshipId: string) {
    return this.rows.get(relationshipId);
  }
}

export class FakeOpportunityRepository implements OpportunityRepository {
  private readonly rows = new Map<string, Opportunity>();
  async create(opportunity: Opportunity) {
    this.rows.set(opportunity.opportunityId, opportunity);
    return opportunity;
  }
  async update(opportunity: Opportunity) {
    this.rows.set(opportunity.opportunityId, opportunity);
    return opportunity;
  }
  async get(opportunityId: string) {
    return this.rows.get(opportunityId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((o) => o.tenantId === tenantId);
  }
  async listByRelationship(relationshipId: string) {
    return [...this.rows.values()].filter((o) => o.relationshipId === relationshipId);
  }
}

export class FakeTimelineEventRepository implements TimelineEventRepository {
  private readonly rows: TimelineEvent[] = [];
  async add(event: TimelineEvent) {
    this.rows.push(event);
    return event;
  }
  async listByRelationship(relationshipId: string) {
    return this.rows.filter((e) => e.relationshipId === relationshipId);
  }
}
