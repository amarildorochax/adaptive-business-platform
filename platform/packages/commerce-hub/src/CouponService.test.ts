import { describe, expect, it } from 'vitest';
import { CouponService } from './CouponService';
import { FakeCouponRepository } from './testing/InMemoryFakes';

describe('CouponService', () => {
  it('redeem incrementa redemptionsCount', async () => {
    const service = new CouponService(new FakeCouponRepository());
    const coupon = await service.create('discount-1', 'BEMVINDO10', 2);

    const redeemed = await service.redeem(coupon.code);

    expect(redeemed.redemptionsCount).toBe(1);
  });

  it('redeem falha ao atingir o limite de resgates', async () => {
    const service = new CouponService(new FakeCouponRepository());
    const coupon = await service.create('discount-1', 'LIMITADO', 1);
    await service.redeem(coupon.code);

    await expect(service.redeem(coupon.code)).rejects.toThrow();
  });
});
