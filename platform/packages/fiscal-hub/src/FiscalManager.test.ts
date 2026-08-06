import { beforeEach, describe, expect, it } from 'vitest';
import { FiscalDocumentIssuanceService } from './FiscalDocumentIssuanceService';
import {
  DuplicateTaxRegimeError,
  FiscalDocumentInvalidStatusTransitionError,
  FiscalDocumentMissingOriginError,
  FiscalDocumentNotFoundError,
  FiscalObligationInvalidStatusTransitionError,
  FiscalObligationNotFoundError,
  NoApplicableTaxRuleFoundError,
  TaxRuleNotFoundError,
} from './FiscalDomainError';
import { FiscalManager } from './FiscalManager';
import { FiscalObligationTrackingService } from './FiscalObligationTrackingService';
import {
  FakeFiscalDocumentRepository,
  FakeFiscalObligationRepository,
  FakeTaxRegimeRepository,
  FakeTaxRuleRepository,
} from './testing/InMemoryFakes';
import { TaxCalculationService } from './TaxCalculationService';
import { TaxRegimeService } from './TaxRegimeService';
import { TaxRuleService } from './TaxRuleService';

function createManager() {
  const taxRegimeRepository = new FakeTaxRegimeRepository();
  const taxRuleRepository = new FakeTaxRuleRepository();
  const fiscalDocumentRepository = new FakeFiscalDocumentRepository();
  const fiscalObligationRepository = new FakeFiscalObligationRepository();

  const manager = new FiscalManager({
    taxRegimes: new TaxRegimeService(taxRegimeRepository),
    taxRules: new TaxRuleService(taxRuleRepository),
    taxCalculation: new TaxCalculationService(taxRuleRepository),
    documents: new FiscalDocumentIssuanceService(fiscalDocumentRepository),
    obligations: new FiscalObligationTrackingService(fiscalObligationRepository),
  });

  return { manager, taxRegimeRepository, taxRuleRepository, fiscalDocumentRepository, fiscalObligationRepository };
}

