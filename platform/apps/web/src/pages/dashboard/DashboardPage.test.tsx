// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@app/providers/AppProviders";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { DEMO_TENANT_ID } from "@core/managers/seedDemoData";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage — primeira integração completa (FUN-001)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock(DEMO_TENANT_ID)));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mostra o estado de carregamento e, em seguida, os sete widgets alimentados pelos Managers reais", async () => {
    render(
      <AppProviders>
        <DashboardPage />
      </AppProviders>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Carregando");

    await waitFor(() => {
      expect(screen.getByText("Perfil Empresarial")).toBeInTheDocument();
    });

    expect(screen.getByText("Identidade de Marca")).toBeInTheDocument();
    expect(screen.getByText("CRM — Relacionamentos")).toBeInTheDocument();
    expect(screen.getByText("Comunicação — Conversas Recentes")).toBeInTheDocument();
    expect(screen.getByText("Analytics — Métricas")).toBeInTheDocument();
    expect(screen.getByText("Automação — Execuções")).toBeInTheDocument();
    expect(screen.getByText("Conhecimento")).toBeInTheDocument();

    expect(screen.getByText("Floricultura Bela Vista")).toBeInTheDocument();
    // "Ana Ferreira" (o Lead) aparece duas vezes desde a UX-001 — no CRMWidget e no novo resumo
    // "Atividade recente" do Dashboard (mesmo dado real, apenas reapresentado em dois lugares).
    expect(screen.getAllByText(/Ana Ferreira/).length).toBeGreaterThanOrEqual(1);
  });
});
