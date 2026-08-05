import type { CRMCommand, CRMCommandType } from './CRMCommand';
import type { CRMEvent, CRMEventType } from './CRMEvent';
import type { Customer } from './Customer';
import { CustomerService, type CreateCustomerInput } from './CustomerService';
import type { Lead } from './Lead';
import { LeadService, type CreateLeadInput } from './LeadService';
import type { Organization } from './Organization';
import { OrganizationService, type CreateOrganizationInput } from './OrganizationService';
import type { Opportunity, OpportunityOutcome } from './Opportunity';
import { OpportunityService, type CreateOpportunityInput } from './OpportunityService';
import type { Contact, ContactAssociationType } from './Contact';
import { ContactService, type CreateContactInput } from './ContactService';
import type { Relationship } from './Relationship';
import { RelationshipService } from './RelationshipService';
import { TimelineEventService } from './TimelineEventService';

export interface CRMManagerDependencies {
  readonly leads: LeadService;
  readonly customers: CustomerService;
  readonly organizations: OrganizationService;
  readonly contacts: ContactService;
  readonly relationships: RelationshipService;
  readonly opportunities: OpportunityService;
  readonly timeline: TimelineEventService;
}

/**
 * Resultado de uma operação de CRMManager — a Entidade produzida, todo Event já Frozen
 * consequente, e o Command que a originou, quando a operação corresponde a um dos onze Commands já
 * aprovados em `CRMCommand.ts`. `command` é `undefined` para Organization e Contact — nenhum dos
 * onze Commands já Frozen cobre a criação dessas duas Entidades (ver Nota de Posicionamento de
 * `CRM_CORE_MIGRATION_REPORT.md`); esta Sprint não inventa um Command novo para preenchê-lo.
 */
export interface CRMOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: CRMCommand;
  readonly events: readonly CRMEvent[];
}

/**
 * CRMManager — o componente "CRM Manager" já catalogado em `CRMHubComponent.ts`, implementado pela
 * primeira vez nesta Sprint (IMP-002, CRM Core). Orquestra os Services de cada Entidade em escopo,
 * nunca contém, ele mesmo, regra de negócio de uma Entidade específica — mesma disciplina de
 * fronteira já demonstrada por `src/core/crm/CRMManager.ts` (real e funcional, per
 * TECHNICAL_MIGRATION_STRATEGY.md, Capítulo 12), adaptada aqui ao vocabulário oficial da ST-004
 * (Organization/Opportunity/Timeline Event, nunca Company/Deal/HistoryEntry) e à forma de Command e
 * Event já Frozen em `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md`.
 *
 * Toda mudança de Stage produz um Timeline Event, per a regra de negócio `StageChangeProducesTimelineEvent`
 * já catalogada em `CRMBusinessRule.ts` — este Manager é o único lugar onde essa regra é de fato
 * aplicada, nunca deixada a critério de cada Service individualmente.
 *
 * Não publica em nenhum Event Bus — `CRMEvent` é retornado ao chamador (padrão "Domain Events
 * coletados, despachados pela infraestrutura"), porque nenhuma implementação real de
 * `EventPublisher` (@abp/core) existe ainda nesta plataforma. Conectar esses Eventos a um Event Bus
 * real é trabalho de uma Sprint de Infrastructure futura, fora do escopo de CRM Core.
 */
export class CRMManager {
  constructor(private readonly deps: CRMManagerDependencies) {}

  async createLead(input: CreateLeadInput): Promise<CRMOperationResult<Lead>> {
    const lead = await this.deps.leads.create(input);
    return {
      result: lead,
      command: this.command('CreateLead'),
      events: [this.event('LeadCreated')],
    };
  }

