import type { Customer } from "./Customer";
import type { Interaction } from "./Interaction";
import type { Opportunity } from "./Opportunity";
import { CRMManager } from "./CRMManager";
import type { CustomerInput } from "./CustomerService";
import type { InteractionInput } from "./InteractionService";
import type { OpportunityInput } from "./OpportunityService";
import type { CRMMetricsSnapshot } from "./CRMMetrics";

/**
 * Fachada pública única do CRM Core (Tarefa 02) — a fonte oficial de
 * dados comerciais da plataforma (clientes, interações, oportunidades).
 *
 * ```
 * Application
 *    ↓
 * CRM.createCustomer/updateCustomer/removeCustomer/getCustomer/listCustomers/
 *    createInteraction/listInteractions/createOpportunity/updateOpportunity/
 *    listOpportunities/getMetrics                    ← único ponto de entrada
 *    ↓
 * CRMManager                        ← coordena, sem regra de Marketing/Finanças, nunca acessa IA
 *    ↓                    ↓                    ↓
 * CustomerService   InteractionService   OpportunityService
 *    ↓                    ↓                    ↓
 * CustomerStore     InteractionStore     OpportunityStore
 * ```
 *
 * Não executa automações, não envia mensagens, não integra nenhuma API
 * externa — apenas a camada central de dados comerciais, em memória
 * (sem persistência).
 *
 * Responsabilidade: nenhum consumidor deve importar CRMManager, os
 * Services ou os Stores diretamente — todos usam exclusivamente esta
 * fachada. Módulos futuros (Marketing Intelligence, Finance
 * Intelligence, Automation Center, Dashboard) devem consumir apenas
 * `crm`.
 *
 * Dependências: CRMManager.
 */
export class CRM {
  private readonly manager = new CRMManager();

  /** Cria um novo Customer. */
  createCustomer(input: CustomerInput): Customer {
    return this.manager.createCustomer(input);
  }

  /** Atualiza um Customer já existente (parcial). */
  updateCustomer(id: string, input: Partial<CustomerInput>): Customer | undefined {
    return this.manager.updateCustomer(id, input);
  }

  /** Remove um Customer. Retorna `false` se não existir. */
  removeCustomer(id: string): boolean {
    return this.manager.removeCustomer(id);
  }

  /** Recupera um Customer por `id`, ou `undefined` se não existir. */
  getCustomer(id: string): Customer | undefined {
    return this.manager.getCustomer(id);
  }

  /** Retorna todos os Customer cadastrados. */
  listCustomers(): Customer[] {
    return this.manager.listCustomers();
  }

  /** Registra uma nova Interaction. */
  createInteraction(input: InteractionInput): Interaction {
    return this.manager.createInteraction(input);
  }

  /** Retorna as Interaction registradas — todas, ou apenas de `customerId` quando informado. */
  listInteractions(customerId?: string): Interaction[] {
    return this.manager.listInteractions(customerId);
  }

  /** Cria uma nova Opportunity. */
  createOpportunity(input: OpportunityInput): Opportunity {
    return this.manager.createOpportunity(input);
  }

  /** Atualiza uma Opportunity já existente (parcial). */
  updateOpportunity(id: string, input: Partial<OpportunityInput>): Opportunity | undefined {
    return this.manager.updateOpportunity(id, input);
  }

  /** Retorna as Opportunity cadastradas — todas, ou apenas de `customerId` quando informado. */
  listOpportunities(customerId?: string): Opportunity[] {
    return this.manager.listOpportunities(customerId);
  }

  /** Métricas agregadas de uso do CRM. */
  getMetrics(): CRMMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do CRM para toda a plataforma. */
export const crm = new CRM();
