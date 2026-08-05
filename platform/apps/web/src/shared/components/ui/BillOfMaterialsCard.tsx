import { Layers } from "lucide-react";
import { BillOfMaterialsStatusBadge } from "./BillOfMaterialsStatusBadge";

export interface BillOfMaterialsCardProps {
  readonly billOfMaterialsId: string;
  readonly outputProductId: string;
  readonly version: number;
  readonly status: string;
  readonly linesCount: number;
}

/** Cartão de resumo de uma BillOfMaterials real (`core/production/`, IMP-504) — mesmo padrão de `LocationCard`/`ProductionOrderCard`. */
export function BillOfMaterialsCard({ billOfMaterialsId, outputProductId, version, status, linesCount }: BillOfMaterialsCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Layers size={14} aria-hidden="true" /> Composição {billOfMaterialsId.slice(0, 8)}
        </strong>
        <BillOfMaterialsStatusBadge status={status} />
      </div>
      <div className="purchase-card__meta">
        <span>Produto {outputProductId.slice(0, 8)}</span>
        <span>Versão {version}</span>
        <span>{linesCount} insumo(s)</span>
      </div>
    </div>
  );
}
