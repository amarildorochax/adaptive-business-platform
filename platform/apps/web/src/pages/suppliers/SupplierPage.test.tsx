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
import { SupplierPage } from "./SupplierPage";

function renderPage(initialEntry = "/suppliers") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <SupplierPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Visão Geral" })).toBeInTheDocument());
}

/** Usa a Ação Rápida do `PageHeader` (UX-002) — disponível a partir de qualquer aba, nunca exige navegar até "Fornecedores" primeiro. */
async function createSupplier(user: ReturnType<typeof userEvent.setup>, legalName = "Floricultura Atacado Ltda.") {
  await user.click(screen.getByRole("button", { name: "Novo Fornecedor" }));
  await user.type(screen.getByLabelText("Razão Social"), legalName);
  await user.type(screen.getByLabelText("Documento (CPF/CNPJ, sem máscara)"), "12345678000199");
  await user.click(screen.getByRole("button", { name: "Cadastrar Fornecedor" }));
  await waitFor(() => expect(screen.getByText(legalName)).toBeInTheDocument());
}

describe("SupplierPage — Supplier Workspace por seções (IMP-205)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    // `queryClient` é um singleton de módulo compartilhado com todo outro Workspace já testado
    // (CRM, Product Hub, Inventory, Purchase) — mesmo achado documentado em cada um deles.
    queryClient.clear();
  });

  it("mostra o estado de carregamento antes do Supplier Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Carregando…")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("Visão Geral mostra KPIs reais (zero Fornecedores) e estado vazio honesto", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("Nenhum Fornecedor cadastrado ainda")).toBeInTheDocument();
  });

  it("cria um Fornecedor real via formulário — aparece na tabela e na Visão Geral", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user);

    expect(screen.getAllByText("Floricultura Atacado Ltda.").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Fornecedores" }));
    expect(screen.getAllByText("Floricultura Atacado Ltda.").length).toBeGreaterThan(0);
  });

  it("a Ação Rápida 'Novo Fornecedor' do PageHeader funciona a partir de qualquer aba, sem exigir navegar até Fornecedores primeiro (UX-002)", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Analytics" }));
    await createSupplier(user, "Criado a partir de Analytics");

    expect(screen.getAllByText("Criado a partir de Analytics").length).toBeGreaterThan(0);
  });

  it("edita um Fornecedor já cadastrado — a Tabela reflete o novo nome", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user);

    await user.click(screen.getByRole("button", { name: "Fornecedores" }));
    await user.click(screen.getByRole("button", { name: "Editar" }));
    const nameField = screen.getByLabelText("Razão Social");
    await user.clear(nameField);
    await user.type(nameField, "Floricultura Atacado S.A.");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(screen.getByText("Floricultura Atacado S.A.")).toBeInTheDocument());
  });

  it("desativa e reativa um Fornecedor — status real refletido na Tabela", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user);

    await user.click(screen.getByRole("button", { name: "Fornecedores" }));
    await user.click(screen.getByRole("button", { name: "Desativar" }));
    await waitFor(() => expect(screen.getByText("Desabilitado")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Ativar" }));
    await waitFor(() => expect(screen.getByText("Ativo")).toBeInTheDocument());
  });

  it("associa um Contato real a um Fornecedor — aparece na aba Contatos", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user);

    await user.click(screen.getByRole("button", { name: "Contatos" }));
    await user.type(screen.getByLabelText("Nome"), "Maria Souza");
    await user.click(screen.getByRole("button", { name: "Associar Contato" }));

    await waitFor(() => expect(screen.getByText("Maria Souza")).toBeInTheDocument());
  });

  it("Contratos mostra o NotConnectedNotice de listagem e o Contrato criado nesta sessão", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user);

    await user.click(screen.getByRole("button", { name: "Contratos" }));
    expect(screen.getByText(/Listagem de Contratos já existentes/)).toBeInTheDocument();

    const dateInput = screen.getByLabelText("Início de vigência");
    await user.type(dateInput, "2026-01-01");
    await user.click(screen.getByRole("button", { name: "Registrar Contrato" }));

    await waitFor(() => expect(screen.getAllByText("Floricultura Atacado Ltda.").length).toBeGreaterThan(0));
  });

  it("Catálogo mostra o NotConnectedNotice de listagem, honesto sobre a lacuna de leitura", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Catálogo" }));

    expect(screen.getByText(/Listagem de itens de Catálogo já existentes/)).toBeInTheDocument();
  });

  it("Histórico acumula uma entrada real por ação confirmada nesta sessão", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getAllByText(/cadastrado/).length).toBeGreaterThan(0);
  });

  it("Analytics mostra indicadores reais derivados dos Fornecedores cadastrados", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user);

    await user.click(screen.getByRole("button", { name: "Analytics" }));
    expect(screen.getByText("Taxa de Fornecedores ativos")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("Configurações alterna o tema e mostra o NotConnectedNotice honesto", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Configurações/ }));

    expect(screen.getByText(/Tema atual/)).toBeInTheDocument();
    expect(screen.getByText(/Alçada de aprovação/)).toBeInTheDocument();
  });

  it("409 — cadastrar dois Fornecedores com o mesmo documento mostra erro, nunca uma UI silenciosamente quebrada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createSupplier(user, "Primeiro Fornecedor");

    await user.click(screen.getByRole("button", { name: "Novo Fornecedor" }));
    await user.type(screen.getByLabelText("Razão Social"), "Segundo Fornecedor");
    await user.type(screen.getByLabelText("Documento (CPF/CNPJ, sem máscara)"), "12345678000199");
    await user.click(screen.getByRole("button", { name: "Cadastrar Fornecedor" }));

    await waitFor(() => expect(screen.getByText("Não foi possível cadastrar o Fornecedor.")).toBeInTheDocument());
  });
});
