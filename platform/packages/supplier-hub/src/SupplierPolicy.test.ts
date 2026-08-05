import { describe, expect, it } from 'vitest';
import { canTransitionStatus, isEligibleForNewPurchaseOrder } from './SupplierPolicy';

describe('SupplierPolicy', () => {
  describe('canTransitionStatus', () => {
    it('permite Active → Disabled', () => {
      expect(canTransitionStatus('Active', 'Disabled')).toBe(true);
    });

    it('permite Disabled → Active', () => {
      expect(canTransitionStatus('Disabled', 'Active')).toBe(true);
    });

    it('rejeita Active → Active', () => {
      expect(canTransitionStatus('Active', 'Active')).toBe(false);
    });

    it('rejeita Disabled → Disabled', () => {
      expect(canTransitionStatus('Disabled', 'Disabled')).toBe(false);
    });
  });

  describe('isEligibleForNewPurchaseOrder', () => {
    it('é elegível quando Active — predicado exposto para consumo futuro do Purchase Hub', () => {
      expect(isEligibleForNewPurchaseOrder({ status: 'Active' })).toBe(true);
    });

    it('não é elegível quando Disabled', () => {
      expect(isEligibleForNewPurchaseOrder({ status: 'Disabled' })).toBe(false);
    });
  });
});
