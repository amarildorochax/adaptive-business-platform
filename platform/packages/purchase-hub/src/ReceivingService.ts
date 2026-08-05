import { PurchaseFactory, type CreateReceivingInput } from './PurchaseFactory';
import { PurchaseOrderNotFoundError } from './PurchaseDomainError';
import type { PurchaseOrder } from './PurchaseOrder';
import type { PurchaseOrderRepository } from './PurchaseOrderRepository';
import type { Receiving } from './Receiving';
import type { ReceivingRepository } from './ReceivingRepository';
import { PurchaseValidator } from './PurchaseValidator';

export interface RegisterReceivingResult {
  readonly receiving: Receiving;
  readonly purchaseOrder: PurchaseOrder;
  readonly fullyReceived: boolean;
}

/**
 * ReceivingService — encapsula o recebimento físico de mercadoria contra um Purchase Order,
 * atualizando `quantityReceived`/`status` de cada item afetado e o status geral do Purchase Order.
 * Um dos três Services explicitamente nomeados por `PURCHASE_HUB.md`, Capítulo 11. Cada `Receiving`
 * é imutável assim que criado — nenhum método de atualização existe neste Service.
 */
export class ReceivingService {
  private readonly factory = new PurchaseFactory();
  private readonly validator = new PurchaseValidator();

  constructor(
    private readonly receivingRepository: ReceivingRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
  ) {}

  async register(input: CreateReceivingInput): Promise<RegisterReceivingResult> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(input.purchaseOrderId);

    if (!purchaseOrder) {
      throw new PurchaseOrderNotFoundError(input.purchaseOrderId);
    }

    for (const line of input.lines) {
      this.validator.ensureValidReceivingLine(line);
    }

    const updatedItems = purchaseOrder.items.map((item) => {
      const line = input.lines.find((candidate) => candidate.purchaseOrderItemId === item.purchaseOrderItemId);

      if (!line) {
        return item;
      }

      this.validator.ensureReceivingWithinPending(item, line.quantityReceived);
      const quantityReceived = item.quantityReceived + line.quantityReceived;

      return {
        ...item,
        quantityReceived,
        status: quantityReceived === item.quantityOrdered ? ('Received' as const) : ('PartiallyReceived' as const),
      };
    });

    const fullyReceived = updatedItems.every((item) => item.status === 'Received' || item.status === 'Cancelled');
    const nextStatus = fullyReceived ? 'Received' : 'PartiallyReceived';

    this.validator.ensurePurchaseOrderStatusTransitionAllowed(purchaseOrder.status, nextStatus);

    const updatedPurchaseOrder = await this.purchaseOrderRepository.update({
      ...purchaseOrder,
      items: updatedItems,
      status: nextStatus,
      updatedAt: new Date(),
    });

    const receiving = await this.receivingRepository.create(this.factory.createReceiving(input));

    return { receiving, purchaseOrder: updatedPurchaseOrder, fullyReceived };
  }

  async listByPurchaseOrder(purchaseOrderId: string): Promise<readonly Receiving[]> {
    return this.receivingRepository.findByPurchaseOrder(purchaseOrderId);
  }
}
