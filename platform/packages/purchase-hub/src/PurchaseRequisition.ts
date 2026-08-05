/**
 * PurchaseRequisition — pedido interno de compra, anterior a qualquer Purchase Order real, per
 * Capítulo 9 ("Procurement como camada estratégica absorvida pelo Purchase Hub, nunca um Owner
 * separado", ADR-PU-001). Origem sempre explícita — mesmo uma sugestão de IA nunca é convertida em
 * Purchase Order "sem confirmação" (`PURCHASE_HUB.md`, Capítulo 9): o Core não distingue quem
 * efetivamente chamou o Command, apenas registra honestamente a origem declarada.
 * Estrutura definida em `PURCHASE_HUB.md`, Capítulo 5.
 */

/** Origem da Requisição — enum fechado, `PURCHASE_HUB.md`, Capítulo 6/9. */
export type PurchaseRequisitionOrigin = 'Manual' | 'AIRecommendation' | 'ReorderRule';

/** Estado da Requisição — enum fechado, `PURCHASE_HUB.md`, Capítulo 6. */
export type PurchaseRequisitionStatus = 'Open' | 'Approved' | 'Rejected' | 'ConvertedToPurchaseOrder';

/**
 * Linha de sugestão da Requisição — apenas Produto e quantidade sugerida; o custo de aquisição só é
 * conhecido ao negociar com um Fornecedor específico, portanto nunca existe nesta Entidade (ver
 * `ConvertRequisitionToPurchaseOrder` em `PurchaseOrderService`).
 */
export interface PurchaseRequisitionLine {
  /** Produto referenciado por identificador opaco (Commerce Hub). */
  readonly productId: string;

  /** Quantidade sugerida. */
  readonly suggestedQuantity: number;
}

export interface PurchaseRequisition {
  /** Identificador da Requisição. */
  readonly requisitionId: string;

  /** Tenant ao qual a Requisição pertence. */
  readonly tenantId: string;

  /** Origem declarada da Requisição. */
  readonly origin: PurchaseRequisitionOrigin;

  /** Linhas sugeridas. */
  readonly lines: readonly PurchaseRequisitionLine[];

  /** Estado atual. */
  readonly status: PurchaseRequisitionStatus;

  /** Purchase Order resultante, quando `status` é `ConvertedToPurchaseOrder` — `undefined` até lá. */
  readonly purchaseOrderId?: string;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
