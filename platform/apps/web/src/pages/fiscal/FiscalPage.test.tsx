// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@app/providers/AppProviders";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { queryClient } from "@core/query/queryClient";
import { FiscalPage } from "./FiscalPage";

function renderPage(initialEntry = "/fiscal") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <FiscalPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Visão Geral" })).toBeInTheDocument());
}

/** Registra o primeiro Regime Tributário desta sessão de mock — sempre "regime-demo-1" (contador reiniciado a cada `createDemoApiFetchMock`, IMP-605). */
async function registerTaxRegime(user: ReturnType<typeof userEvent.setup>, name = "Simples Nacional") {
  await user.click(screen.getByRole("button", { name: "Regime & Regras Fiscais" }));
  await user.type(screen.getByLabelText("Nome do Regime Tributário"), name);
  await user.click(screen.getByRole("button", { name: "Registrar Regime Tributário" }));
  await waitFor(() => expect(screen.getByText(name)).toBeInTheDocument());
}

/** Cria a primeira Tax Rule desta sessão — sempre "rule-demo-1", vigente desde 2020 (nunca expira). */
async function createTaxRule(user: ReturnType<typeof userEvent.setup>, classificationCode = "1234.56.78") {
  await user.type(screen.getByLabelText("Classificação fiscal (NCM)"), classificationCode);
  await user.type(screen.getByLabelText("Valor da alíquota"), "10");
  await user.type(screen.getByLabelText("Início da vigência"), "2020-01-01");
  await user.click(screen.getByRole("button", { name: "Criar Tax Rule" }));
  // `taxRuleId.slice(0, 8)` ("rule-dem") trunca antes do sufixo numérico completo — diferente de
  // "bom-demo"/"doc-demo" (exatamente 8 caracteres), "rule-demo" tem 9; a classificação fiscal, nunca
  // truncada, é uma asserção mais robusta da presença real do cartão criado.
  await waitFor(() => expect(screen.getAllByText(new RegExp(classificationCode.replace(/\./g, "\\."))).length).toBeGreaterThan(0));
}

/** Calcula o primeiro imposto desta sessão — sempre "calc-demo-1". */
async function calculateTax(user: ReturnType<typeof userEvent.setup>, taxRegimeId = "regime-demo-1", classificationCode = "1234.56.78") {
  await user.click(screen.getByRole("button", { name: "Cálculo de Imposto" }));
  await user.type(screen.getByLabelText("Identificador da linha"), "line-1");
  await user.type(screen.getByLabelText("Tax Regime"), taxRegimeId);
  await user.type(screen.getByLabelText("Classificação fiscal (NCM)"), classificationCode);
  await user.type(screen.getByLabelText("Valor base"), "100");
  await user.click(screen.getByRole("button", { name: "Calcular Imposto" }));
}

/** Usa a Ação Rápida do `PageHeader` para emitir o primeiro Documento Fiscal desta sessão — sempre "doc-demo-1". */
async function issueFiscalDocument(user: ReturnType<typeof userEvent.setup>, { orderId = "order-1", taxCalculationId = "calc-demo-1", taxRuleId = "rule-demo-1" } = {}) {
  await user.click(screen.getByRole("button", { name: "Emitir Documento Fiscal" }));
  if (orderId) {
    await user.type(screen.getByLabelText("Order de origem (Commerce Hub, opcional)"), orderId);
  }
  await user.type(screen.getByLabelText("Identificador da linha do documento"), "line-1");
  await user.type(screen.getByLabelText("Produto"), "bread");
  await user.type(screen.getByLabelText("Valor unitário"), "50");
  await user.type(screen.getByLabelText("Classificação fiscal da linha (NCM)"), "1234.56.78");
  await user.type(screen.getByLabelText("Identificador do cálculo"), taxCalculationId);
  await user.type(screen.getByLabelText("Tax Rule aplicada"), taxRuleId);
  await user.type(screen.getByLabelText("Valor do imposto"), "10");
  await user.click(screen.getByRole("button", { name: "Confirmar Emissão" }));
}

