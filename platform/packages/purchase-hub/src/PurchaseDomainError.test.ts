import { describe, expect, it } from 'vitest';
import {
  InvalidMoneyError,
  InvalidReceivingLineError,
  MissingAcquisitionCostError,
  PurchaseOrderApprovalRequiresIdentityError,
  PurchaseOrderHasReceivingCannotCancelError,
  PurchaseOrderInvalidStatusTransitionError,
  PurchaseOrderItemAdditionNotAllowedError,
  PurchaseOrderItemNotFoundError,
  PurchaseOrderNotFoundError,
  PurchaseRequisitionInvalidStatusTransitionError,
  PurchaseRequisitionNotApprovedError,
  PurchaseRequisitionNotFoundError,
  ReceivingQuantityExceedsPendingError,
  ReorderRuleNotFoundError,
} from './PurchaseDomainError';

describe('PurchaseDomainError', () => {
  it('cada erro carrega um code estável e distinto, útil para tratamento programático', () => {
    expect(new PurchaseOrderNotFoundError('po-1').code).toBe('PURCHASE_ORDER_NOT_FOUND');
    expect(new PurchaseOrderItemNotFoundError('item-1').code).toBe('PURCHASE_ORDER_ITEM_NOT_FOUND');
    expect(new PurchaseOrderItemAdditionNotAllowedError('po-1', 'Sent').code).toBe(
      'PURCHASE_ORDER_ITEM_ADDITION_NOT_ALLOWED',
    );
    expect(new PurchaseOrderInvalidStatusTransitionError('Draft', 'Approved').code).toBe(
      'PURCHASE_ORDER_INVALID_STATUS_TRANSITION',
    );
    expect(new PurchaseOrderApprovalRequiresIdentityError('po-1').code).toBe(
      'PURCHASE_ORDER_APPROVAL_REQUIRES_IDENTITY',
    );
    expect(new PurchaseOrderHasReceivingCannotCancelError('po-1').code).toBe(
      'PURCHASE_ORDER_HAS_RECEIVING_CANNOT_CANCEL',
    );
    expect(new ReceivingQuantityExceedsPendingError('item-1').code).toBe('RECEIVING_QUANTITY_EXCEEDS_PENDING');
    expect(new InvalidMoneyError().code).toBe('PURCHASE_INVALID_MONEY');
    expect(new InvalidReceivingLineError().code).toBe('PURCHASE_INVALID_RECEIVING_LINE');
    expect(new PurchaseRequisitionNotFoundError('req-1').code).toBe('PURCHASE_REQUISITION_NOT_FOUND');
    expect(new PurchaseRequisitionInvalidStatusTransitionError('Open', 'Approved').code).toBe(
      'PURCHASE_REQUISITION_INVALID_STATUS_TRANSITION',
    );
    expect(new PurchaseRequisitionNotApprovedError('req-1').code).toBe('PURCHASE_REQUISITION_NOT_APPROVED');
    expect(new MissingAcquisitionCostError('product-1').code).toBe('PURCHASE_MISSING_ACQUISITION_COST');
    expect(new ReorderRuleNotFoundError('rule-1').code).toBe('REORDER_RULE_NOT_FOUND');
  });

  it('cada erro é uma instância real de Error, com name derivado da própria classe', () => {
    const error = new PurchaseOrderNotFoundError('po-1');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('PurchaseOrderNotFoundError');
    expect(error.message).toContain('po-1');
  });
});
