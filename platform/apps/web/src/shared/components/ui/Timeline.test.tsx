// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline } from "./Timeline";

describe("Timeline", () => {
  it("renderiza um passo por item, com o rótulo correspondente", () => {
    render(
      <Timeline
        label="Jornada de teste"
        steps={[
          { id: "a", label: "Etapa A", status: "completed" },
          { id: "b", label: "Etapa B", status: "current" },
          { id: "c", label: "Etapa C", status: "pending" },
        ]}
      />,
    );

    expect(screen.getByRole("list", { name: "Jornada de teste" })).toBeInTheDocument();
    expect(screen.getByText("Etapa A")).toBeInTheDocument();
    expect(screen.getByText("Etapa B")).toBeInTheDocument();
    expect(screen.getByText("Etapa C")).toBeInTheDocument();
  });

  it("aplica a classe de status correspondente a cada passo", () => {
    const { container } = render(<Timeline label="Jornada" steps={[{ id: "a", label: "Etapa A", status: "current" }]} />);

    expect(container.querySelector(".timeline__step--current")).toBeInTheDocument();
  });
});
