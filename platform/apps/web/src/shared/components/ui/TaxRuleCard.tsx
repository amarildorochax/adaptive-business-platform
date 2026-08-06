import { Percent } from "lucide-react";
import { Badge } from "./Badge";

export interface TaxRuleCardProps {
  readonly taxRuleId: string;
  readonly taxRegimeId: string;
  readonly classificationCode: string;
  readonly rateType: string;
  readonly rateValue: number;
  readonly active: boolean;
}

/**
 * Cartão de resumo de uma Tax Rule real (`core/fiscal/`, IMP-604) — mesmo padrão de `WorkCenterCard`
 * (Badge de `active` inline, sem componente de status dedicado — apenas dois estados possíveis,
 * `DeactivateTaxRule` nunca exclui o registro). `rateType`/`rateValue` refletem `TaxRateDto`
 * (`core/fiscal/fiscal.dto.ts`) — "Percentage" exibido com "%", "Fixed" sem, nunca uma unidade
 * inventada para o tipo oposto.
 */
export function TaxRuleCard({ taxRuleId, taxRegimeId, classificationCode, rateType, rateValue, active }: TaxRuleCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Percent size={14} aria-hidden="true" /> Regra {taxRuleId.slice(0, 8)}
        </strong>
        <Badge tone={active ? "success" : "neutral"}>{active ? "Ativa" : "Inativa"}</Badge>
      </div>
      <div className="purchase-card__meta">
        <span>Regime {taxRegimeId.slice(0, 8)}</span>
        <span>Classificação {classificationCode}</span>
        <span>
          Alíquota {rateValue}
          {rateType === "Percentage" ? "%" : ""}
        </span>
      </div>
    </div>
  );
}
