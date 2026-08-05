import type { ReceivingLine } from './ReceivingLine';

/**
 * Receiving — registro imutável de um recebimento físico de mercadoria contra um Purchase Order,
 * agrupando uma ou mais `ReceivingLine` (`PURCHASE_HUB.md`, Capítulo 4). Cada `Receiving` é o Fato
 * que dispara a atualização de `quantityReceived`/`status` de cada `PurchaseOrderItem` envolvido —
 * nunca alterado após criado, mesma disciplina de `SupplierPerformanceRecord`
 * (`packages/supplier-hub/src/SupplierPerformanceRecord.ts`).
 * Estrutura definida em `PURCHASE_HUB.md`, Capítulo 5.
 */
export interface Receiving {
  /** Identificador do Receiving. */
  readonly receivingId: string;

  /** Purchase Order ao qual este Receiving se refere. */
  readonly purchaseOrderId: string;

  /** Tenant ao qual este Receiving pertence. */
  readonly tenantId: string;

  /** Linhas recebidas nesta ocorrência. */
  readonly lines: readonly ReceivingLine[];

  /** Momento do recebimento físico. */
  readonly receivedAt: Date;
}
