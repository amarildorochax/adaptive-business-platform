/**
 * SupplierPerformanceRecord — fato observável de desempenho de entrega de um Fornecedor.
 * Sempre gerado a partir de fato observado no Purchase Hub — nunca inserido manualmente como
 * avaliação subjetiva nesta Sprint (`SUPPLIER_HUB.md`, Capítulo 11 e ADR-SU-002). Cada registro é
 * imutável assim que criado, mesma disciplina de `Ledger Entry` (Finance Hub).
 * Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 5.
 */

/** Tipo de observação registrada — enum fechado, `SUPPLIER_HUB.md`, Capítulo 5. */
export type SupplierPerformanceObservationType =
  | 'OnTimeDelivery'
  | 'LateDelivery'
  | 'QuantityMatch'
  | 'QuantityMismatch';

export interface SupplierPerformanceRecord {
  /** Identificador do registro. */
  readonly recordId: string;

  /** Supplier ao qual este registro se refere. */
  readonly supplierId: string;

  /** Tenant ao qual este registro pertence. */
  readonly tenantId: string;

  /**
   * Purchase Order de origem, referenciado por identificador opaco (Purchase Hub —
   * `@abp/purchase-hub`, ainda não implementado nesta Fase). Nenhum tipo de Purchase Hub é
   * importado por este pacote.
   */
  readonly purchaseOrderId: string;

  /** Tipo de observação registrada. */
  readonly observationType: SupplierPerformanceObservationType;

  /** Momento do fato observado. */
  readonly observedAt: Date;
}
