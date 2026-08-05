// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@app/providers/AppProviders";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { queryClient } from "@core/query/queryClient";
import { InventoryPage } from "./InventoryPage";

function renderPage(initialEntry = "/inventory") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <InventoryPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

/**
 * Aguarda o Inventory Workspace inteiro estar pronto — mesmo cuidado documentado em
 * `ProductHubPage.test.tsx` (FUN-104): sem esperar as consultas extras da Visão Geral
 * (`useBusinessProfileSummary`/`useBrandIdentity`/`useCrmWorkspace`), elas continuariam pendentes em
 * segundo plano ao trocar de seção, contaminando o mock de `fetch` do teste seguinte.
 */
async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getAllByText("Itens cadastrados").length).toBeGreaterThan(0));
  await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
}

describe("InventoryPage — Inventory Workspace por seções (FUN-105)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    // `queryClient` é um singleton de módulo compartilhado com `/commerce` (mesmo cache
    // `["commerce","workspace"]`) — mesmo achado já documentado em `CRMPage.test.tsx` (FUN-103) e
    // `ProductHubPage.test.tsx` (FUN-104): sem limpar entre testes, um teste reaproveitaria
    // silenciosamente o Workspace já mutado pelo teste anterior.
    queryClient.clear();
  });

  it("mostra o estado de carregamento antes do Inventory Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Carregando…")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("mostra a Visão Geral (Inventory Dashboard) por padrão, com KPIs (Cards) reais e o NotConnectedNotice de Reservados/Em composição", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getByText("Disponíveis")).toBeInTheDocument();
    expect(screen.getByText("Sem estoque")).toBeInTheDocument();
    expect(screen.getByText(/Reservados, Em composição/)).toBeInTheDocument();
  });

  it("o Inventário lista o item real em InventoryCard e permite filtrar por status", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /^Inventário/ }));

    expect(screen.getByText("Arranjo Floral Executivo")).toBeInTheDocument();
    expect(screen.getAllByText("Em estoque").length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText("Status"), "out-of-stock");
    expect(screen.getByText("Nenhum item encontrado")).toBeInTheDocument();
  });

  it("Movimentações reutiliza a Timeline compartilhada, mostra Entrada real com o delta conhecido e permite registrar uma nova movimentação", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Movimentações/ }));

    expect(screen.getByRole("list", { name: "Movimentações de Estoque" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Quantidade (+ entrada / − saída)"), "15");
    await user.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => expect(screen.getAllByText(/\+15 unidades/).length).toBeGreaterThan(0));
    expect(screen.getAllByText("Entrada").length).toBeGreaterThan(0);
  });

  it("Disponibilidade mostra a quantidade real e o NotConnectedNotice de Reservado/Em uso", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Disponibilidade/ }));

    expect(screen.getByText(/Reservado, Em uso/)).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("Reservas é inteiramente placeholder — NotConnectedNotice e estado vazio, nenhuma persistência inventada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Reservas/ }));

    expect(screen.getByText(/Reservas de estoque/)).toBeInTheDocument();
    expect(screen.getByText("Reservas ainda não são suportadas")).toBeInTheDocument();
  });

  it("Alertas deriva 'Rascunhos' de dado real (todo Produto criado por este Workspace permanece Draft)", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Alertas/ }));

    expect(screen.getByText("Rascunhos")).toBeInTheDocument();
    expect(screen.getAllByText("Arranjo Floral Executivo").length).toBeGreaterThan(0);
  });

  it("o Histórico reutiliza o mesmo componente de seção do Product Hub (HistorySection), sem duplicação", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Histórico/ }));

    expect(screen.getByRole("list", { name: "Histórico do Product Hub" })).toBeInTheDocument();
  });
});
