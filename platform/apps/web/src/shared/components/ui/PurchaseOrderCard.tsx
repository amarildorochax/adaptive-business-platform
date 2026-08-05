import { ClipboardList } from "lucide-react";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";

export interface PurchaseOrderCardProps {
  readonly purchaseOrderId: string;
  readonly supplierId: string;
  readonly status: string;
  readonly itemsCount: number;
  readonly totalValue?: string;
}

/**
 * Cartão de resumo de um Purchase Order real — identificador, Fornecedor (por identificador opaco;
 * `core/purchase/` nunca importa tipo de `@abp/supplier-hub`, mesmo Limite do Domínio já documentado
 * desde o Core, IMP-301, então nenhum nome de Fornecedor é resolvido aqui), status e contagem de
 * itens. Genérico e reutilizável (Visão Geral, Pedidos) — nunca instanciado com dado fabricado; todo
 * campo vem diretamente de `PurchaseOrderResponseDto` (`core/purchase/`, IMP-304). Mesmo padrão de
 * `SupplierCard` (IMP-205). Primeiro uso real no Purchase Workspace (IMP-305).
 */
export function PurchaseOrderCard({ purchaseOrderId, supplierId, status, itemsCount, totalValue }: PurchaseOrderCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <ClipboardList size={14} aria-hidden="true" /> Pedido {purchaseOrderId.slice(0, 8)}
        </strong>
        <PurchaseStatusBadge status={status} />
      </div>
      <div className="purchase-card__meta">
        <span>Fornecedor {supplierId.slice(0, 8)}</span>
        <span>{itemsCount} item(ns)</span>
        {totalValue && <span>{totalValue}</span>}
      </div>
    </div>
  );
}
