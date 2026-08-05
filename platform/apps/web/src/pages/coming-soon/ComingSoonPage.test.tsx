// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComingSoonPage } from "./ComingSoonPage";

describe("ComingSoonPage", () => {
  it("identifica o Manager e o pacote já mapeados, sem exibir nenhum dado inventado", () => {
    render(<ComingSoonPage domainLabel="Finance" managerName="FinanceManager" packageName="@abp/finance-hub" />);

    expect(screen.getByRole("heading", { name: "Finance" })).toBeInTheDocument();
    expect(screen.getByText("FinanceManager")).toBeInTheDocument();
    expect(screen.getByText("@abp/finance-hub")).toBeInTheDocument();
  });
});
