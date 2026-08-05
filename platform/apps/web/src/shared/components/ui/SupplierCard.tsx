import { SupplierStatusBadge } from "./SupplierStatusBadge";

export interface SupplierCardProps {
  readonly legalName: string;
  readonly status: string;
  readonly taxId: string;
  readonly supplyCategory?: string;
  readonly contactsCount: number;
}

/**
 * Cartão de resumo de um Supplier real — nome, status, identificador fiscal e quantidade de
 * Contact já associados. Genérico e reutilizável (Visão Geral, Fornecedores) — nunca instanciado
 * com dado fabricado; todo campo vem diretamente de `SupplierResponseDto` (`core/supplier/`,
 * IMP-204). Primeiro uso real no Supplier Workspace (IMP-205).
 */
export function SupplierCard({ legalName, status, taxId, supplyCategory, contactsCount }: SupplierCardProps) {
  return (
    <div className="supplier-card">
      <div className="supplier-card__header">
        <strong>{legalName}</strong>
        <SupplierStatusBadge status={status} />
      </div>
      <div className="supplier-card__meta">
        <span className="supplier-card__tax-id">{taxId}</span>
        {supplyCategory && <span className="supplier-card__category">{supplyCategory}</span>}
        <span className="supplier-card__contacts">{contactsCount} contato(s)</span>
      </div>
    </div>
  );
}
