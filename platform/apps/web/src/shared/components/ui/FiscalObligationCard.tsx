import { CalendarClock } from "lucide-react";
import { FiscalObligationStatusBadge } from "./FiscalObligationStatusBadge";

export interface FiscalObligationCardProps {
  readonly fiscalObligationId: string;
  readonly type: string;
  readonly periodicity: string;
  readonly dueDate: string;
  readonly status: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

/**
 * Cartão de resumo de uma Fiscal Obligation real (`core/fiscal/`, IMP-604) — todo campo vem
 * diretamente de `FiscalObligationResponseDto`, nunca fabricado. `type`/`periodicity` permanecem texto
 * livre (Core, IMP-601: "a arquitetura não especifica um enum fechado para nenhum dos dois"), exibidos
 * exatamente como recebidos, nunca traduzidos por um mapeamento fixo (diferente de `*StatusBadge`, cujo
 * conjunto de valores é fechado). Mesmo padrão de `FiscalDocumentCard`.
 */
export function FiscalObligationCard({ fiscalObligationId, type, periodicity, dueDate, status }: FiscalObligationCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <CalendarClock size={14} aria-hidden="true" /> Obrigação {fiscalObligationId.slice(0, 8)}
        </strong>
        <FiscalObligationStatusBadge status={status} />
      </div>
      <div className="purchase-card__meta">
        <span>{type}</span>
        <span>{periodicity}</span>
        <span>Vencimento {formatDate(dueDate)}</span>
      </div>
    </div>
  );
}
