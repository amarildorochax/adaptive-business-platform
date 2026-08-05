/**
 * ReceivingLine — quantidade efetivamente recebida de um `PurchaseOrderItem` específico, dentro de
 * um evento de `Receiving`. Value Object imutável — nunca referenciado por identificador próprio,
 * sempre parte interna de `Receiving.lines` (`PURCHASE_HUB.md`, Capítulo 6).
 */
export interface ReceivingLine {
  /** Item do Purchase Order ao qual esta linha se refere. */
  readonly purchaseOrderItemId: string;

  /** Quantidade recebida nesta linha — sempre positiva. */
  readonly quantityReceived: number;
}

export function isValidReceivingLine(line: ReceivingLine): boolean {
  return Number.isFinite(line.quantityReceived) && line.quantityReceived > 0;
}