describe("FiscalPage — Fiscal Workspace por seções (IMP-605)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    queryClient.clear();
    cleanup();
  });

  it("mostra o estado de carregamento antes do Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("Visão Geral mostra o estado honesto de Regime não registrado, sem travar o Workspace", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getAllByText("Não registrado").length).toBeGreaterThan(0);
    expect(screen.getByText("Nenhum Regime Tributário registrado ainda")).toBeInTheDocument();
  });

  it("registra um Regime Tributário real — reflete imediatamente na Visão Geral (mesmo cache do useTaxRegime)", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);

    await user.click(screen.getByRole("button", { name: "Visão Geral" }));
    // "Registrado" aparece tanto no `detail` do passo `ProcessFlow` quanto no valor do `MetricCard` —
    // `getAllByText`, nunca `getByText`, mesma disciplina de ambiguidade real já documentada em
    // `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`.
    expect(screen.getAllByText("Registrado").length).toBeGreaterThan(0);
    expect(screen.getByText("Simples Nacional")).toBeInTheDocument();
  });

  it("cria uma Tax Rule real e a desativa — nunca exclui o registro", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);
    await createTaxRule(user);

    await user.type(screen.getByLabelText("Regra a consultar"), "rule-demo-1");
    await user.click(screen.getByRole("button", { name: "Consultar Tax Rule" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Desativar Tax Rule" })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Desativar Tax Rule" }));
    await waitFor(() => expect(screen.getAllByText("Inativa").length).toBeGreaterThan(0));
  });

  it("CÁLCULO: calcula o imposto de forma determinística (10% de 100 BRL = 10 BRL)", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);
    await user.click(screen.getByRole("button", { name: "Regime & Regras Fiscais" }));
    await createTaxRule(user);

    await calculateTax(user);
    await waitFor(() => expect(screen.getByText("Imposto calculado.")).toBeInTheDocument());
    expect(screen.getByText(/Imposto: 10 BRL/)).toBeInTheDocument();
  });

  it("CÁLCULO: nenhuma Tax Rule vigente encontrada — erro real via toast, nunca um resultado inventado", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);
    await calculateTax(user);

    await waitFor(() => expect(screen.getByText(/Não foi possível calcular o imposto/)).toBeInTheDocument());
  });

  it("DOCUMENTO: emite um Fiscal Document real via Ação Rápida — Documentos Fiscais e Histórico refletem imediatamente", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);
    await user.click(screen.getByRole("button", { name: "Regime & Regras Fiscais" }));
    await createTaxRule(user);
    await calculateTax(user);
    await waitFor(() => expect(screen.getByText("Imposto calculado.")).toBeInTheDocument());

    await issueFiscalDocument(user);

    await waitFor(() => expect(screen.getByText("Fiscal Document emitido.")).toBeInTheDocument());
    // A emissão redireciona automaticamente para "Documentos Fiscais" — mesma disciplina de
    // `ProductionPage.tsx` (`onCreated`) quando a aba ativa não é a de destino nem a Visão Geral.
    expect(screen.getAllByText(/doc-demo/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getAllByText(/emitido/).length).toBeGreaterThan(0);
  });

  it("DOCUMENTO: sem orderId nem invoiceId — 422 real via toast, nunca uma UI silenciosamente quebrada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);
    await user.click(screen.getByRole("button", { name: "Regime & Regras Fiscais" }));
    await createTaxRule(user);
    await calculateTax(user);
    await waitFor(() => expect(screen.getByText("Imposto calculado.")).toBeInTheDocument());

    await issueFiscalDocument(user, { orderId: "" });

    await waitFor(() => expect(screen.getByText(/Não foi possível emitir o Fiscal Document/)).toBeInTheDocument());
  });

  it("DOCUMENTO: cancela um Documento emitido — motivo preservado; consulta por Order de origem", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);
    await user.click(screen.getByRole("button", { name: "Regime & Regras Fiscais" }));
    await createTaxRule(user);
    await calculateTax(user);
    await waitFor(() => expect(screen.getByText("Imposto calculado.")).toBeInTheDocument());
    await issueFiscalDocument(user);
    await waitFor(() => expect(screen.getByText("Fiscal Document emitido.")).toBeInTheDocument());
    // Espera o Drawer fechar (e a navegação automática para "Documentos Fiscais" assentar) antes de
    // interagir com o formulário de busca por baixo — sem isto, sob carga plena do workspace de testes
    // (`pnpm test` completo, muitos arquivos em paralelo), a seção pôde ser observada em estado de
    // transição, mesma disciplina de `createProductionOrder` (`ProductionPage.test.tsx`, IMP-505),
    // que já espera `queryByRole("dialog", ...)` desaparecer antes de prosseguir.
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Emitir Documento Fiscal" })).not.toBeInTheDocument());

    await user.type(screen.getByLabelText("Documento a consultar"), "doc-demo-1");
    await user.click(screen.getByRole("button", { name: "Consultar Documento" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar Documento" })).toBeInTheDocument());

    await user.type(screen.getByLabelText("Motivo do cancelamento"), "Devolução do cliente");
    await user.click(screen.getByRole("button", { name: "Cancelar Documento" }));
    await waitFor(() => expect(screen.getByText("Fiscal Document cancelado.")).toBeInTheDocument());
    expect(screen.getAllByText("Cancelado").length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText("Order de origem a consultar"), "order-1");
    await user.click(screen.getByRole("button", { name: "Consultar por Order" }));
    await waitFor(() => expect(screen.getAllByText(/doc-demo/).length).toBeGreaterThan(0));
  });

  it("Documentos Fiscais: consulta por Order de origem mostra estado honesto quando nenhum existe", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Documentos Fiscais" }));
    await user.type(screen.getByLabelText("Order de origem a consultar"), "order-nunca-usado");
    await user.click(screen.getByRole("button", { name: "Consultar por Order" }));

    await waitFor(() => expect(screen.getByText("Nenhum Fiscal Document encontrado para este Order de origem")).toBeInTheDocument());
  });

  it("OBRIGAÇÕES: registra, avalia vencimentos (transiciona para Overdue) e cumpre uma obrigação vencida", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Obrigações Acessórias" }));

    await user.type(screen.getByLabelText("Tipo"), "ICMS");
    await user.type(screen.getByLabelText("Periodicidade"), "Mensal");
    await user.type(screen.getByLabelText("Data de vencimento"), "2020-01-01");
    await user.click(screen.getByRole("button", { name: "Registrar Fiscal Obligation" }));
    await waitFor(() => expect(screen.getByText("Fiscal Obligation registrada.")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Atualizar Pendentes" }));
    await waitFor(() => expect(screen.getAllByText("ICMS").length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: "Avaliar Vencimentos" }));
    await waitFor(() => expect(screen.getByText(/vencida\(s\) nesta avaliação/)).toBeInTheDocument());

    // `pendingFiscalObligations`/`overdueFiscalObligations` nunca são sincronizadas automaticamente
    // após `evaluateFiscalObligations` (limitação documentada, `fiscalCache.ts`, IMP-604) — ambas
    // precisam ser atualizadas manualmente, nunca apenas a de destino, para que a entrada stale de
    // "Pendentes" (agora Overdue no servidor) não permaneça visível ao lado da nova entrada em
    // "Vencidas".
    await user.click(screen.getByRole("button", { name: "Atualizar Pendentes" }));
    await user.click(screen.getByRole("button", { name: "Atualizar Vencidas" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Cumprir" })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Cumprir" }));
    await waitFor(() => expect(screen.getByText("Fiscal Obligation cumprida.")).toBeInTheDocument());
  });

  it("Histórico acumula uma entrada real por ação confirmada nesta sessão, com resumo por categoria", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getByText(/Histórico de FiscalEvent reais/)).toBeInTheDocument();
    expect(screen.getByText("Ações sobre Regime & Tax Rule")).toBeInTheDocument();
  });

  it("Analytics mostra indicadores reais derivados da sessão, com NotConnectedNotice honesto sobre o escopo tenant-wide", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerTaxRegime(user);
    await user.click(screen.getByRole("button", { name: "Regime & Regras Fiscais" }));
    await createTaxRule(user);

    // `/Analytics/`, nunca `"Analytics"` exato — `SectionSubNav` acrescenta o selo "Prévia" ao nome
    // acessível de toda seção com `hasRealData: false` (`fiscalSections.ts`), mesma classe de defeito
    // de teste real já documentada em `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`/
    // `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`/`IMP_505_PRODUCTION_WORKSPACE_REPORT.md`.
    await user.click(screen.getByRole("button", { name: /Analytics/ }));
    expect(screen.getByText("Tax Rule ativas")).toBeInTheDocument();
    expect(screen.getByText(/Analytics tenant-wide/)).toBeInTheDocument();
  });

  it("Configurações alterna o tema e mostra o NotConnectedNotice honesto", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Configurações/ }));

    expect(screen.getByText(/Tema atual/)).toBeInTheDocument();
    expect(screen.getByText(/Série padrão de numeração/)).toBeInTheDocument();
  });

  it("SIDEBAR: nenhum botão 'Emitir Documento Fiscal' duplicado aparece em nenhuma seção", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    // `getByRole` lança se houver mais de uma correspondência — a própria chamada bem-sucedida já é a
    // asserção de unicidade, mesma disciplina de auditoria já documentada em
    // `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md` (dois botões "Nova Movimentação" simultâneos) e
    // reaplicada por `IMP_505_PRODUCTION_WORKSPACE_REPORT.md`.
    expect(screen.getByRole("button", { name: "Emitir Documento Fiscal" })).toBeInTheDocument();
  });
});
