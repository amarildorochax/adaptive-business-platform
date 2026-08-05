import { PackageCheck } from "lucide-react";

export interface ReceivingCardProps {
  readonly receivingId: string;
  readonly linesCount: number;
  readonly receivedAt: string;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/**
 * Cartão de resumo de um Receiving real (`core/purchase/`, IMP-304) — quantidade de linhas recebidas
 * e momento do recebimento, ambos campos reais de `ReceivingResponseDto`. Reutiliza a classe CSS
 * `.receiving-card` (originalmente FUN-106, órfã após a substituição do placeholder pelo Purchase
 * Hub real, ver `IMP_305_PURCHASE_WORKSPACE_REPORT.md`) — mesma estrutura visual, agora sobre dado
 * genuíno em vez de fabricado.
 */
export function ReceivingCard({ receivingId, linesCount, receivedAt }: ReceivingCardProps) {
  return (
    <div className="receiving-card">
      <PackageCheck size={20} aria-hidden="true" className="receiving-card__icon" />
      <div className="receiving-card__body">
        <strong>Recebimento {receivingId.slice(0, 8)}</strong>
        <span className="receiving-card__quantity">{linesCount} linha(s)</span>
      </div>
      <div className="receiving-card__meta">
        <span className="receiving-card__time">{formatDateTime(receivedAt)}</span>
      </div>
    </div>
  );
}
