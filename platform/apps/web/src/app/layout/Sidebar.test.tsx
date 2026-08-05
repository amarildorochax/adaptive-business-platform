// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { NAV_ENTRIES } from "@app/navigation/navEntries";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("renderiza um link de navegação para todo NAV_ENTRIES, com selo 'Em breve' apenas nos planejados", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    for (const entry of NAV_ENTRIES) {
      // `^${entry.label}`, nunca `entry.label` solto — achado real de auditoria (IMP-405, Passo 1):
      // desde que "Movimentação de Estoque" (`/inventory-movement`) entrou em `NAV_ENTRIES`, um regex
      // sem âncora combina por substring com "Estoque" (`/inventory`) também, uma ambiguidade real de
      // nome acessível (`getByRole` deixa de identificar um único link para a entrada "Estoque"). A
      // âncora de início preserva a tolerância original ao selo "Em breve" (`Sidebar.tsx`, sufixo do
      // nome acessível dos itens `planned`), apenas elimina o casamento por sufixo indevido.
      const link = screen.getByRole("link", { name: new RegExp(`^${entry.label}`) });
      expect(link).toHaveAttribute("href", entry.path);
    }

    expect(screen.getAllByText("Em breve")).toHaveLength(NAV_ENTRIES.filter((e) => e.status === "planned").length);
  });

  it("recolhe e expande via o botão dedicado, persistindo a preferência (UX-001)", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole("button", { name: "Recolher menu" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(screen.getByRole("button", { name: "Expandir menu" })).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("abp.sidebar.collapsed")).toBe("true");
  });

  it("uma preferência de Sidebar recolhida já salva é restaurada na montagem seguinte", () => {
    localStorage.setItem("abp.sidebar.collapsed", "true");

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Expandir menu" })).toBeInTheDocument();
  });
});
