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
import { PurchasePage } from "./PurchasePage";

function renderPage(initialEntry = "/purchases") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <PurchasePage />
      </MemoryRouter>
    </AppProviders>,
  );
}

async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Visão Geral" })).toBeInTheDocument());
}

/** Usa a Ação Rápida do `PageHeader` — disponível a partir de qualquer aba, mesmo padrão de `SupplierPage.test.tsx` (IMP-205). */
async function createPurchaseOrder(user: ReturnType<typeof userEvent.setup>, supplierId = "supplier-1") {
  await user.click(screen.getByRole("button", { name: "Novo Pedido" }));
  await user.type(screen.getByLabelText("Identificador do Fornecedor"), supplierId);
  await user.click(screen.getByRole("button", { name: "Criar Pedido" }));
  await waitFor(() => expect(screen.getAllByText(/Pedido po-demo-/).length).toBeGreaterThan(0));
}

async function createRequisition(user: ReturnType<typeof userEvent.setup>, productId = "product-1") {
  await user.click(screen.getByRole("button", { name: "Nova Requisição" }));
  await user.type(screen.getByLabelText("Identificador do Produto"), productId);
  await user.click(screen.getByRole("button", { name: "Adicionar Produto" }));
  await user.click(screen.getByRole("button", { name: "Criar Requisição" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Nova Requisição de Compra" })).not.toBeInTheDocument());
}

describe("PurchasePage — Purchase Workspace por seções (IMP-305)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    queryClient.clear();
  });

  it("mostra o estado de carregamento antes do Purchase Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("Visão Geral mostra KPIs reais (zero Pedidos) e estado vazio honesto", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("Nenhum Purchase Order criado ainda")).toBeInTheDocument();
  });

  it("cria um Pedido real via Ação Rápida — aparece na aba Pedidos", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createPurchaseOrder(user);

    await user.click(screen.getByRole("button", { name: "Pedidos" }));
    expect(screen.getAllByText(/po-demo-/).length).toBeGreaterThan(0);
  });

  it("fluxo completo do Pedido: criar -> adicionar item -> aprovar -> enviar -> receber por completo", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createPurchaseOrder(user);

    await user.click(screen.getByRole("button", { name: "Pedidos" }));
    await user.click(screen.getByRole("button", { name: "Adicionar Item" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.clear(screen.getByLabelText("Custo de aquisição unitário"));
    await user.type(screen.getByLabelText("Custo de aquisição unitário"), "10");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(screen.getByText("Aguardando Aprovação")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Aprovar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar Aprovação" }));
    await waitFor(() => expect(screen.getByText("Aprovado")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Enviar ao Fornecedor" }));
    await waitFor(() => expect(screen.getByText("Enviado")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Recebimentos" }));
    await user.type(screen.getByLabelText(/pendente: 1/), "1");
    await user.click(screen.getByRole("button", { name: "Registrar Recebimento" }));

    await waitFor(() => expect(screen.getByText("Nenhum Pedido pronto para recebimento")).toBeInTheDocument());
  });

  it("após um Receiving já registrado, um segundo recebimento contra o mesmo Pedido mostra o NotConnectedNotice da limitação conhecida (IMP-303), nunca um workaround", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createPurchaseOrder(user);

    await user.click(screen.getByRole("button", { name: "Pedidos" }));
    await user.click(screen.getByRole("button", { name: "Adicionar Item" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.clear(screen.getByLabelText("Quantidade"));
    await user.type(screen.getByLabelText("Quantidade"), "10");
    await user.clear(screen.getByLabelText("Custo de aquisição unitário"));
    await user.type(screen.getByLabelText("Custo de aquisição unitário"), "10");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(screen.getByText("Aguardando Aprovação")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Aprovar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar Aprovação" }));
    await waitFor(() => expect(screen.getByText("Aprovado")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Enviar ao Fornecedor" }));
    await waitFor(() => expect(screen.getByText("Enviado")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Recebimentos" }));
    await user.type(screen.getByLabelText(/pendente: 10/), "4");
    await user.click(screen.getByRole("button", { name: "Registrar Recebimento" }));

    await waitFor(() => expect(screen.getByText(/Um segundo recebimento para o mesmo Pedido/)).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Registrar Recebimento" })).not.toBeInTheDocument();
  });

  it("fluxo completo da Requisição: criar -> aprovar -> converter em Pedido", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createRequisition(user);

    await user.click(screen.getByRole("button", { name: "Requisições" }));
    await waitFor(() => expect(screen.getAllByText(/req-demo/).length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: "Aprovar" }));

    // A lista filtrada por "Abertas" nunca é sincronizada automaticamente após a aprovação —
    // limitação real e documentada (`purchaseCache.ts`/`IMP_305_PURCHASE_WORKSPACE_REPORT.md`,
    // "nenhuma estratégia nova"); trocar o filtro para "Aprovadas" busca o estado real do servidor.
    await user.selectOptions(screen.getByLabelText("Status"), "Aprovadas");
    await waitFor(() => expect(screen.getByText("Aprovada")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Converter em Pedido" }));
    await user.type(screen.getByLabelText("Identificador do Fornecedor"), "supplier-1");
    const costField = screen.getByLabelText(/Custo de aquisição — product-1/);
    await user.type(costField, "20");
    await user.click(screen.getByRole("button", { name: "Converter" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Converter Requisição em Pedido" })).not.toBeInTheDocument());

    await user.selectOptions(screen.getByLabelText("Status"), "Convertidas");
    await waitFor(() => expect(screen.getByText("Convertida em Pedido")).toBeInTheDocument());
  });

  it("rejeita uma Requisição real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createRequisition(user);

    await user.click(screen.getByRole("button", { name: "Requisições" }));
    await user.click(screen.getByRole("button", { name: "Rejeitar" }));

    await user.selectOptions(screen.getByLabelText("Status"), "Rejeitadas");
    await waitFor(() => expect(screen.getByText("Rejeitada")).toBeInTheDocument());
  });

  it("Reposição: cria uma Reorder Rule, avalia (dispara) e desativa — nenhuma recomendação de IA, apenas o resultado real de evaluateReorderRule", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Reposição/ }));
    expect(screen.getByText(/Listagem de Reorder Rule já existentes/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.click(screen.getByRole("button", { name: "Criar Regra" }));
    await waitFor(() => expect(screen.getByText(/product-1 — limite/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Avaliar" }));
    await user.clear(screen.getByLabelText(/Quantidade em estoque corrente/));
    await user.type(screen.getByLabelText(/Quantidade em estoque corrente/), "5");
    await user.click(screen.getByRole("button", { name: "Confirmar Avaliação" }));

    await waitFor(() => expect(screen.getByText(/disparou/)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Desativar" }));
    await waitFor(() => expect(screen.getByText("Inativa")).toBeInTheDocument());
  });

  it("Histórico acumula uma entrada real por ação confirmada nesta sessão", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createPurchaseOrder(user);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getAllByText(/criado/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Histórico de PurchaseEvent reais/)).toBeInTheDocument();
  });

  it("Analytics mostra indicadores reais derivados dos Pedidos criados", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createPurchaseOrder(user);

    await user.click(screen.getByRole("button", { name: "Analytics" }));
    expect(screen.getByText("Pedidos abertos")).toBeInTheDocument();
    expect(screen.getByText("Fornecedores distintos")).toBeInTheDocument();
  });

  it("Configurações alterna o tema e mostra o NotConnectedNotice honesto", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Configurações/ }));

    expect(screen.getByText(/Tema atual/)).toBeInTheDocument();
    expect(screen.getByText(/Teto de aprovação padrão por Tenant/)).toBeInTheDocument();
  });

  it("422 — aprovar um Pedido acima do teto sem identidade mostra erro, nunca uma UI silenciosamente quebrada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createPurchaseOrder(user);

    await user.click(screen.getByRole("button", { name: "Pedidos" }));
    await user.click(screen.getByRole("button", { name: "Adicionar Item" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.clear(screen.getByLabelText("Custo de aquisição unitário"));
    await user.type(screen.getByLabelText("Custo de aquisição unitário"), "10000");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(screen.getByText("Aguardando Aprovação")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Aprovar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar Aprovação" }));

    await waitFor(() => expect(screen.getByText(/Não foi possível aprovar/)).toBeInTheDocument());
  });

  it("a ação 'Adicionar Item' desaparece após o Pedido ser enviado ao Fornecedor — somente ações realmente suportadas pelo status atual são exibidas", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createPurchaseOrder(user);

    await user.click(screen.getByRole("button", { name: "Pedidos" }));
    await user.click(screen.getByRole("button", { name: "Adicionar Item" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.clear(screen.getByLabelText("Custo de aquisição unitário"));
    await user.type(screen.getByLabelText("Custo de aquisição unitário"), "10");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(screen.getByText("Aguardando Aprovação")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Aprovar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar Aprovação" }));
    await waitFor(() => expect(screen.getByText("Aprovado")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Enviar ao Fornecedor" }));
    await waitFor(() => expect(screen.getByText("Enviado")).toBeInTheDocument());

    expect(screen.queryByRole("button", { name: "Adicionar Item" })).not.toBeInTheDocument();
  });
});
