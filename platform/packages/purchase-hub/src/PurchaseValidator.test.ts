import { describe, expect, it } from 'vitest';
import { PurchaseValidator } from './PurchaseValidator';

describe('PurchaseValidator', () => {
  const validator = new PurchaseValidator();

  it('ensureValidMoney lança InvalidMoneyError para valor negativo', () => {
    expect(() => validator.ensureValidMoney({ amount: -1, currencyCode: 'BRL' })).toThrow(/inválido/);
  });

  it('ensureValidMoney não lança para Money válido', () => {
    expect(() => validator.ensureValidMoney({ amount: 10, currencyCode: 'BRL' })).not.toThrow();
  });

  it('ensureValidReceivingLine lança InvalidReceivingLineError para quantidade não positiva', () => {
    expect(() =>
      validator.ensureValidReceivingLine({ purchaseOrderItemId: 'item-1', quantityReceived: 0 }),
    ).toThrow(/inválida/);
  });

  it('ensurePurchaseOrderStatusTransitionAllowed lança para transição ilegítima', () => {
    expect(() => validator.ensurePurchaseOrderStatusTransitionAllowed('Draft', 'Approved')).toThrow(
      /Transição de status de Purchase Order inválida/,
    );
  });

  it('ensurePurchaseOrderStatusTransitionAllowed não lança para transição legítima', () => {
    expect(() => validator.ensurePurchaseOrderStatusTransitionAllowed('Draft', 'PendingApproval')).not.toThrow();
  });

  it('ensureCanAddPurchaseOrderItem lança quando o Purchase Order já saiu da fase de montagem', () => {
    expect(() => validator.ensureCanAddPurchaseOrderItem('po-1', 'Sent')).toThrow(/não aceita novos itens/);
  });

  it('ensureApprovalIdentityProvided lança quando o total excede o threshold e nenhuma identidade é informada', () => {
    expect(() =>
      validator.ensureApprovalIdentityProvided(
        'po-1',
        { amount: 500, currencyCode: 'BRL' },
        { limit: { amount: 100, currencyCode: 'BRL' } },
        undefined,
      ),
    ).toThrow(/requer uma identidade de aprovação explícita/);
  });

  it('ensureApprovalIdentityProvided não lança quando dentro do threshold', () => {
    expect(() =>
      validator.ensureApprovalIdentityProvided(
        'po-1',
        { amount: 50, currencyCode: 'BRL' },
        { limit: { amount: 100, currencyCode: 'BRL' } },
        undefined,
      ),
    ).not.toThrow();
  });

  it('ensureApprovalIdentityProvided não lança quando acima do threshold mas uma identidade é informada', () => {
    expect(() =>
      validator.ensureApprovalIdentityProvided(
        'po-1',
        { amount: 500, currencyCode: 'BRL' },
        { limit: { amount: 100, currencyCode: 'BRL' } },
        'identity-1',
      ),
    ).not.toThrow();
  });

  it('ensureCanCancelPurchaseOrder lança PurchaseOrderHasReceivingCannotCancelError após qualquer Receiving', () => {
    expect(() => validator.ensureCanCancelPurchaseOrder('po-1', 'PartiallyReceived')).toThrow(
      /já possui Receiving registrado/,
    );
    expect(() => validator.ensureCanCancelPurchaseOrder('po-1', 'Received')).toThrow(/já possui Receiving registrado/);
  });

  it('ensureCanCancelPurchaseOrder não lança para status ainda cancelável', () => {
    expect(() => validator.ensureCanCancelPurchaseOrder('po-1', 'Approved')).not.toThrow();
  });

  it('ensureReceivingWithinPending lança quando a quantidade recebida excede a pendente', () => {
    expect(() =>
      validator.ensureReceivingWithinPending(
        { purchaseOrderItemId: 'item-1', quantityOrdered: 10, quantityReceived: 8 },
        5,
      ),
    ).toThrow(/excede a quantidade ainda pendente/);
  });

  it('ensureReceivingWithinPending não lança quando a quantidade recebida está dentro da pendente', () => {
    expect(() =>
      validator.ensureReceivingWithinPending(
        { purchaseOrderItemId: 'item-1', quantityOrdered: 10, quantityReceived: 8 },
        2,
      ),
    ).not.toThrow();
  });

  it('ensureRequisitionStatusTransitionAllowed lança para transição ilegítima', () => {
    expect(() => validator.ensureRequisitionStatusTransitionAllowed('Rejected', 'Approved')).toThrow(
      /Transição de status de Purchase Requisition inválida/,
    );
  });

  it('ensureRequisitionApproved lança quando a Requisition não está aprovada', () => {
    expect(() => validator.ensureRequisitionApproved('req-1', 'Open')).toThrow(/não está aprovada/);
  });

  it('ensureAcquisitionCostProvided lança MissingAcquisitionCostError quando nenhum custo é informado', () => {
    expect(() => validator.ensureAcquisitionCostProvided('product-1', undefined)).toThrow(
      /Nenhum custo de aquisição foi informado/,
    );
  });

  it('ensureAcquisitionCostProvided lança quando o custo informado é um Money inválido', () => {
    expect(() => validator.ensureAcquisitionCostProvided('product-1', { amount: -1, currencyCode: 'BRL' })).toThrow(
      /inválido/,
    );
  });
});