  /**
   * Converte um Lead já qualificado em Customer — cria o Relationship que passa a estruturar esse
   * Customer, per `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 7 ("Opportunity... nunca a um Lead ainda não
   * convertido"): a partir desta chamada, o antigo Lead nunca mais é referenciado por nenhuma
   * Opportunity futura — apenas o Customer resultante.
   */
  async convertLead(
    leadId: string,
    accountManagerId: string,
  ): Promise<CRMOperationResult<{ customer: Customer; relationship: Relationship }>> {
    const lead = await this.deps.leads.get(leadId);

    if (!lead) {
      throw new Error(`Lead ${leadId} não encontrado.`);
    }

    const relationship = await this.deps.relationships.create({
      tenantId: lead.tenantId,
      partyType: 'Customer',
      partyId: leadId,
      accountManagerId,
    });

    const customerInput: CreateCustomerInput = {
      tenantId: lead.tenantId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    };

    const customer = await this.deps.customers.create(customerInput, relationship.relationshipId);

    await this.deps.timeline.record(
      lead.tenantId,
      relationship.relationshipId,
      `Lead ${leadId} convertido em Customer ${customer.customerId}.`,
    );

    return {
      result: { customer, relationship },
      command: this.command('ConvertLead'),
      events: [
        this.event('LeadConverted', relationship.relationshipId),
        this.event('CustomerCreated', relationship.relationshipId),
        this.event('RelationshipChanged', relationship.relationshipId),
        this.event('TimelineUpdated', relationship.relationshipId),
      ],
    };
  }

  async createCustomer(
    input: CreateCustomerInput,
    accountManagerId: string,
  ): Promise<CRMOperationResult<{ customer: Customer; relationship: Relationship }>> {
    const relationship = await this.deps.relationships.create({
      tenantId: input.tenantId,
      partyType: 'Customer',
      partyId: crypto.randomUUID(),
      accountManagerId,
    });

    const customer = await this.deps.customers.create(input, relationship.relationshipId);

    await this.deps.timeline.record(
      input.tenantId,
      relationship.relationshipId,
      `Customer ${customer.customerId} cadastrado diretamente.`,
    );

    return {
      result: { customer, relationship },
      command: this.command('CreateCustomer'),
      events: [
        this.event('CustomerCreated', relationship.relationshipId),
        this.event('RelationshipChanged', relationship.relationshipId),
        this.event('TimelineUpdated', relationship.relationshipId),
      ],
    };
  }

  async updateCustomer(
    customerId: string,
    input: Partial<CreateCustomerInput>,
  ): Promise<CRMOperationResult<Customer>> {
    const customer = await this.deps.customers.update(customerId, input);

    await this.deps.timeline.record(
      customer.tenantId,
      customer.relationshipId,
      `Customer ${customerId} atualizado.`,
    );

    return {
      result: customer,
      command: this.command('UpdateCustomer'),
      events: [this.event('CustomerUpdated', customer.relationshipId), this.event('TimelineUpdated', customer.relationshipId)],
    };
  }

  async createOrganization(
    input: CreateOrganizationInput,
    accountManagerId: string,
  ): Promise<CRMOperationResult<{ organization: Organization; relationship: Relationship }>> {
    const relationship = await this.deps.relationships.create({
      tenantId: input.tenantId,
      partyType: 'Organization',
      partyId: crypto.randomUUID(),
      accountManagerId,
    });

    const organization = await this.deps.organizations.create(input, relationship.relationshipId);

    await this.deps.timeline.record(
      input.tenantId,
      relationship.relationshipId,
      `Organization ${organization.organizationId} cadastrada.`,
    );

    // Nenhum Command "CreateOrganization" e nenhum Evento "OrganizationCreated" existem no catálogo
    // já Frozen (11 Commands, 18 Events, per CRMCommand.ts/CRMEvent.ts) — `command` fica
    // deliberadamente ausente, e apenas RelationshipChanged e TimelineUpdated são emitidos, per a
    // regra de não alterar o vocabulário já aprovado (ver CRM_CORE_MIGRATION_REPORT.md).
    return {
      result: { organization, relationship },
      events: [this.event('RelationshipChanged', relationship.relationshipId), this.event('TimelineUpdated', relationship.relationshipId)],
    };
  }

