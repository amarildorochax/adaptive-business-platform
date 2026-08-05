import { Factory } from "lucide-react";
import { ProductionStatusBadge } from "./ProductionStatusBadge";

export interface ProductionOrderCardProps {
  readonly productionOrderId: string;
  readonly billOfMaterialsId: string;
  readonly plannedOutputQuantity: number;
  readonly status: string;
  readonly workCenterId?: string;
  readonly orderId?: string;
  readonly consumptionsCount: number;
  readonly outputsCount: number;
}

/**
 * Cartão de resumo de uma ProductionOrder real (`core/production/`, IMP-504) — todo campo vem
 * diretamente de `ProductionOrderResponseDto`, nunca fabricado. `consumptionsCount`/`outputsCount`
 * refletem `order.consumptions.length`/`order.outputs.length` (já embutidos na própria Entidade, per
 * IMP-501/IMP-504 — nenhuma Query própria existe para eles). Mesmo padrão de `LocationCard`/
 * `PurchaseOrderCard`.
 */
export function ProductionOrderCard({
  productionOrderId,
  billOfMaterialsId,
  plannedOutputQuantity,
  status,
  workCenterId,
  orderId,
  consumptionsCount,
  outputsCount,
}: ProductionOrderCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Factory size={14} aria-hidden="true" /> Ordem {productionOrderId.slice(0, 8)}
        </strong>
        <ProductionStatusBadge status={status} />
      </div>
      <div className="purchase-card__meta">
        <span>Composição {billOfMaterialsId.slice(0, 8)}</span>
        <span>Planejado: {plannedOutputQuantity}</span>
        {workCenterId && <span>Centro {workCenterId.slice(0, 8)}</span>}
        {orderId && <span>Order de origem {orderId.slice(0, 8)}</span>}
        <span>{consumptionsCount} consumo(s)</span>
        <span>{outputsCount} geração(ões)</span>
      </div>
    </div>
  );
}
