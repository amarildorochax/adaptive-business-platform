import { FileSignature } from "lucide-react";

export interface ContractCardProps {
  readonly supplierName?: string;
  readonly startsAt: string;
  readonly endsAt?: string;
  readonly paymentTermsDueInDays: number;
  readonly minimumVolume?: number;
}

/** `timeZone: "UTC"` — a data de vigência de um Contract é um dia calendário de negócio, nunca deveria mudar conforme o fuso horário local de quem visualiza. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

/**
 * Cartão de um acordo comercial (`SupplierContract`, `core/supplier/`, IMP-204) — vigência, prazo
 * de pagamento e volume mínimo, todos campos reais de `SupplierContractResponseDto`. Genérico e
 * reutilizável (Contratos, e futuramente Visão Geral, quando uma Query de listagem existir — ver
 * `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`, "Limitações"). Primeiro uso real no Supplier Workspace
 * (IMP-205).
 */
export function ContractCard({ supplierName, startsAt, endsAt, paymentTermsDueInDays, minimumVolume }: ContractCardProps) {
  return (
    <div className="contract-card">
      <FileSignature size={16} aria-hidden="true" className="contract-card__icon" />
      <div className="contract-card__body">
        <strong>{supplierName ?? "Fornecedor não identificado"}</strong>
        <span className="contract-card__validity">
          Vigência: {formatDate(startsAt)} {endsAt ? `até ${formatDate(endsAt)}` : "— prazo indeterminado"}
        </span>
      </div>
      <div className="contract-card__meta">
        <span className="contract-card__payment-terms">{paymentTermsDueInDays === 0 ? "À vista" : `${paymentTermsDueInDays} dias`}</span>
        {minimumVolume !== undefined && <span className="contract-card__minimum-volume">Volume mínimo: {minimumVolume}</span>}
      </div>
    </div>
  );
}
