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
import { ProductHubPage } from "./ProductHubPage";

function renderPage(initialEntry = "/commerce") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ProductHubPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

/**
 * Aguarda o Product Hub Workspace inteiro estar pronto — incluindo as consultas extras da Visão
 * Geral (`useBusinessProfileSummary`/`useBrandIdentity`/`useCrmWorkspace`, seção "Integração"). Mesmo
 * cuidado documentado em `CRMPage.test.tsx` (FUN-103) — sem isso, consultas pendentes em segundo
 * plano poderiam contaminar o mock de `fetch` do teste seguinte.
 */
async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getAllByText("Movimentações").length).toBeGreaterThan(0));
  await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
}

describe("ProductHubPage — Product Hub Workspace por seções (FUN-104)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    // `queryClient` é um singleton de módulo — mesmo achado já documentado em `CRMPage.test.tsx`
    // (FUN-103): `["commerce","workspace"]` é mutado de forma diferente por cada teste (criar
    // Produto, ajustar Estoque, definir Preço) — sem limpar o cache entre testes, um teste
    // reaproveitaria silenciosamente o Workspace já modificado pelo teste anterior.
    queryClient.clear();
  });

  it("mostra o estado de carregamento antes do Product Hub Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Carregando…")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("mostra a Visão Geral por padrão, com KPIs (Cards) reais derivados do Product Hub Workspace", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getAllByText("Categorias").length).toBeGreaterThan(0);
    expect(screen.getByText("Itens ativos")).toBeInTheDocument();
    expect(screen.getByText("Valor estimado em estoque")).toBeInTheDocument();
    expect(screen.getByText("Movimentações")).toBeInTheDocument();
    expect(screen.getByText(/Publicação de Produto/)).toBeInTheDocument();
  });

  it("o Catálogo lista o Produto real em ProductCard e permite criar um novo Produto real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /^Catálogo/ }));

    expect(screen.getByText("Arranjo Floral Executivo")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nome"), "Vaso Decorativo");
    await user.click(screen.getByRole("button", { name: "Criar Produto" }));

    await waitFor(() => expect(screen.getByText("Vaso Decorativo")).toBeInTheDocument());
  });

  it("Categorias lista a Categoria real e permite criar uma nova Categoria real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Categorias/ }));

    expect(screen.getAllByText("Arranjos").length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText("Nome"), "Acessórios");
    await user.click(screen.getByRole("button", { name: "Criar Categoria" }));

    await waitFor(() => expect(screen.getAllByText("Acessórios").length).toBeGreaterThan(0));
  });

  it("Composições é inteiramente placeholder — NotConnectedNotice e estado vazio, nenhuma persistência inventada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Composições/ }));

    expect(screen.getByText(/Kit, Combo, Pacote, Conjunto/)).toBeInTheDocument();
    expect(screen.getByText("Produtos compostos ainda não são suportados")).toBeInTheDocument();
  });

  it("Estoque mostra a quantidade real e permite ajustar o Estoque via Command real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Estoque/ }));

    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("Em estoque")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Ajuste (+ entrada / − saída)"), "10");
    await user.click(screen.getByRole("button", { name: "Ajustar" }));

    await waitFor(() => expect(screen.getByText("50")).toBeInTheDocument());
  });

  it("Precificação mostra o Preço vigente e permite definir um novo Preço via Command real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Precificação/ }));

    await waitFor(() => expect(screen.getAllByText(/R\$\s*189,90/).length).toBeGreaterThan(0));

    await user.clear(screen.getByLabelText("Valor"));
    await user.type(screen.getByLabelText("Valor"), "249.9");
    await user.click(screen.getByRole("button", { name: "Definir Preço" }));

    await waitFor(() => expect(screen.getAllByText(/R\$\s*249,90/).length).toBeGreaterThan(0));
  });

  it("o Histórico reutiliza o componente Timeline do Design System, com CommerceEvent reais do bootstrap", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Histórico/ }));

    expect(screen.getByRole("list", { name: "Histórico do Product Hub" })).toBeInTheDocument();
    expect(screen.getAllByText(/Produto criado/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Preço alterado/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Estoque ajustado/).length).toBeGreaterThan(0);
  });
});
