// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button — único botão do Design System (UX-001)", () => {
  it("aplica a variante padrão ('secondary') quando nenhuma é informada", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveClass("btn--secondary");
  });

  it("aplica a variante e o tamanho informados", () => {
    render(
      <Button variant="primary" size="sm">
        Confirmar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Confirmar" });
    expect(button).toHaveClass("btn--primary");
    expect(button).toHaveClass("btn--sm");
  });

  it("repassa atributos nativos do <button> (disabled, type)", () => {
    render(
      <Button type="submit" disabled>
        Enviar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("type", "submit");
  });
});
