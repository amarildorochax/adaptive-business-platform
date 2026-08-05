// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LiveIndicator } from "./LiveIndicator";

describe("LiveIndicator (UX-002)", () => {
  it("mostra o rótulo padrão 'Atualizado agora' quando nenhum é informado", () => {
    render(<LiveIndicator />);
    expect(screen.getByRole("status")).toHaveTextContent("Atualizado agora");
  });

  it("aceita um rótulo real customizado", () => {
    render(<LiveIndicator label="Novo Fornecedor" />);
    expect(screen.getByRole("status")).toHaveTextContent("Novo Fornecedor");
  });
});
