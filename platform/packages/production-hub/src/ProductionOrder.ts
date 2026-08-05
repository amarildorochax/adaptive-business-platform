import type { ProductionConsumption } from './ProductionConsumption';
import type { ProductionOutput } from './ProductionOutput';

/**
 * ProductionOrder — Aggregate Root do ciclo de execução do Production Hub (`PRODUCTION_HUB.md`,
 * Capítulo 4). Referencia exatamente uma `BillOfMaterials`; agrupa `ProductionConsumption` e
 * `ProductionOutput` como parte interna; é a única Entidade deste domínio referenciada por
 * identificador por Inventory Movement Hub e Financial Hub (por isso `originReferenceId` de um
 * `StockMovement` de origem `ProductionConsumption`/`ProductionOutput` aponta sempre para um
 * `productionOrderId`, nunca para um `consumptionId`/`outputId` — ver
 * `packages/inventory-movement-hub/src/MovementOrigin.ts`).
 *
 * DECISÃO DE IMPLEMENTAÇÃO (documentada, per instrução desta Sprint — "Nunca corrigir
 * silenciosamente"): `PRODUCTION_HUB.md`, Capítulo 5, descreve a origem de uma `ProductionOrder`
 * como "orderId do Commerce Hub, quando reativa a uma venda; ou Manual, quando reabastecimento
 * antecipado". `ProductionOrderRepository.findByOrigin(orderId)` (Capítulo 9) confirma, pela própria
 * assinatura, que a origem é modelada como um `orderId` opcional simples — não como uma união
 * discriminada com payload — por isso `orderId` é `undefined` para toda Produção de reabastecimento
 * manual, presente apenas quando reativa a uma venda.
 */

/** Estado da ProductionOrder — enum fechado, `PRODUCTION_HUB.md`, Capítulo 5. */
export type ProductionStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';

export interface ProductionOrder {
  /** Identificador da ProductionOrder. */
  readonly productionOrderId: string;

  /** Tenant ao qual a ProductionOrder pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** BillOfMaterials referenciada — sempre `Active` no momento da criação (Capítulo 11). */
  readonly billOfMaterialsId: string;

  /** Quantidade de saída planejada. */
  readonly plannedOutputQuantity: number;

  /** Estado atual, ver máquina de estados documentada em `ProductionPolicy.ts`. */
  readonly status: ProductionStatus;

  /** Work Center associado, quando a Empresa modela produção em estações distintas — Capability
   * opcional (Capítulo 4). */
  readonly workCenterId?: string;

  /** Order do Commerce Hub que motivou esta Produção — `undefined` quando reabastecimento manual,
   * ver Decisão de Implementação acima. */
  readonly orderId?: string;

  /** Insumos efetivamente consumidos — parte interna do Aggregate. */
  readonly consumptions: readonly ProductionConsumption[];

  /** Produtos acabados efetivamente gerados — parte interna do Aggregate. */
  readonly outputs: readonly ProductionOutput[];

  /** Motivo do cancelamento, quando aplicável — payload de `ProductionCancelled`
   * (`DOMAIN_EVENT_CATALOG.md`). */
  readonly cancelReason?: string;

  /** Momento em que `StartProduction` transicionou esta ProductionOrder para `InProgress`. */
  readonly startedAt?: Date;

  /** Momento em que `CompleteProduction` transicionou esta ProductionOrder para `Completed`. */
  readonly completedAt?: Date;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
