// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@app/providers/AppProviders";
import { clearAuthSession } from "@core/auth/authSessionStorage.js";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { DEMO_TENANT_ID } from "@core/managers/seedDemoData";
import { queryClient } from "@core/query/queryClient";
import { createAppRoutes } from "./routes";

function renderAt(path: string) {
  const router = createMemoryRouter(createAppRoutes(), { initialEntries: [path] });
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}

describe("Roteamento multi-página (FUN-002) — atrás de RequireAuth desde a FUN-100", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock(DEMO_TENANT_ID)));
    seedAuthenticatedSession(DEMO_TENANT_ID);
    // `queryClient` (`core/query/queryClient.ts`) é um singleton de módulo — ver o mesmo achado
    // documentado em `CRMPage.test.tsx` (FUN-103): `["crm","workspace"]`/`["dashboard","bootstrap"]`
    // usam uma chave fixa, não isolada por Tenant, então um teste anterior que já tenha mutado esse
    // cache poderia vazar para o próximo `renderAt(...)` deste arquivo sem esta limpeza.
    queryClient.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
  });

  it("renderiza o Dashboard na rota raiz", async () => {
    renderAt("/");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Visão Geral" })).toBeInTheDocument());
  });

  it("renderiza a página dedicada de CRM em /crm, reaproveitando o mesmo bootstrap", async () => {
    renderAt("/crm");
    await waitFor(() => expect(screen.getByRole("heading", { name: "CRM" })).toBeInTheDocument());
    await waitFor(() => expect(screen.getAllByText("Oportunidades").length).toBeGreaterThan(0));
  });

  it("renderiza a página dedicada de Branding em /branding, incluindo o resumo de Tokens da Visão Geral", async () => {
    renderAt("/branding");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Branding" })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Cores geradas")).toBeInTheDocument());
  });

  it("renderiza ComingSoonPage para um Manager mapeado e ainda não conectado", async () => {
    renderAt("/finance");
    await waitFor(() => expect(screen.getByRole("heading", { name: "Finance" })).toBeInTheDocument());
    expect(screen.getByText("FinanceManager", { exact: false })).toBeInTheDocument();
  });
});
