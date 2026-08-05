// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlertCard } from "./AlertCard";
import { InventoryCard } from "./InventoryCard";
import { MovementCard } from "./MovementCard";
import { ReservationBadge } from "./ReservationBadge";

/** Novos componentes compartilhados do Inventory Workspace (FUN-105) — todos genéricos, nenhum importa tipo de `@abp/commerce-hub`. */
describe("Componentes compartilhados novos — FUN-105", () => {
  it("InventoryCard mostra a quantidade, a Categoria e o status de disponibilidade, sem preço", () => {
    render(<InventoryCard productName="Arranjo Floral Executivo" categoryName="Arranjos" quantity={40} updatedAt="2026-07-31T12:00:00.000Z" />);

    expect(screen.getByText("Arranjo Floral Executivo")).toBeInTheDocument();
    expect(screen.getByText("Arranjos")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("Em estoque")).toBeInTheDocument();
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });

  it("MovementCard deriva a direção (Entrada/Saída) do sinal real do delta", () => {
    const { rerender } = render(<MovementCard productName="Arranjo Floral Executivo" label="Estoque ajustado (+15 unidades)" occurredAt="2026-07-31T12:00:00.000Z" delta={15} />);
    expect(screen.getByText("Entrada")).toBeInTheDocument();

    rerender(<MovementCard productName="Arranjo Floral Executivo" label="Estoque ajustado (-5 unidades)" occurredAt="2026-07-31T12:00:00.000Z" delta={-5} />);
    expect(screen.getByText("Saída")).toBeInTheDocument();

    rerender(<MovementCard productName="Arranjo Floral Executivo" label="Estoque ajustado" occurredAt="2026-07-31T12:00:00.000Z" />);
    expect(screen.getByText("Ajuste")).toBeInTheDocument();
  });

  it("ReservationBadge renderiza o rótulo correspondente a cada status", () => {
    const { rerender } = render(<ReservationBadge status="available" />);
    expect(screen.getByText("Disponível")).toBeInTheDocument();

    rerender(<ReservationBadge status="reserved" />);
    expect(screen.getByText("Reservado")).toBeInTheDocument();

    rerender(<ReservationBadge status="released" />);
    expect(screen.getByText("Liberado")).toBeInTheDocument();
  });

  it("AlertCard mostra título, contagem, descrição e a lista de itens afetados (limitada a cinco)", () => {
    render(<AlertCard title="Sem estoque" description="Produtos com quantidade zero." severity="danger" count={7} items={["A", "B", "C", "D", "E", "F", "G"]} />);

    expect(screen.getByText("Sem estoque")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Produtos com quantidade zero.")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("+2 outro(s)")).toBeInTheDocument();
  });
});
