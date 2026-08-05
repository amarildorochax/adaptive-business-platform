// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContractCard } from "./ContractCard";
import { SupplierCard } from "./SupplierCard";
import { SupplierStatusBadge } from "./SupplierStatusBadge";

/** Novos componentes compartilhados do Supplier Workspace (IMP-205) — todos genéricos, nenhum importa tipo de `@abp/supplier-hub`. */
describe("Componentes compartilhados novos — IMP-205", () => {
  it("SupplierStatusBadge traduz Active/Disabled para rótulo e tom semântico corretos", () => {
    const { rerender } = render(<SupplierStatusBadge status="Active" />);
    expect(screen.getByText("Ativo")).toBeInTheDocument();

    rerender(<SupplierStatusBadge status="Disabled" />);
    expect(screen.getByText("Desabilitado")).toBeInTheDocument();
  });

  it("SupplierStatusBadge nunca oculta um status desconhecido — mostra o próprio texto recebido", () => {
    render(<SupplierStatusBadge status="AlgoNovo" />);
    expect(screen.getByText("AlgoNovo")).toBeInTheDocument();
  });

  it("SupplierCard mostra nome, status, taxId e contagem real de contatos", () => {
    render(<SupplierCard legalName="Floricultura Atacado Ltda." status="Active" taxId="12345678000199" supplyCategory="Flores" contactsCount={2} />);

    expect(screen.getByText("Floricultura Atacado Ltda.")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("12345678000199")).toBeInTheDocument();
    expect(screen.getByText("Flores")).toBeInTheDocument();
    expect(screen.getByText("2 contato(s)")).toBeInTheDocument();
  });

  it("SupplierCard omite a categoria quando ausente, sem inventar um valor", () => {
    render(<SupplierCard legalName="Fornecedor" status="Active" taxId="12345678000199" contactsCount={0} />);
    expect(screen.queryByText("Flores")).not.toBeInTheDocument();
    expect(screen.getByText("0 contato(s)")).toBeInTheDocument();
  });

  it("ContractCard mostra vigência, prazo de pagamento e volume mínimo reais", () => {
    render(<ContractCard supplierName="Floricultura Atacado Ltda." startsAt="2026-01-01T00:00:00.000Z" endsAt="2026-12-31T00:00:00.000Z" paymentTermsDueInDays={30} minimumVolume={50} />);

    expect(screen.getByText("Floricultura Atacado Ltda.")).toBeInTheDocument();
    expect(screen.getByText(/01\/01\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/31\/12\/2026/)).toBeInTheDocument();
    expect(screen.getByText("30 dias")).toBeInTheDocument();
    expect(screen.getByText("Volume mínimo: 50")).toBeInTheDocument();
  });

  it("ContractCard mostra prazo indeterminado e à vista quando aplicável, e Fornecedor honesto quando ausente", () => {
    render(<ContractCard startsAt="2026-01-01T00:00:00.000Z" paymentTermsDueInDays={0} />);

    expect(screen.getByText("Fornecedor não identificado")).toBeInTheDocument();
    expect(screen.getByText(/prazo indeterminado/)).toBeInTheDocument();
    expect(screen.getByText("À vista")).toBeInTheDocument();
  });
});