describe('FiscalManager', () => {
  let ctx: ReturnType<typeof createManager>;

  beforeEach(() => {
    ctx = createManager();
  });

  describe('registerTaxRegime', () => {
    it('registra o Tax Regime e não publica nenhum Evento — incompletude documentada do catálogo', async () => {
      const { result, command, events } = await ctx.manager.registerTaxRegime({
        tenantId: 'tenant-1',
        name: 'Simples Nacional',
      });

      expect(result.name).toBe('Simples Nacional');
      expect(command.type).toBe('RegisterTaxRegime');
      expect(events).toEqual([]);
    });

    it('rejeita um segundo Tax Regime para o mesmo Tenant', async () => {
      await ctx.manager.registerTaxRegime({ tenantId: 'tenant-1', name: 'Simples Nacional' });

      await expect(ctx.manager.registerTaxRegime({ tenantId: 'tenant-1', name: 'Lucro Presumido' })).rejects.toThrow(
        DuplicateTaxRegimeError,
      );
    });
  });

  describe('createTaxRule', () => {
    it('cria a regra e publica TaxRuleCreated', async () => {
      const { result: regime } = await ctx.manager.registerTaxRegime({ tenantId: 'tenant-1', name: 'Simples Nacional' });

      const { result, command, events } = await ctx.manager.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: regime.taxRegimeId,
        classification: { code: '1234' },
        rate: { type: 'Percentage', value: 18 },
        validFrom: new Date('2026-01-01'),
      });

      expect(result.active).toBe(true);
      expect(command.type).toBe('CreateTaxRule');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('TaxRuleCreated');
      expect(events[0].taxRuleId).toBe(result.taxRuleId);
    });
  });

  describe('deactivateTaxRule', () => {
    it('desativa a regra e não publica nenhum Evento — incompletude documentada do catálogo', async () => {
      const { result: rule } = await ctx.manager.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        rate: { type: 'Percentage', value: 18 },
        validFrom: new Date('2026-01-01'),
      });

      const { result, command, events } = await ctx.manager.deactivateTaxRule(rule.taxRuleId);

      expect(result.active).toBe(false);
      expect(command.type).toBe('DeactivateTaxRule');
      expect(events).toEqual([]);
    });

    it('rejeita identificador inexistente', async () => {
      await expect(ctx.manager.deactivateTaxRule('nao-existe')).rejects.toThrow(TaxRuleNotFoundError);
    });
  });

  describe('calculateTax', () => {
    it('calcula o imposto pela regra vigente e publica TaxCalculated', async () => {
      await ctx.manager.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        rate: { type: 'Percentage', value: 18 },
        validFrom: new Date('2026-01-01'),
      });

      const { result, command, events } = await ctx.manager.calculateTax({
        fiscalDocumentLineId: 'line-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        baseAmount: { amount: 200, currencyCode: 'BRL' },
        calculationDate: new Date('2026-06-01'),
      });

      expect(result.amount).toEqual({ amount: 36, currencyCode: 'BRL' });
      expect(result.fiscalDocumentLineId).toBe('line-1');
      expect(command.type).toBe('CalculateTax');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('TaxCalculated');
      expect(events[0].fiscalDocumentLineId).toBe('line-1');
      expect(events[0].taxRuleId).toBe(result.taxRuleId);
    });

    it('rejeita quando nenhuma Tax Rule vigente é encontrada', async () => {
      await expect(
        ctx.manager.calculateTax({
          fiscalDocumentLineId: 'line-1',
          taxRegimeId: 'regime-sem-regra',
          classification: { code: '9999' },
          baseAmount: { amount: 100, currencyCode: 'BRL' },
        }),
      ).rejects.toThrow(NoApplicableTaxRuleFoundError);
    });

    it('nunca considera uma Tax Rule desativada', async () => {
      const { result: rule } = await ctx.manager.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        rate: { type: 'Percentage', value: 18 },
        validFrom: new Date('2026-01-01'),
      });
      await ctx.manager.deactivateTaxRule(rule.taxRuleId);

      await expect(
        ctx.manager.calculateTax({
          fiscalDocumentLineId: 'line-1',
          taxRegimeId: 'regime-1',
          classification: { code: '1234' },
          baseAmount: { amount: 100, currencyCode: 'BRL' },
        }),
      ).rejects.toThrow(NoApplicableTaxRuleFoundError);
    });
  });

  describe('issueFiscalDocument / cancelFiscalDocument', () => {
    async function calculateAndBuildLine(fiscalDocumentLineId: string) {
      await ctx.manager.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        rate: { type: 'Percentage', value: 18 },
        validFrom: new Date('2026-01-01'),
      });

      const { result: taxCalculation } = await ctx.manager.calculateTax({
        fiscalDocumentLineId,
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        baseAmount: { amount: 200, currencyCode: 'BRL' },
      });

      return {
        fiscalDocumentLineId,
        productId: 'product-1',
        quantity: 1,
        unitValue: { amount: 200, currencyCode: 'BRL' },
        classification: { code: '1234' },
        taxCalculation,
      };
    }

    it('emite o documento com o Tax Calculation já aplicado a cada linha e publica FiscalDocumentIssued', async () => {
      const line = await calculateAndBuildLine('line-1');

      const { result, command, events } = await ctx.manager.issueFiscalDocument({
        tenantId: 'tenant-1',
        type: 'Sale',
        orderId: 'order-1',
        lines: [line],
      });

      expect(result.status).toBe('Issued');
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].taxCalculation.amount).toEqual({ amount: 36, currencyCode: 'BRL' });
      expect(command.type).toBe('IssueFiscalDocument');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('FiscalDocumentIssued');
      expect(events[0].fiscalDocumentId).toBe(result.fiscalDocumentId);
    });

    it('rejeita emissão sem orderId nem invoiceId', async () => {
      const line = await calculateAndBuildLine('line-1');

      await expect(
        ctx.manager.issueFiscalDocument({ tenantId: 'tenant-1', type: 'Sale', lines: [line] }),
      ).rejects.toThrow(FiscalDocumentMissingOriginError);
    });

    it('cancela um documento emitido e publica FiscalDocumentCancelled', async () => {
      const line = await calculateAndBuildLine('line-1');
      const { result: document } = await ctx.manager.issueFiscalDocument({
        tenantId: 'tenant-1',
        type: 'Sale',
        invoiceId: 'invoice-1',
        lines: [line],
      });

      const { result, command, events } = await ctx.manager.cancelFiscalDocument(document.fiscalDocumentId, 'Erro de emissão');

      expect(result.status).toBe('Cancelled');
      expect(result.cancelReason).toBe('Erro de emissão');
      expect(command.type).toBe('CancelFiscalDocument');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('FiscalDocumentCancelled');
    });

    it('rejeita cancelar um documento já cancelado', async () => {
      const line = await calculateAndBuildLine('line-1');
      const { result: document } = await ctx.manager.issueFiscalDocument({
        tenantId: 'tenant-1',
        type: 'Sale',
        orderId: 'order-1',
        lines: [line],
      });
      await ctx.manager.cancelFiscalDocument(document.fiscalDocumentId, 'Primeiro cancelamento');

      await expect(ctx.manager.cancelFiscalDocument(document.fiscalDocumentId, 'Segundo cancelamento')).rejects.toThrow(
        FiscalDocumentInvalidStatusTransitionError,
      );
    });

    it('rejeita cancelar um documento inexistente', async () => {
      await expect(ctx.manager.cancelFiscalDocument('nao-existe', 'motivo')).rejects.toThrow(FiscalDocumentNotFoundError);
    });
  });

  describe('registerFiscalObligation / markFiscalObligationFulfilled', () => {
    it('registra a obrigação e publica FiscalObligationRegistered', async () => {
      const { result, command, events } = await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-09-20'),
      });

      expect(result.status).toBe('Pending');
      expect(command.type).toBe('RegisterFiscalObligation');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('FiscalObligationRegistered');
      expect(events[0].fiscalObligationId).toBe(result.fiscalObligationId);
    });

    it('marca a obrigação como cumprida e não publica nenhum Evento — incompletude documentada do catálogo', async () => {
      const { result: obligation } = await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-09-20'),
      });

      const { result, command, events } = await ctx.manager.markFiscalObligationFulfilled(obligation.fiscalObligationId);

      expect(result.status).toBe('Fulfilled');
      expect(result.fulfilledAt).toBeInstanceOf(Date);
      expect(command.type).toBe('MarkFiscalObligationFulfilled');
      expect(events).toEqual([]);
    });

    it('rejeita marcar como cumprida uma obrigação já cumprida', async () => {
      const { result: obligation } = await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-09-20'),
      });
      await ctx.manager.markFiscalObligationFulfilled(obligation.fiscalObligationId);

      await expect(ctx.manager.markFiscalObligationFulfilled(obligation.fiscalObligationId)).rejects.toThrow(
        FiscalObligationInvalidStatusTransitionError,
      );
    });

    it('rejeita identificador inexistente', async () => {
      await expect(ctx.manager.markFiscalObligationFulfilled('nao-existe')).rejects.toThrow(FiscalObligationNotFoundError);
    });
  });

  describe('evaluateFiscalObligations', () => {
    it('transiciona para Overdue apenas as obrigações pendentes com dueDate ultrapassada, publicando FiscalObligationOverdue para cada uma', async () => {
      const { result: overdueOne } = await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-01-10'),
      });
      const { result: notYetDue } = await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-12-31'),
      });

      const { result, events } = await ctx.manager.evaluateFiscalObligations(new Date('2026-02-01'));

      expect(result.overdue).toHaveLength(1);
      expect(result.overdue[0].fiscalObligationId).toBe(overdueOne.fiscalObligationId);
      expect(result.overdue[0].status).toBe('Overdue');
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('FiscalObligationOverdue');
      expect(events[0].fiscalObligationId).toBe(overdueOne.fiscalObligationId);

      const stillPending = await ctx.manager.listPendingFiscalObligations();
      expect(stillPending.map((o) => o.fiscalObligationId)).toEqual([notYetDue.fiscalObligationId]);
    });

    it('não republica FiscalObligationOverdue para uma obrigação já vencida em uma avaliação anterior', async () => {
      await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-01-10'),
      });

      await ctx.manager.evaluateFiscalObligations(new Date('2026-02-01'));
      const second = await ctx.manager.evaluateFiscalObligations(new Date('2026-03-01'));

      expect(second.result.overdue).toEqual([]);
      expect(second.events).toEqual([]);
    });

    it('retorna vazio quando nenhuma obrigação pendente está vencida', async () => {
      await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-12-31'),
      });

      const { result, events } = await ctx.manager.evaluateFiscalObligations(new Date('2026-02-01'));

      expect(result.overdue).toEqual([]);
      expect(events).toEqual([]);
    });
  });

  describe('queries', () => {
    it('getTaxRegime / getTaxRule / getFiscalDocument retornam undefined quando ausentes', async () => {
      expect(await ctx.manager.getTaxRegime('tenant-x')).toBeUndefined();
      expect(await ctx.manager.getTaxRule('rule-x')).toBeUndefined();
      expect(await ctx.manager.getFiscalDocument('doc-x')).toBeUndefined();
    });

    it('listFiscalDocumentsByOrigin filtra por orderId', async () => {
      await ctx.manager.createTaxRule({
        tenantId: 'tenant-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        rate: { type: 'Fixed', value: 5 },
        validFrom: new Date('2026-01-01'),
      });
      const { result: calc } = await ctx.manager.calculateTax({
        fiscalDocumentLineId: 'line-1',
        taxRegimeId: 'regime-1',
        classification: { code: '1234' },
        baseAmount: { amount: 100, currencyCode: 'BRL' },
      });

      const line = {
        fiscalDocumentLineId: 'line-1',
        productId: 'product-1',
        quantity: 1,
        unitValue: { amount: 100, currencyCode: 'BRL' },
        classification: { code: '1234' },
        taxCalculation: calc,
      };

      await ctx.manager.issueFiscalDocument({ tenantId: 'tenant-1', type: 'Sale', orderId: 'order-1', lines: [line] });
      await ctx.manager.issueFiscalDocument({ tenantId: 'tenant-1', type: 'Sale', orderId: 'order-2', lines: [line] });

      const forOrderOne = await ctx.manager.listFiscalDocumentsByOrigin('order-1');
      expect(forOrderOne).toHaveLength(1);
      expect(forOrderOne[0].orderId).toBe('order-1');
    });

    it('listOverdueFiscalObligations reflete apenas obrigações já avaliadas como vencidas', async () => {
      await ctx.manager.registerFiscalObligation({
        tenantId: 'tenant-1',
        type: 'Declaração',
        periodicity: 'Mensal',
        dueDate: new Date('2026-01-10'),
      });

      expect(await ctx.manager.listOverdueFiscalObligations()).toEqual([]);

      await ctx.manager.evaluateFiscalObligations(new Date('2026-02-01'));

      const overdue = await ctx.manager.listOverdueFiscalObligations();
      expect(overdue).toHaveLength(1);
    });
  });
});
