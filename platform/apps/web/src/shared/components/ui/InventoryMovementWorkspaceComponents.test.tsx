// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlertRuleCard } from "./AlertRuleCard";
import { LocationCard } from "./LocationCard";
import { MovementBadge } from "./MovementBadge";
import { ReservationCard } from "./ReservationCard";
import { StockMovementCard } from "./StockMovementCard";
import { StockReservationStatusBadge } from "./StockReservationStatusBadge";

describe("MovementBadge", () => {
  it("mostra tom de sucesso e a origem traduzida para um quantityDelta positivo (Entrada)", () => {
    render(<MovementBadge origin="Purchase" quantityDelta={10} />);
    expect(screen.getByText("Compra")).toBeInTheDocument();
  });

  it("mostra tom de perigo para um quantityDelta negativo (Saída)", () => {
    render(<MovementBadge origin="SaleFulfillment" quantityDelta={-4} />);
    expect(screen.getByText("Cumprimento de Venda")).toBeInTheDocument();
  });

  it("cai no próprio texto para uma origem desconhecida — nunca oculta a informação", () => {
    render(<MovementBadge origin="OrigemInventada" quantityDelta={1} />);
    expect(screen.getByText("OrigemInventada")).toBeInTheDocument();
  });
});

describe("StockMovementCard", () => {
  it("exibe identificador, quantidade assinada, origem e momento reais", () => {
    render(<StockMovementCard movementId="movement-12345678" productId="product-12345678" quantityDelta={10} origin="Purchase" occurredAt="2026-02-01T12:00:00.000Z" locationId="location-12345678" />);

    expect(screen.getByText(/Movimento movement/)).toBeInTheDocument();
    expect(screen.getByText(/Produto product-/)).toBeInTheDocument();
    expect(screen.getByText("+10 un.")).toBeInTheDocument();
    expect(screen.getByText(/Local location/)).toBeInTheDocument();
  });

  it("omite a localização quando ausente, nunca exibe um valor fabricado", () => {
    render(<StockMovementCard movementId="movement-1" productId="product-1" quantityDelta={-5} origin="SaleFulfillment" occurredAt="2026-02-01T12:00:00.000Z" />);

    expect(screen.getByText("-5 un.")).toBeInTheDocument();
    expect(screen.queryByText(/Local /)).not.toBeInTheDocument();
  });
});

describe("StockReservationStatusBadge", () => {
  it("exibe o rótulo em português para cada status real de StockReservationStatus", () => {
    render(<StockReservationStatusBadge status="ConvertedToMovement" />);
    expect(screen.getByText("Convertida em Saída")).toBeInTheDocument();
  });

  it("cai no próprio texto para um status desconhecido", () => {
    render(<StockReservationStatusBadge status="EstadoInexistente" />);
    expect(screen.getByText("EstadoInexistente")).toBeInTheDocument();
  });
});

describe("ReservationCard", () => {
  it("exibe identificador, produto, quantidade, order e status reais", () => {
    render(<ReservationCard reservationId="reservation-12345678" productId="product-12345678" quantity={4} orderId="order-12345678" status="Active" />);

    expect(screen.getByText(/Reserva reservat/)).toBeInTheDocument();
    expect(screen.getByText("4 un.")).toBeInTheDocument();
    expect(screen.getByText(/Order order-/)).toBeInTheDocument();
    expect(screen.getByText("Ativa")).toBeInTheDocument();
  });
});

describe("LocationCard", () => {
  it("exibe nome, identificador e endereço reais quando presente", () => {
    render(<LocationCard locationId="location-12345678" name="Depósito Central" addressLine="Rua das Flores, 123" active={true} />);

    expect(screen.getByText("Depósito Central")).toBeInTheDocument();
    expect(screen.getByText("Rua das Flores, 123")).toBeInTheDocument();
    expect(screen.getByText("Ativa")).toBeInTheDocument();
  });

  it("omite o endereço quando ausente, nunca exibe um valor fabricado", () => {
    render(<LocationCard locationId="location-1" name="Depósito Central" active={false} />);

    expect(screen.getByText("Inativa")).toBeInTheDocument();
    expect(screen.queryByText(/Rua/)).not.toBeInTheDocument();
  });
});

describe("AlertRuleCard", () => {
  it("exibe identificador, produto, limite e status reais", () => {
    render(<AlertRuleCard ruleId="rule-12345678" productId="product-12345678" thresholdQuantity={5} active={true} />);

    expect(screen.getByText(/Regra rule-/)).toBeInTheDocument();
    expect(screen.getByText("Limite: 5 un.")).toBeInTheDocument();
    expect(screen.getByText("Ativa")).toBeInTheDocument();
  });
});
