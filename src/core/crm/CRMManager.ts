import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { Customer } from "./Customer";
import type { Interaction } from "./Interaction";
import type { Opportunity } from "./Opportunity";
import { CustomerService, type CustomerInput } from "./CustomerService";
import { InteractionService, type InteractionInput } from "./InteractionService";
import { OpportunityService, type OpportunityInput } from "./OpportunityService";
import { CRMMetrics, type CRMMetricsSnapshot } from "./CRMMetrics";

/**
 * Coordena todas as operações de Customer/Interaction/Opportunity
 * (Tarefa 03) — delega cadastro/atualização/consulta/remoção a
 * CustomerService/InteractionService/OpportunityService, registra
 * CRMMetrics e emite os eventos de ciclo de vida
 * (CRM_CUSTOMER_CREATED/UPDATED/REMOVED, CRM_INTERACTION_CREATED,
 * CRM_OPPORTUNITY_CREATED/UPDATED).
 *
 * Nunca contém regra específica de Marketing ou Financeira, e nunca
 * acessa IA — apenas coordena os três Services e a infraestrutura
 * cross-cutting (EventBus, CRMMetrics).
 *
 * Consumido exclusivamente por CRM (fachada).
 */
export class CRMManager {
  private readonly customerService = new CustomerService();

  private readonly interactionService = new InteractionService();

  private readonly opportunityService = new OpportunityService();

  private readonly metrics = new CRMMetrics();

  /** Cria um novo Customer. */
  createCustomer(input: CustomerInput): Customer {
    const customer = this.customerService.create(input);
    this.metrics.recordCreate();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.CRM_CUSTOMER_CREATED,
      source: "CRMManager",
      payload: { id: customer.id, status: customer.status },
      createdAt: customer.createdAt,
    });

    return customer;
  }

  /** Atualiza um Customer já existente (parcial). Retorna `undefined` se não existir. */
  updateCustomer(id: string, input: Partial<CustomerInput>): Customer | undefined {
    const updated = this.customerService.update(id, input);

    if (updated) {
      this.metrics.recordUpdate();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CRM_CUSTOMER_UPDATED,
        source: "CRMManager",
        payload: { id: updated.id, status: updated.status },
        createdAt: updated.updatedAt,
      });
    }

    return updated;
  }

  /** Remove um Customer. Retorna `false` se não existir. */
  removeCustomer(id: string): boolean {
    const removed = this.customerService.remove(id);

    if (removed) {
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CRM_CUSTOMER_REMOVED,
        source: "CRMManager",
        payload: { id },
        createdAt: new Date(),
      });
    }

    return removed;
  }

  /** Retorna o Customer de `id`, ou `undefined` se não existir. Registra consulta. */
  getCustomer(id: string): Customer | undefined {
    this.metrics.recordQuery();
    return this.customerService.get(id);
  }

  /** Retorna todos os Customer cadastrados. Registra consulta. */
  listCustomers(): Customer[] {
    this.metrics.recordQuery();
    return this.customerService.list();
  }

  /** Registra uma nova Interaction. */
  createInteraction(input: InteractionInput): Interaction {
    const interaction = this.interactionService.create(input);
    this.metrics.recordCreate();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.CRM_INTERACTION_CREATED,
      source: "CRMManager",
      payload: { id: interaction.id, customerId: interaction.customerId, type: interaction.type },
      createdAt: interaction.createdAt,
    });

    return interaction;
  }

  /** Retorna as Interaction registradas — todas, ou apenas de `customerId` quando informado. Registra consulta. */
  listInteractions(customerId?: string): Interaction[] {
    this.metrics.recordQuery();
    return this.interactionService.list(customerId);
  }

  /** Cria uma nova Opportunity. */
  createOpportunity(input: OpportunityInput): Opportunity {
    const opportunity = this.opportunityService.create(input);
    this.metrics.recordCreate();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.CRM_OPPORTUNITY_CREATED,
      source: "CRMManager",
      payload: { id: opportunity.id, customerId: opportunity.customerId, status: opportunity.status },
      createdAt: opportunity.createdAt,
    });

    return opportunity;
  }

  /** Atualiza uma Opportunity já existente (parcial). Retorna `undefined` se não existir. */
  updateOpportunity(id: string, input: Partial<OpportunityInput>): Opportunity | undefined {
    const updated = this.opportunityService.update(id, input);

    if (updated) {
      this.metrics.recordUpdate();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CRM_OPPORTUNITY_UPDATED,
        source: "CRMManager",
        payload: { id: updated.id, status: updated.status },
        createdAt: updated.updatedAt,
      });
    }

    return updated;
  }

  /** Retorna as Opportunity cadastradas — todas, ou apenas de `customerId` quando informado. Registra consulta. */
  listOpportunities(customerId?: string): Opportunity[] {
    this.metrics.recordQuery();
    return this.opportunityService.list(customerId);
  }

  /** Métricas agregadas de uso do CRM. */
  getMetrics(): CRMMetricsSnapshot {
    return this.metrics.snapshot({
      customers: this.customerService.list().length,
      interactions: this.interactionService.list().length,
      opportunities: this.opportunityService.list().length,
    });
  }
}
