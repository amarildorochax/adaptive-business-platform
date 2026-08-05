// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PurchaseOrderCard } from "./PurchaseOrderCard";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import { ReceivingCard } from "./ReceivingCard";
import { RequisitionCard } from "./RequisitionCard";
import { RequisitionStatusBadge } from "./RequisitionStatusBadge";

describe("PurchaseStatusBadge", () => {
  it("exibe o rótulo em português para cada status real de PurchaseStatus", () => {
    render(<PurchaseStatusBadge status="PendingApproval" />);
    expect(screen.getByText("Aguardando Aprovação")).toBeInTheDocument();
  });

  it("cai em tom neutro e no próprio texto para um status desconhecido — nunca oculta a informação", () => {
    render(<PurchaseStatusBadge status="EstadoInexistente" />);
    expect(screen.getByText("EstadoInexistente")).toBeInTheDocument();
  });
});

describe("RequisitionStatusBadge", () => {
  it("exibe o rótulo em português para cada status real de PurchaseRequisitionStatus", () => {
    render(<RequisitionStatusBadge status="ConvertedToPurchaseOrder" />);
    expect(screen.getByText("Convertida em Pedido")).toBeInTheDocument();
  });

  it("cai no próprio texto para um status desconhecido", () => {
    render(<RequisitionStatusBadge status="EstadoInexistente" />);
    expect(screen.getByText("EstadoInexistente")).toBeInTheDocument();
  });
});

describe("PurchaseOrderCard", () => {
  it("exibe identificador, status, Fornecedor e contagem de itens reais", () => {
    render(<PurchaseOrderCard purchaseOrderId="po-12345678" supplierId="supplier-12345678" status="Sent" itemsCount={3} totalValue="R$ 100,00" />);

    expect(screen.getByText(/Pedido po-/)).toBeInTheDocument();
    expect(screen.getByText(/Fornecedor supplier/)).toBeInTheDocument();
    expect(screen.getByText("3 item(ns)")).toBeInTheDocument();
    expect(screen.getByText("R$ 100,00")).toBeInTheDocument();
    expect(screen.getByText("Enviado")).toBeInTheDocument();
  });

  it("omite o valor total quando ausente, nunca exibe um valor fabricado", () => {
    render(<PurchaseOrderCard purchaseOrderId="po-1" supplierId="supplier-1" status="Draft" itemsCount={0} />);

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });
});

describe("ReceivingCard", () => {
  it("exibe identificador, contagem de linhas e momento real do recebimento", () => {
    render(<ReceivingCard receivingId="receiving-12345678" linesCount={2} receivedAt="2026-02-01T12:00:00.000Z" />);

    expect(screen.getByText(/Recebimento receivin/)).toBeInTheDocument();
    expect(screen.getByText("2 linha(s)")).toBeInTheDocument();
  });
});

describe("RequisitionCard", () => {
  it("exibe identificador, origem, status e contagem de produtos reais", () => {
    render(<RequisitionCard requisitionId="req-12345678" origin="ReorderRule" status="Open" linesCount={1} />);

    expect(screen.getByText(/Requisição req-/)).toBeInTheDocument();
    expect(screen.getByText("Reposição Automática")).toBeInTheDocument();
    expect(screen.getByText("1 produto(s)")).toBeInTheDocument();
    expect(screen.getByText("Aberta")).toBeInTheDocument();
  });
});
