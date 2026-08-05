import type { Coupon } from './Coupon';

/**
 * Contrato de persistência de Coupon — apenas o contrato, per Etapa 7. `update` existe apenas para
 * incrementar `redemptionsCount`, nunca para alterar `code`/`discountId` já emitidos.
 */
export interface CouponRepository {
  create(coupon: Coupon): Promise<Coupon>;
  update(coupon: Coupon): Promise<Coupon>;
  get(couponId: string): Promise<Coupon | undefined>;
  findByCode(code: string): Promise<Coupon | undefined>;
}
