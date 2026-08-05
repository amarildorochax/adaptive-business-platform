import { describe, expect, it } from 'vitest';
import { CRMManager } from './CRMManager';
import { ContactService } from './ContactService';
import { CustomerService } from './CustomerService';
import { LeadService } from './LeadService';
import { OpportunityService } from './OpportunityService';
import { OrganizationService } from './OrganizationService';
import { RelationshipService } from './RelationshipService';
import { TimelineEventService } from './TimelineEventService';
import {
  FakeContactRepository,
  FakeCustomerRepository,
  FakeLeadRepository,
  FakeOpportunityRepository,
  FakeOrganizationRepository,
  FakeRelationshipRepository,
  FakeTimelineEventRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  return new CRMManager({
    leads: new LeadService(new FakeLeadRepository()),
    customers: new CustomerService(new FakeCustomerRepository()),
    organizations: new OrganizationService(new FakeOrganizationRepository()),
    contacts: new ContactService(new FakeContactRepository()),
    relationships: new RelationshipService(new FakeRelationshipRepository()),
    opportunities: new OpportunityService(new FakeOpportunityRepository()),
    timeline: new TimelineEventService(new FakeTimelineEventRepository()),
  });
}

describe('CRMManager — CRM Core', () => {
  it('createLead produz Lead e o Event LeadCreated, com Command CreateLead', async () => {
    const manager = buildManager();

    const { result, command, events } = await manager.createLead({
      tenantId: 'tenant-1',
      name: 'Ana Paula',
      email: 'ana@example.com',
      phone: undefined,
      source: 'instagram',
    });

    expect(result.name).toBe('Ana Paula');
    expect(command?.type).toBe('CreateLead');
    expect(events.map((e) => e.type)).toEqual(['LeadCreated']);
  });

  it('convertLead cria Relationship e Customer, nunca reutiliza o Lead como Customer', async () => {
    const manager = buildManager();
    const { result: lead } = await manager.createLead({
      tenantId: 'tenant-1',
      name: 'Carlos Dias',
      email: 'carlos@example.com',
      phone: undefined,
      source: 'google-ads',
    });

    const { result, command, events } = await manager.convertLead(lead.leadId, 'am-1');

    expect(result.relationship.partyType).toBe('Customer');
    expect(result.customer.relationshipId).toBe(result.relationship.relationshipId);
    expect(result.customer.name).toBe('Carlos Dias');
    expect(command?.type).toBe('ConvertLead');
    expect(events.map((e) => e.type)).toEqual([
      'LeadConverted',
      'CustomerCreated',
      'RelationshipChanged',
      'TimelineUpdated',
    ]);
  });

  it('createOpportunity rejeita Relationship inexistente — OpportunityBelongsToCustomerOrOrganization', async () => {
    const manager = buildManager();

    await expect(
      manager.createOpportunity(
        { tenantId: 'tenant-1', title: 'Negócio X', value: 1000, pipelineId: 'p-1', stageId: 's-1' },
        'relationship-inexistente',
      ),
    ).rejects.toThrow();
  });

  it('createOpportunity aceita um Relationship de Customer já existente', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createCustomer(
      { tenantId: 'tenant-1', name: 'Loja Azul', email: undefined, phone: undefined },
      'am-1',
    );

    const { result, events } = await manager.createOpportunity(
      { tenantId: 'tenant-1', title: 'Renovação anual', value: 8000, pipelineId: 'p-1', stageId: 's-1' },
      created.relationship.relationshipId,
    );

    expect(result.relationshipId).toBe(created.relationship.relationshipId);
    expect(events.map((e) => e.type)).toEqual(['OpportunityCreated', 'TimelineUpdated']);
  });

  it('moveOpportunity para Won emite OpportunityWon antes de TimelineUpdated', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createCustomer(
      { tenantId: 'tenant-1', name: 'Loja Verde', email: undefined, phone: undefined },
      'am-1',
    );
    const { result: opportunity } = await manager.createOpportunity(
      { tenantId: 'tenant-1', title: 'Plano Anual', value: 3000, pipelineId: 'p-1', stageId: 's-1' },
      created.relationship.relationshipId,
    );

    const { events } = await manager.moveOpportunity(opportunity.opportunityId, 's-final', 'Won');

    expect(events.map((e) => e.type)).toEqual(['OpportunityWon', 'TimelineUpdated']);
  });

  it('createContact resolve o Relationship a partir do Customer associado', async () => {
    const manager = buildManager();
    const { result: created } = await manager.createCustomer(
      { tenantId: 'tenant-1', name: 'Loja Roxa', email: undefined, phone: undefined },
      'am-1',
    );

    const { result: contact, events } = await manager.createContact(
      { tenantId: 'tenant-1', name: 'Pedro Alves', role: 'Comprador', email: undefined, phone: undefined },
      'Customer',
      created.customer.customerId,
    );

    expect(contact.associationType).toBe('Customer');
    expect(events.map((e) => e.type)).toEqual(['TimelineUpdated']);
  });

  it('createOrganization nunca emite um Command — nenhum Command aprovado cobre esta operação', async () => {
    const manager = buildManager();

    const { command, events } = await manager.createOrganization(
      { tenantId: 'tenant-1', name: 'Azul Comércio Ltda', tradeName: undefined, taxId: undefined, segment: undefined, phone: undefined, email: undefined, website: undefined },
      'am-1',
    );

    expect(command).toBeUndefined();
    expect(events.map((e) => e.type)).toEqual(['RelationshipChanged', 'TimelineUpdated']);
  });
});
