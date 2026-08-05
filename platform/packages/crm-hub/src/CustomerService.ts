import type { Customer } from './Customer';
import type { CustomerRepository } from './CustomerRepository';

/** Campos aceitos por `CustomerService.create()` — nunca inclui `relationshipId`, atribuído por quem orquestra (ver CRMManager). */
export type CreateCustomerInput = Pick<Customer, 'tenantId' | 'name' | 'email' | 'phone'>;

/**
 * CustomerService — adaptado de `src/core/crm/{CustomerService.ts, CustomerStore.ts}`, cujo padrão
 * Store-em-memória + Service-stateless (TECHNICAL_MIGRATION_STRATEGY.md, Capítulo 12: "real e
 * funcional") é preservado aqui através do contrato `CustomerRepository`, mantendo a mesma
 * disciplina de responsabilidade única: esta classe nunca emite Evento nem grava métrica — isso
 * pertence exclusivamente ao CRMManager (mesma fronteira já disciplinada na implementação original).
 */
export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  async create(input: CreateCustomerInput, relationshipId: string): Promise<Customer> {
    const customer: Customer = {
      customerId: crypto.randomUUID(),
      relationshipId,
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(customer);
  }

  async update(customerId: string, input: Partial<CreateCustomerInput>): Promise<Customer> {
    const existing = await this.repository.get(customerId);

    if (!existing) {
      throw new Error(`Customer ${customerId} não encontrado.`);
    }

    return this.repository.update({ ...existing, ...input });
  }

  async get(customerId: string): Promise<Customer | undefined> {
    return this.repository.get(customerId);
  }

  async list(tenantId: string): Promise<readonly Customer[]> {
    return this.repository.list(tenantId);
  }
}
