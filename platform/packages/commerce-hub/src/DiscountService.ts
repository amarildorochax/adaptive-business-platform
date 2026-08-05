import type { Discount } from './Discount';
import type { DiscountRepository } from './DiscountRepository';

/** Campos aceitos por `DiscountService.create()`. */
export type CreateDiscountInput = Pick<
  Discount,
  'tenantId' | 'name' | 'kind' | 'value' | 'appliesToProductId' | 'appliesToCategoryId' | 'validFrom' | 'validTo'
>;

/**
 * DiscountService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui —
 * `DiscountRuleApplied` (o único Evento aprovado para Discount) é produzido apenas na avaliação em
 * Checkout, fora de escopo desta Sprint (ver relatório desta Sprint).
 */
export class DiscountService {
  constructor(private readonly repository: DiscountRepository) {}

  async create(input: CreateDiscountInput): Promise<Discount> {
    const discount: Discount = { discountId: crypto.randomUUID(), createdAt: new Date(), ...input };
    return this.repository.create(discount);
  }

  async get(discountId: string): Promise<Discount | undefined> {
    return this.repository.get(discountId);
  }

  async list(tenantId: string): Promise<readonly Discount[]> {
    return this.repository.list(tenantId);
  }
}
