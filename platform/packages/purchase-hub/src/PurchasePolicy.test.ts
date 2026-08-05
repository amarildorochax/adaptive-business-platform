import { describe, expect, it } from 'vitest';
import {
  canAddPurchaseOrderItem,
  canTransitionPurchaseOrderStatus,
  canTransitionRequisitionStatus,
  shouldTriggerReorder,
} from './PurchasePolicy';

describe('PurchasePolicy', () => {
  describe('canTransitionPurchaseOrderStatus', () => {
    it('permite o fluxo feliz completo: Draft → PendingApproval → Approved → Sent → PartiallyReceived → Received', () => {
      expect(canTransitionPurchaseOrderStatus('Draft', 'PendingApproval')).toBe(true);
      expect(canTransitionPurchaseOrderStatus('PendingApproval', 'Approved')).toBe(true);
      expect(canTransitionPurchaseOrderStatus('Approved', 'Sent')).toBe(true);
      expect(canTransitionPurchaseOrderStatus('Sent', 'PartiallyReceived')).toBe(true);
      expect(canTransitionPurchaseOrderStatus('PartiallyReceived', 'Received')).toBe(true);
    });

    it('permite Sent → Received diretamente, quando o primeiro Receiving já esgota o pedido', () => {
      expect(canTransitionPurchaseOrderStatus('Sent', 'Received')).toBe(true);
    });

    it('permite PartiallyReceived → PartiallyReceived — múltiplos recebimentos parciais consecutivos', () => {
      expect(canTransitionPurchaseOrderStatus('PartiallyReceived', 'PartiallyReceived')).toBe(true);
    });

    it('permite cancelamento a partir de Draft, PendingApproval, Approved e Sent', () => {
      expect(canTransitionPurchaseOrderStatus('Draft', 'Cancelled')).toBe(true);
      expect(canTransitionPurchaseOrderStatus('PendingApproval', 'Cancelled')).toBe(true);
      expect(canTransitionPurchaseOrderStatus('Approved', 'Cancelled')).toBe(true);
      expect(canTransitionPurchaseOrderStatus('Sent', 'Cancelled')).toBe(true);
    });

    it('rejeita cancelamento a partir de PartiallyReceived ou Received — nunca após Receiving', () => {
      expect(canTransitionPurchaseOrderStatus('PartiallyReceived', 'Cancelled')).toBe(false);
      expect(canTransitionPurchaseOrderStatus('Received', 'Cancelled')).toBe(false);
    });

    it('rejeita qualquer transição a partir de Received ou Cancelled — estados finais', () => {
      expect(canTransitionPurchaseOrderStatus('Received', 'Draft')).toBe(false);
      expect(canTransitionPurchaseOrderStatus('Cancelled', 'Draft')).toBe(false);
    });

    it('rejeita transições para o mesmo estado fora de PartiallyReceived → PartiallyReceived', () => {
      expect(canTransitionPurchaseOrderStatus('Draft', 'Draft')).toBe(false);
      expect(canTransitionPurchaseOrderStatus('Approved', 'Approved')).toBe(false);
    });

    it('rejeita saltos que pulam etapas obrigatórias, como Draft → Approved', () => {
      expect(canTransitionPurchaseOrderStatus('Draft', 'Approved')).toBe(false);
      expect(canTransitionPurchaseOrderStatus('Draft', 'Sent')).toBe(false);
    });
  });

  describe('canAddPurchaseOrderItem', () => {
    it('permite adicionar item em Draft e PendingApproval', () => {
      expect(canAddPurchaseOrderItem('Draft')).toBe(true);
      expect(canAddPurchaseOrderItem('PendingApproval')).toBe(true);
    });

    it('rejeita adicionar item após Approved, Sent ou qualquer Receiving', () => {
      expect(canAddPurchaseOrderItem('Approved')).toBe(false);
      expect(canAddPurchaseOrderItem('Sent')).toBe(false);
      expect(canAddPurchaseOrderItem('PartiallyReceived')).toBe(false);
      expect(canAddPurchaseOrderItem('Received')).toBe(false);
      expect(canAddPurchaseOrderItem('Cancelled')).toBe(false);
    });
  });

  describe('canTransitionRequisitionStatus', () => {
    it('permite Open → Approved e Open → Rejected', () => {
      expect(canTransitionRequisitionStatus('Open', 'Approved')).toBe(true);
      expect(canTransitionRequisitionStatus('Open', 'Rejected')).toBe(true);
    });

    it('permite Approved → ConvertedToPurchaseOrder', () => {
      expect(canTransitionRequisitionStatus('Approved', 'ConvertedToPurchaseOrder')).toBe(true);
    });

    it('rejeita transições a partir de estados finais (Rejected, ConvertedToPurchaseOrder)', () => {
      expect(canTransitionRequisitionStatus('Rejected', 'Approved')).toBe(false);
      expect(canTransitionRequisitionStatus('ConvertedToPurchaseOrder', 'Approved')).toBe(false);
    });

    it('rejeita transição para o mesmo estado', () => {
      expect(canTransitionRequisitionStatus('Open', 'Open')).toBe(false);
    });
  });

  describe('shouldTriggerReorder', () => {
    it('dispara quando a Regra está ativa e a quantidade corrente está no ou abaixo do threshold', () => {
      expect(shouldTriggerReorder({ active: true, thresholdQuantity: 10 }, 10)).toBe(true);
      expect(shouldTriggerReorder({ active: true, thresholdQuantity: 10 }, 5)).toBe(true);
    });

    it('não dispara quando a quantidade corrente está acima do threshold', () => {
      expect(shouldTriggerReorder({ active: true, thresholdQuantity: 10 }, 11)).toBe(false);
    });

    it('nunca dispara para uma Regra inativa, mesmo abaixo do threshold', () => {
      expect(shouldTriggerReorder({ active: false, thresholdQuantity: 10 }, 0)).toBe(false);
    });
  });
});
