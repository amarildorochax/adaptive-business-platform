import { describe, expect, it } from 'vitest';
import { FiscalFactory } from './FiscalFactory';

describe('FiscalFactory', () => {
  const factory = new FiscalFactory();

  describe('createTaxRegime', () => {
    it('gera identificador e createdAt', () => {
      const regime = factory.createTaxRegime({ tenantId: 'tenant-1', name: 'Simples Nacional' });

      expect(regime.taxRegimeId).toBeTruthy();
      expect(regime.tenantId).toBe('tenant-1');
      expect(regime.name).toBe('Simples Nacional');
      expect(regime.createdAt).toBeInstanceOf(Date);
    });

    it('gera identificadores únicos entre chamadas', () => {
      const a = factory.createTaxRegime({ tenantId: 't', name: 'A' });
      const b = factory.createTaxRegime({ tenantId: 't', name: 'A' });
      expect(a.taxRegimeId).not.toBe(b.taxRegimeId);
    });
  });

  describe('createTaxRule', () => {
    it('gera identificador, active true por padrão, e preserva campos opcionais', () => {
      const rule = factory.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        rate: { type: 'Percentage', value: 18 },
        exemptionCondition: 'Exportação',
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2026-12-31'),
      });

      expect(rule.taxRuleId).toBeTruthy();
      expect(rule.active).toBe(true);
      expect(rule.exemptionCondition).toBe('Exportação');
      expect(rule.validUntil).toEqual(new Date('2026-12-31'));
      expect(rule.createdAt).toBeInstanceOf(Date);
      expect(rule.updatedAt).toBeInstanceOf(Date);
    });

    it('omite exemptionCondition/validUntil quando ausentes', () => {
      const rule = factory.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        rate: { type: 'Fixed', value: 5 },
        validFrom: new Date('2026-01-01'),
      });

      expect(rule.exemptionCondition).toBeUndefined();
      expect(rule.validUntil).toBeUndefined();
    });
  });

  describe('createTaxCalculation', () => {
    it('monta o registro com o amount já computado, sem recalculá-lo', () => {
      const calculation = factory.createTaxCalculation('line-1', 'rule-1', { amount: 36, currencyCode: 'BRL' });

      expect(calculation.taxCalculationId).toBeTruthy();
      expect(calculation.fiscalDocumentLineId).toBe('line-1');
      expect(calculation.taxRuleId).toBe('rule-1');
      expect(calculation.amount).toEqual({ amount: 36, currencyCode: 'BRL' });
      expect(calculation.calculatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createFiscalDocument', () => {
    const taxCalculation = {
      taxCalculationId: 'calc-1',
      fiscalDocumentLineId: 'line-1',
      taxRuleId: 'rule-1',
      amount: { amount: 1.8, currencyCode: 'BRL' },
      calculatedAt: new Date(),
    };

    it('gera identificador, status Issued por padrão, e preserva as linhas', () => {
      const document = factory.createFiscalDocument({
        tenantId: 'tenant-1',
        type: 'Sale',
        orderId: 'order-1',
        lines: [
          {
            fiscalDocumentLineId: 'line-1',
            productId: 'product-1',
            quantity: 2,
            unitValue: { amount: 10, currencyCode: 'BRL' },
            classification: { code: '1234' },
            taxCalculation,
          },
        ],
      });

      expect(document.fiscalDocumentId).toBeTruthy();
      expect(document.status).toBe('Issued');
      expect(document.orderId).toBe('order-1');
      expect(document.invoiceId).toBeUndefined();
      expect(document.lines).toHaveLength(1);
      expect(document.lines[0].fiscalDocumentLineId).toBe('line-1');
      expect(document.lines[0].taxCalculation).toEqual(taxCalculation);
      expect(document.issuedAt).toBeInstanceOf(Date);
      expect(document.cancelledAt).toBeUndefined();
    });

    it('aceita documento sem nenhuma linha — nenhum mínimo estrutural imposto', () => {
      const document = factory.createFiscalDocument({
        tenantId: 'tenant-1',
        type: 'Sale',
        invoiceId: 'invoice-1',
        lines: [],
      });

      expect(document.lines).toEqual([]);
    });
  });

  describe('createFiscalObligation', () => {
    it('gera identificador e status Pending por padrão', () => {
      const obligation = factory.createFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-09-20'),
      });

      expect(obligation.fiscalObligationId).toBeTruthy();
      expect(obligation.status).toBe('Pending');
      expect(obligation.fulfilledAt).toBeUndefined();
      expect(obligation.dueDate).toEqual(new Date('2026-09-20'));
    });

    it('gera identificadores únicos entre chamadas', () => {
      const a = factory.createFiscalObligation({ tenantId: 't', type: 'A', periodicity: 'B', dueDate: new Date() });
      const b = factory.createFiscalObligation({ tenantId: 't', type: 'A', periodicity: 'B', dueDate: new Date() });
      expect(a.fiscalObligationId).not.toBe(b.fiscalObligationId);
    });
  });
});
