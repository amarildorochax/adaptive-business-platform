import { Receipt } from "lucide-react";
import { FiscalDocumentStatusBadge } from "./FiscalDocumentStatusBadge";

export interface FiscalDocumentCardProps {
  readonly fiscalDocumentId: string;
  readonly type: string;
  readonly status: string;
  readonly orderId?: string;
  readonly invoiceId?: string;
  readonly linesCount: number;
}

const TYPE_LABEL: Record<string, string> = { Sale: "Venda", Return: "Devolução", Transfer: "Transferência" };

/**
 * Cartão de resumo de um Fiscal Document real (`core/fiscal/`, IMP-604) — todo campo vem diretamente
 * de `FiscalDocumentResponseDto`, nunca fabricado. Mesmo padrão de `ProductionOrderCard`/
 * `BillOfMaterialsCard`. `type` desconhecido cai no próprio texto recebido, mesma disciplina de
 * `*StatusBadge` diante de um valor fora do mapeamento fixo.
 */
export function FiscalDocumentCard({ fiscalDocumentId, type, status, orderId, invoiceId, linesCount }: FiscalDocumentCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Receipt size={14} aria-hidden="true" /> Documento {fiscalDocumentId.slice(0, 8)}
        </strong>
        <FiscalDocumentStatusBadge status={status} />
      </div>
      <div className="purchase-card__meta">
        <span>{TYPE_LABEL[type] ?? type}</span>
        {orderId && <span>Order de origem {orderId.slice(0, 8)}</span>}
        {invoiceId && <span>Invoice de origem {invoiceId.slice(0, 8)}</span>}
        <span>{linesCount} linha(s)</span>
      </div>
    </div>
  );
}
