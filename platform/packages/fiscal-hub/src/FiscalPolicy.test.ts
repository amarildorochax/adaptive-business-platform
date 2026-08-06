import { describe, expect, it } from 'vitest';
import {
  canTransitionFiscalDocumentStatus,
  canTransitionFiscalObligationStatus,
  computeTaxAmount,
  isFiscalObligationOverdue,
  isTaxRuleApplicable,
} from './FiscalPolicy';

describe('FiscalPolicy', () => {
  describe('canTransitionFiscalDocumentStatus', () => {
    it('permite Issued → Cancelled', () => {
      expect(canTransitionFiscalDocumentStatus('Issued', 'Cancelled')).toBe(true);
    });

    it('rejeita qualquer transição a partir de Cancelled — estado final', () => {
      expect(canTransitionFiscalDocumentStatus('Cancelled', 'Issued')).toBe(false);
    });

    it('rejeita transição para o mesmo estado', () => {
      expect(canTransitionFiscalDocumentStatus('Issued', 'Issued')).toBe(false);
    });
  });

  describe('canTransitionFiscalObligationStatus', () => {
    it('permite Pending → Fulfilled e Pending → Overdue', () => {
      expect(canTransitionFiscalObligationStatus('Pending', 'Fulfilled')).toBe(true);
      expect(canTransitionFiscalObligationStatus('Pending', 'Overdue')).toBe(true);
    });

    it('permite Overdue → Fulfilled', () => {
      expect(canTransitionFiscalObligationStatus('Overdue', 'Fulfilled')).toBe(true);
    });

    it('rejeita qualquer transição a partir de Fulfilled — estado final', () => {
      expect(canTransitionFiscalObligationStatus('Fulfilled', 'Pending')).toBe(false);
      expect(canTransitionFiscalObligationStatus('Fulfilled', 'Overdue')).toBe(false);
    });

    it('rejeita Overdue → Pending', () => {
      expect(canTransitionFiscalObligationStatus('Overdue', 'Pending')).toBe(false);
    });

    it('rejeita transição para o mesmo estado', () => {
      expect(canTransitionFiscalObligationStatus('Pending', 'Pending')).toBe(false);
    });
  });

  describe('isTaxRuleApplicable', () => {
    const base = { active: true, validFrom: new Date('2026-01-01'), validUntil: undefined as Date | undefined };

    it('aceita regra ativa e dentro da vigência sem data de término', () => {
      expect(isTaxRuleApplicable(base, new Date('2026-06-01'))).toBe(true);
    });

    it('rejeita regra inativa', () => {
      expect(isTaxRuleApplicable({ ...base, active: false }, new Date('2026-06-01'))).toBe(false);
    });

    it('rejeita data anterior a validFrom', () => {
      expect(isTaxRuleApplicable(base, new Date('2025-12-31'))).toBe(false);
    });

    it('rejeita data posterior a validUntil, quando informado', () => {
      const withEnd = { ...base, validUntil: new Date('2026-12-31') };
      expect(isTaxRuleApplicable(withEnd, new Date('2027-01-01'))).toBe(false);
      expect(isTaxRuleApplicable(withEnd, new Date('2026-12-31'))).toBe(true);
    });
  });

  describe('computeTaxAmount', () => {
    it('aplica alíquota percentual sobre a base', () => {
      const result = computeTaxAmount({ amount: 200, currencyCode: 'BRL' }, { type: 'Percentage', value: 18 });
      expect(result).toEqual({ amount: 36, currencyCode: 'BRL' });
    });

    it('aplica alíquota fixa, independente da base', () => {
      const result = computeTaxAmount({ amount: 200, currencyCode: 'BRL' }, { type: 'Fixed', value: 5 });
      expect(result).toEqual({ amount: 5, currencyCode: 'BRL' });
    });

    it('é determinístico — mesma entrada sempre produz a mesma saída', () => {
      const base = { amount: 123.45, currencyCode: 'BRL' };
      const rate = { type: 'Percentage' as const, value: 7.5 };
      expect(computeTaxAmount(base, rate)).toEqual(computeTaxAmount(base, rate));
    });
  });

  describe('isFiscalObligationOverdue', () => {
    it('true quando Pending e dueDate já passou', () => {
      expect(isFiscalObligationOverdue({ status: 'Pending', dueDate: new Date('2026-01-01') }, new Date('2026-02-01'))).toBe(
        true,
      );
    });

    it('true quando já Overdue e dueDate já passou', () => {
      expect(isFiscalObligationOverdue({ status: 'Overdue', dueDate: new Date('2026-01-01') }, new Date('2026-02-01'))).toBe(
        true,
      );
    });

    it('false quando dueDate ainda não passou', () => {
      expect(isFiscalObligationOverdue({ status: 'Pending', dueDate: new Date('2026-03-01') }, new Date('2026-02-01'))).toBe(
        false,
      );
    });

    it('false quando já Fulfilled, mesmo com dueDate no passado', () => {
      expect(isFiscalObligationOverdue({ status: 'Fulfilled', dueDate: new Date('2026-01-01') }, new Date('2026-02-01'))).toBe(
        false,
      );
    });
  });
});
