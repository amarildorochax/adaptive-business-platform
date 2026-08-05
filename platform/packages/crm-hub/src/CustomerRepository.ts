import type { Customer } from './Customer';

/**
 * CustomerRepository — contrato de persistência de Customer. Interface apenas, per IMP-002, Etapa 5.
 */
export interface CustomerRepository {
  create(customer: Customer): Promise<Customer>;
  update(customer: Customer): Promise<Customer>;
  get(customerId: string): Promise<Customer | undefined>;
  list(tenantId: string): Promise<readonly Customer[]>;
}
