import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "./Badge";
import { CategoryBadge } from "./CategoryBadge";
import { InventoryBadge } from "./InventoryBadge";

const STATUS_TONE: Record<string, BadgeTone> = { Draft: "neutral", Published: "success", Discontinued: "danger" };

export interface ProductCardProps {
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly categoryName?: string;
  readonly priceLabel?: string;
  readonly inventoryQuantity?: number;
  readonly actions?: ReactNode;
}

/**
 * Cartão de catálogo de um Product — nome, descrição, status (`Badge`), categoria (`CategoryBadge`),
 * preço já formatado e disponibilidade (`InventoryBadge`), todos opcionais individualmente (nem todo
 * Product desta sessão tem Category/Price/Inventory conhecidos — nunca um valor fabricado no lugar
 * de um campo ausente). Primeiro uso no Product Hub Workspace (FUN-104, Catálogo), genérico para
 * qualquer módulo futuro com o mesmo conceito de item vendável.
 */
export function ProductCard({ name, description, status, categoryName, priceLabel, inventoryQuantity, actions }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-card__header">
        <strong>{name}</strong>
        <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status}</Badge>
      </div>
      {description && <p className="product-card__description">{description}</p>}
      <div className="product-card__meta">
        {categoryName && <CategoryBadge name={categoryName} />}
        {priceLabel && <span className="product-card__price">{priceLabel}</span>}
        {inventoryQuantity !== undefined && <InventoryBadge quantity={inventoryQuantity} />}
      </div>
      {actions && <div className="product-card__actions">{actions}</div>}
    </div>
  );
}
