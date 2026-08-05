import { CategoryBadge } from "./CategoryBadge";
import { InventoryBadge } from "./InventoryBadge";
import { InventoryIndicator } from "./InventoryIndicator";

export interface InventoryCardProps {
  readonly productName: string;
  readonly categoryName?: string;
  readonly quantity: number;
  readonly updatedAt?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Cartão operacional de um item em estoque — distinto de `ProductCard` (FUN-104, foco em catálogo/
 * venda: preço, descrição) por nunca mostrar preço, focado exclusivamente na operação de estoque:
 * quantidade em destaque (`InventoryIndicator`, FUN-104 — o "StockIndicator" pedido pela FUN-105 é
 * exatamente este componente já existente, reutilizado sem duplicar), status de disponibilidade
 * (`InventoryBadge`) e o momento do último ajuste. Primeiro uso no Inventory Workspace (FUN-105),
 * genérico para qualquer módulo futuro com o mesmo conceito de item em estoque.
 */
export function InventoryCard({ productName, categoryName, quantity, updatedAt }: InventoryCardProps) {
  return (
    <div className="product-card">
      <div className="product-card__header">
        <strong>{productName}</strong>
        <InventoryBadge quantity={quantity} />
      </div>
      <div className="product-card__meta">
        {categoryName && <CategoryBadge name={categoryName} />}
        <InventoryIndicator quantity={quantity} />
      </div>
      {updatedAt && <span className="product-card__description">Atualizado em {formatDate(updatedAt)}</span>}
    </div>
  );
}
