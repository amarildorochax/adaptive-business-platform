import type { Coupon } from './Coupon';
import type { CouponRepository } from './CouponRepository';

/**
 * CouponService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — mesmo
 * motivo já registrado em `DiscountService` (`DiscountRuleApplied` exige avaliação em Checkout, fora
 * de escopo).
 */
export class CouponService {
  constructor(private readonly repository: CouponRepository) {}

  async create(discountId: string, code: string, maxRedemptions?: number, campaignReferenceId?: string): Promise<Coupon> {
    const coupon: Coupon = {
      couponId: crypto.randomUUID(),
      discountId,
      code,
      maxRedemptions,
      redemptionsCount: 0,
      campaignReferenceId,
      createdAt: new Date(),
    };

    return this.repository.create(coupon);
  }

  async redeem(code: string): Promise<Coupon> {
    const existing = await this.repository.findByCode(code);

    if (!existing) {
      throw new Error(`Coupon com código ${code} não encontrado.`);
    }

    if (existing.maxRedemptions !== undefined && existing.redemptionsCount >= existing.maxRedemptions) {
      throw new Error(`Coupon ${code} já atingiu o limite de resgates.`);
    }

    return this.repository.update({ ...existing, redemptionsCount: existing.redemptionsCount + 1 });
  }

  async get(couponId: string): Promise<Coupon | undefined> {
    return this.repository.get(couponId);
  }
}
