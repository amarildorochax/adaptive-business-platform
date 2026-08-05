import { ClipboardCheck } from "lucide-react";
import { RequisitionStatusBadge } from "./RequisitionStatusBadge";

export interface RequisitionCardProps {
  readonly requisitionId: string;
  readonly origin: string;
  readonly status: string;
  readonly linesCount: number;
}

const ORIGIN_LABEL: Record<string, string> = { Manual: "Manual", AIRecommendation: "Recomendação de IA", ReorderRule: "Reposição Automática" };

/**
 * Cartão de resumo de uma Purchase Requisition real (`core/purchase/`, IMP-304) — origem, status e
 * contagem de linhas sugeridas, todos campos reais de `PurchaseRequisitionResponseDto`. Reutiliza a
 * classe CSS `.purchase-card` (mesma estrutura de `PurchaseOrderCard`) — ambas Entidades nativas do
 * Purchase Hub, nunca um empréstimo de classe de outro domínio.
 */
export function RequisitionCard({ requisitionId, origin, status, linesCount }: RequisitionCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <ClipboardCheck size={14} aria-hidden="true" /> Requisição {requisitionId.slice(0, 8)}
        </strong>
        <RequisitionStatusBadge status={status} />
      </div>
      <div className="purchase-card__meta">
        <span>{ORIGIN_LABEL[origin] ?? origin}</span>
        <span>{linesCount} produto(s)</span>
      </div>
    </div>
  );
}
