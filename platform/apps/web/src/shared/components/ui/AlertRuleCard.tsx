import { AlertTriangle } from "lucide-react";
import { Badge } from "./Badge";

export interface AlertRuleCardProps {
  readonly ruleId: string;
  readonly productId: string;
  readonly thresholdQuantity: number;
  readonly active: boolean;
}

/**
 * Cartão de resumo de uma Stock Alert Rule real (`core/inventory-movement/`, IMP-404) — limiar de
 * estoque real (`StockAlertRule`, Core, IMP-401). Todo campo vem diretamente de
 * `StockAlertRuleResponseDto`, nunca fabricado; nenhuma previsão, nenhuma recomendação de IA — apenas
 * o limiar configurado de fato. Mesmo padrão de `PurchaseOrderCard`.
 */
export function AlertRuleCard({ ruleId, productId, thresholdQuantity, active }: AlertRuleCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <AlertTriangle size={14} aria-hidden="true" /> Regra {ruleId.slice(0, 8)}
        </strong>
        <Badge tone={active ? "warning" : "neutral"}>{active ? "Ativa" : "Inativa"}</Badge>
      </div>
      <div className="purchase-card__meta">
        <span>Produto {productId.slice(0, 8)}</span>
        <span>Limite: {thresholdQuantity} un.</span>
      </div>
    </div>
  );
}
