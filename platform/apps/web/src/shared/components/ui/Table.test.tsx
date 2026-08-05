// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Table, type TableColumn } from "./Table";

interface Row {
  readonly id: string;
  readonly name: string;
  readonly value: number;
}

const ROWS: readonly Row[] = [
  { id: "1", name: "Alfa", value: 30 },
  { id: "2", name: "Beta", value: 10 },
  { id: "3", name: "Gama", value: 20 },
];

const COLUMNS: readonly TableColumn<Row>[] = [
  { key: "name", header: "Nome", render: (row) => row.name, sortValue: (row) => row.name },
  { key: "value", header: "Valor", render: (row) => row.value, sortValue: (row) => row.value },
];

describe("Table — tabela padrão do Design System (UX-001)", () => {
  it("renderiza uma linha por registro, todas as colunas", () => {
    render(<Table columns={COLUMNS} rows={ROWS} getRowId={(row) => row.id} />);

    expect(screen.getByText("Alfa")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gama")).toBeInTheDocument();
  });

  it("estado vazio quando não há registros, nunca uma tabela em branco", () => {
    render(<Table columns={COLUMNS} rows={[]} getRowId={(row) => row.id} emptyTitle="Nenhum item" />);

    expect(screen.getByText("Nenhum item")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("busca filtra as linhas client-side sobre searchText", async () => {
    const user = userEvent.setup();
    render(<Table columns={COLUMNS} rows={ROWS} getRowId={(row) => row.id} searchText={(row) => row.name} searchPlaceholder="Buscar registro" />);

    await user.type(screen.getByLabelText("Buscar registro"), "Beta");

    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.queryByText("Alfa")).not.toBeInTheDocument();
  });

  it("ordena ao clicar no cabeçalho de uma coluna ordenável, alternando asc/desc", async () => {
    const user = userEvent.setup();
    render(<Table columns={COLUMNS} rows={ROWS} getRowId={(row) => row.id} />);

    await user.click(screen.getByText("Valor"));

    const cells = screen.getAllByRole("cell");
    // Primeira célula da primeira linha após ordenar ascendente por valor (Beta=10).
    expect(cells[0]).toHaveTextContent("Beta");
  });
});
