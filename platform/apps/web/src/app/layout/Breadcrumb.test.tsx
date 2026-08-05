// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("mostra apenas o nome da aplicação na rota raiz", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Breadcrumb />
      </MemoryRouter>,
    );

    expect(screen.getByText("Adaptive Business Platform")).toBeInTheDocument();
    expect(screen.queryByText("CRM")).not.toBeInTheDocument();
  });

  it("mostra o rótulo do módulo atual em uma rota de domínio", () => {
    render(
      <MemoryRouter initialEntries={["/crm"]}>
        <Breadcrumb />
      </MemoryRouter>,
    );

    expect(screen.getByText("Adaptive Business Platform")).toBeInTheDocument();
    expect(screen.getByText("CRM")).toBeInTheDocument();
  });

  it("o segmento raiz é um link real de volta ao Dashboard quando fora da rota raiz (UX-002)", () => {
    render(
      <MemoryRouter initialEntries={["/crm"]}>
        <Breadcrumb />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Adaptive Business Platform" })).toHaveAttribute("href", "/");
  });

  it("o segmento raiz não é um link na própria rota raiz — nada a navegar", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Breadcrumb />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
