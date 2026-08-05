import type { Discount } from './Discount';

/** Contrato de persistência de Discount — apenas o contrato, per Etapa 7. */
export interface DiscountRepository {
  create(discount: Discount): Promise<Discount>;
  get(discountId: string): Promise<Discount | undefined>;
  list(tenantId: string): Promise<Discount[]>;
}
