// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProcessFlow } from "./ProcessFlow";

describe("ProcessFlow (UX-002)", () => {
  it("renderiza uma etapa por Step, na ordem recebida, com o detalhe real quando fornecido", () => {
    render(
      <ProcessFlow
        label="Fluxo de teste"
        steps={[
          { id: "a", label: "Cadastrados", status: "completed", detail: "5 de 5" },
          { id: "b", label: "Com Contato", status: "current", detail: "3 de 5" },
          { id: "c", label: "Com Contrato", status: "pending" },
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: "Fluxo de teste" });
    expect(list).toBeInTheDocument();
    expect(screen.getByText("Cadastrados")).toBeInTheDocument();
    expect(screen.getByText("5 de 5")).toBeInTheDocument();
    expect(screen.getByText("Com Contrato")).toBeInTheDocument();
  });

  it("aplica a classe de status correta a cada etapa, incluindo 'blocked'", () => {
    const { container } = render(<ProcessFlow label="Fluxo" steps={[{ id: "a", label: "Etapa bloqueada", status: "blocked" }]} />);

    expect(container.querySelector(".process-flow__step--blocked")).toBeInTheDocument();
  });

  it("nunca desenha um conector após a última etapa", () => {
    const { container } = render(
      <ProcessFlow
        label="Fluxo"
        steps={[
          { id: "a", label: "Um", status: "completed" },
          { id: "b", label: "Dois", status: "current" },
        ]}
      />,
    );

    expect(container.querySelectorAll(".process-flow__connector")).toHaveLength(1);
  });
});
