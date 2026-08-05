import type { Receiving } from './Receiving';

/**
 * ReceivingRepository — contrato de persistência de Receiving. Interface apenas — nenhuma
 * implementação é definida por esta Sprint; persistência é escopo de IMP-302 (`PURCHASE_HUB.md`,
 * Capítulo 10). Cada `Receiving` é imutável assim que criado — nenhum método `update` existe.
 */
export interface ReceivingRepository {
  create(receiving: Receiving): Promise<Receiving>;
  findByPurchaseOrder(purchaseOrderId: string): Promise<readonly Receiving[]>;
}
