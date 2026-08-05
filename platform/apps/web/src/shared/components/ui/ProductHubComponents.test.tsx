// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryBadge } from "./CategoryBadge";
import { CompositionCard } from "./CompositionCard";
import { InventoryBadge } from "./InventoryBadge";
import { InventoryIndicator } from "./InventoryIndicator";
import { PriceCard } from "./PriceCard";
import { ProductCard } from "./ProductCard";

/** Novos componentes compartilhados do Product Hub Workspace (FUN-104) — todos genéricos, nenhum importa tipo de `@abp/commerce-hub`. */
describe("Componentes compartilhados novos — FUN-104", () => {
  it("CategoryBadge renderiza o nome da Category", () => {
    render(<CategoryBadge name="Arranjos" />);
    expect(screen.getByText("Arranjos")).toBeInTheDocument();
  });

  it("InventoryBadge classifica corretamente Em estoque / Estoque baixo / Sem estoque", () => {
    const { rerender } = render(<InventoryBadge quantity={40} />);
    expect(screen.getByText("Em estoque")).toBeInTheDocument();

    rerender(<InventoryBadge quantity={5} />);
    expect(screen.getByText("Estoque baixo")).toBeInTheDocument();

    rerender(<InventoryBadge quantity={0} />);
    expect(screen.getByText("Sem estoque")).toBeInTheDocument();
  });

  it("InventoryIndicator mostra a quantidade real em destaque", () => {
    render(<InventoryIndicator quantity={40} />);
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("unidades")).toBeInTheDocument();
  });

  it("PriceCard formata o valor monetário conforme a moeda real", () => {
    render(<PriceCard label="Arranjo Floral Executivo" amount={189.9} currency="BRL" />);
    expect(screen.getByText("Arranjo Floral Executivo")).toBeInTheDocument();
    expect(screen.getByText(/189,90/)).toBeInTheDocument();
  });

  it("ProductCard compõe status, categoria, preço e disponibilidade", () => {
    render(<ProductCard name="Arranjo Floral Executivo" description="Item de demonstração" status="Draft" categoryName="Arranjos" priceLabel="R$ 189,90" inventoryQuantity={40} />);

    expect(screen.getByText("Arranjo Floral Executivo")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Arranjos")).toBeInTheDocument();
    expect(screen.getByText("R$ 189,90")).toBeInTheDocument();
    expect(screen.getByText("Em estoque")).toBeInTheDocument();
  });

  it("CompositionCard lista os itens de um Kit/Combo genérico — nenhum dado real do domínio, apenas o componente pronto para reuso", () => {
    render(<CompositionCard title="Kit Presente" kind="Kit" items={[{ name: "Item A", quantity: 2 }, { name: "Item B", quantity: 1 }]} />);

    expect(screen.getByText("Kit Presente")).toBeInTheDocument();
    expect(screen.getByText("Kit")).toBeInTheDocument();
    expect(screen.getByText("2× Item A")).toBeInTheDocument();
    expect(screen.getByText("1× Item B")).toBeInTheDocument();
  });
});