  async createContact(
    input: CreateContactInput,
    associationType: ContactAssociationType,
    associationId: string,
  ): Promise<CRMOperationResult<Contact>> {
    const contact = await this.deps.contacts.create(input, associationType, associationId);

    const relationshipId = await this.resolveRelationshipId(associationType, associationId);

    if (relationshipId) {
      await this.deps.timeline.record(
        input.tenantId,
        relationshipId,
        `Contact ${contact.contactId} associado a ${associationType} ${associationId}.`,
      );
    }

    // Nenhum Command "CreateContact" e nenhum Evento "ContactCreated" existem ainda no catálogo
    // Frozen — o segundo já registrado como extensão pendente de Change Request em
    // `CRM_HUB_ARCHITECTURE.md`, Capítulo 28, não incorporado unilateralmente por esta Sprint.
    return {
      result: contact,
      events: relationshipId ? [this.event('TimelineUpdated', relationshipId)] : [],
    };
  }

  async createOpportunity(
    input: CreateOpportunityInput,
    relationshipId: string,
  ): Promise<CRMOperationResult<Opportunity>> {
    const relationship = await this.deps.relationships.get(relationshipId);

    if (!relationship) {
      throw new Error(`Relationship ${relationshipId} não encontrado.`);
    }

    // Regra de negócio "OpportunityBelongsToCustomerOrOrganization" (CRMBusinessRule.ts) —
    // verificada aqui, no único lugar com acesso simultâneo a Opportunity e a Relationship.
    if (relationship.partyType !== 'Customer' && relationship.partyType !== 'Organization') {
      throw new Error(
        'Opportunity só pode ser associada a um Relationship de partyType Customer ou Organization.',
      );
    }

    const opportunity = await this.deps.opportunities.create(input, relationshipId);

    await this.deps.timeline.record(
      input.tenantId,
      relationshipId,
      `Opportunity ${opportunity.opportunityId} criada.`,
    );

    return {
      result: opportunity,
      command: this.command('CreateOpportunity'),
      events: [this.event('OpportunityCreated', relationshipId), this.event('TimelineUpdated', relationshipId)],
    };
  }

  async moveOpportunity(
    opportunityId: string,
    stageId: string,
    outcome: OpportunityOutcome = 'Open',
    lostReason?: string,
  ): Promise<CRMOperationResult<Opportunity>> {
    const opportunity = await this.deps.opportunities.move(opportunityId, stageId, outcome, lostReason);

    // "StageChangeProducesTimelineEvent" (CRMBusinessRule.ts) — aplicada aqui, sem exceção.
    await this.deps.timeline.record(
      opportunity.tenantId,
      opportunity.relationshipId,
      `Opportunity ${opportunityId} movida para o Stage ${stageId} (outcome: ${outcome}).`,
    );

    const events: CRMEvent[] = [this.event('TimelineUpdated', opportunity.relationshipId)];

    if (outcome === 'Won') {
      events.unshift(this.event('OpportunityWon', opportunity.relationshipId));
    } else if (outcome === 'Lost') {
      events.unshift(this.event('OpportunityLost', opportunity.relationshipId));
    }

    return { result: opportunity, command: this.command('MoveOpportunity'), events };
  }

  private async resolveRelationshipId(
    associationType: ContactAssociationType,
    associationId: string,
  ): Promise<string | undefined> {
    if (associationType === 'Customer') {
      const customer = await this.deps.customers.get(associationId);
      return customer?.relationshipId;
    }

    const organization = await this.deps.organizations.get(associationId);
    return organization?.relationshipId;
  }

  private command(type: CRMCommandType): CRMCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(type: CRMEventType, relationshipId?: string): CRMEvent {
    return { eventId: crypto.randomUUID(), type, relationshipId, occurredAt: new Date() };
  }
}
