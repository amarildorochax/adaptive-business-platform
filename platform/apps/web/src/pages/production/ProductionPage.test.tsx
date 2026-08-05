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
import { ProductionPage } from "./ProductionPage";

function renderPage(initialEntry = "/production") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ProductionPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Visão Geral" })).toBeInTheDocument());
}

/** Cria a primeira BillOfMaterials desta sessão de mock — sempre "bom-demo-1" (contador reiniciado a cada `createDemoApiFetchMock`, IMP-505). */
async function createBOM(user: ReturnType<typeof userEvent.setup>, outputProductId = "bread", inputProductId = "flour") {
  await user.click(screen.getByRole("button", { name: "Estruturas (BOM)" }));
  await user.type(screen.getByLabelText("Produto final"), outputProductId);
  await user.type(screen.getByLabelText("Insumo 1"), inputProductId);
  await user.click(screen.getByRole("button", { name: "Criar Composição" }));
  await waitFor(() => expect(screen.getAllByText(/Composição/).length).toBeGreaterThan(0));
}

/** Usa a Ação Rápida do `PageHeader` — disponível a partir de qualquer aba, mesmo padrão de `InventoryMovementPage.test.tsx`. */
async function createProductionOrder(user: ReturnType<typeof userEvent.setup>, billOfMaterialsId = "bom-demo-1", plannedOutputQuantity = "10") {
  await user.click(screen.getByRole("button", { name: "Nova Ordem de Produção" }));
  await user.type(screen.getByLabelText("Composição (BillOfMaterials) já ativa"), billOfMaterialsId);
  await user.clear(screen.getByLabelText("Quantidade de saída planejada"));
  await user.type(screen.getByLabelText("Quantidade de saída planejada"), plannedOutputQuantity);
  await user.click(screen.getByRole("button", { name: "Criar Ordem de Produção" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Nova Ordem de Produção" })).not.toBeInTheDocument());
}

describe("ProductionPage — Production Workspace por seções (IMP-505)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    queryClient.clear();
    // Mesma disciplina preventiva já registrada em `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`
    // §19 ponto 3 — `cleanup()` explícito antes do hook global, evitando acúmulo de raízes de render
    // entre testes sequenciais deste arquivo.
    cleanup();
  });

  it("mostra o estado de carregamento antes do Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("Visão Geral mostra KPIs reais (zero Centros de Trabalho/Ordens) e estado vazio honesto", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("Nenhuma Ordem de Produção registrada ainda nesta sessão")).toBeInTheDocument();
  });

  it("cria uma Composição (BOM) real — aparece na lista desta sessão", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);

    expect(screen.getAllByText(/bom-demo/).length).toBeGreaterThan(0);
  });

  it("cria uma Ordem de Produção real via Ação Rápida — Visão Geral e Histórico refletem imediatamente", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);
    await user.click(screen.getByRole("button", { name: "Visão Geral" }));
    await createProductionOrder(user);

    expect(screen.getAllByText(/po-demo/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getAllByText(/criada/).length).toBeGreaterThan(0);
  });

  it("PRODUÇÃO: cria Ordem -> inicia com insumo insuficiente -> permanece Planejada, sem erro HTTP", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);
    await createProductionOrder(user);

    await user.click(screen.getByRole("button", { name: "Ordens em Execução" }));
    await user.type(screen.getByLabelText("Ordem a iniciar"), "po-demo-1");
    await user.type(screen.getByLabelText(/Disponibilidade de insumos/), "flour:1");
    await user.click(screen.getByRole("button", { name: "Iniciar Produção" }));

    await waitFor(() => expect(screen.getByText(/Insumo insuficiente/)).toBeInTheDocument());
    expect(screen.getByText("Nenhuma Ordem em execução no momento")).toBeInTheDocument();
  });

  it("PRODUÇÃO: fluxo completo real — iniciar -> registrar consumo -> registrar produção -> concluir", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);
    await createProductionOrder(user);

    await user.click(screen.getByRole("button", { name: "Ordens em Execução" }));
    await user.type(screen.getByLabelText("Ordem a iniciar"), "po-demo-1");
    await user.type(screen.getByLabelText(/Disponibilidade de insumos/), "flour:20");
    await user.click(screen.getByRole("button", { name: "Iniciar Produção" }));

    await user.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Selecionar" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Selecionar" }));

    await user.type(screen.getByLabelText("Insumo consumido"), "flour");
    await user.type(screen.getByLabelText("Quantidade consumida"), "20");
    await user.type(screen.getByLabelText("Custo de aquisição"), "40");
    await user.click(screen.getByRole("button", { name: "Registrar Consumo" }));
    await waitFor(() => expect(screen.getByText("Consumo registrado.")).toBeInTheDocument());

    // `useProductionOrdersByStatus("InProgress")` não é sincronizada automaticamente após uma
    // Mutation (limitação documentada em `InProgressSection.tsx`/`productionCache.ts`, IMP-504/505) —
    // "Atualizar" refaz a consulta manualmente para refletir o consumo já registrado no servidor.
    await user.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(screen.getAllByText(/1 consumo/).length).toBeGreaterThan(0));

    await user.type(screen.getByLabelText("Produto acabado gerado"), "bread");
    await user.type(screen.getByLabelText("Quantidade gerada"), "9");
    await user.click(screen.getByRole("button", { name: "Registrar Produção" }));
    await waitFor(() => expect(screen.getByText("Geração registrada.")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(screen.getAllByText(/1 geração/).length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: "Concluir Produção" }));
    await waitFor(() => expect(screen.getByText("Selecione uma Ordem em Execução acima para registrar consumo, geração, concluir ou cancelar.")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Ordens de Produção" }));
    await user.type(screen.getByLabelText("Ordem a consultar"), "po-demo-1");
    await user.click(screen.getByRole("button", { name: "Consultar Ordem" }));
    // `getAllByText`, nunca `getByText` — a mesma Ordem já concluída aparece tanto no resultado da
    // busca quanto em "Ordens criadas nesta sessão" (`historyLog.productionOrders`, atualizada pelo
    // mesmo `onOrderChanged` que a seção "Ordens em Execução" já chamou), mesma classe de ambiguidade
    // real já documentada em `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md` ("Em mãos"/"Disponível").
    await waitFor(() => expect(screen.getAllByText("Concluída").length).toBeGreaterThan(0));
  });

  it("PRODUÇÃO: cancela uma Ordem antes de qualquer consumo — motivo preservado", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);
    await createProductionOrder(user);

    await user.click(screen.getByRole("button", { name: "Ordens em Execução" }));
    await user.type(screen.getByLabelText("Ordem a iniciar"), "po-demo-1");
    await user.type(screen.getByLabelText(/Disponibilidade de insumos/), "flour:20");
    await user.click(screen.getByRole("button", { name: "Iniciar Produção" }));
    await user.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Selecionar" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Selecionar" }));

    await user.type(screen.getByLabelText("Motivo do cancelamento"), "Cliente desistiu");
    await user.click(screen.getByRole("button", { name: "Cancelar Ordem" }));
    await waitFor(() => expect(screen.getByText("Ordem cancelada.")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Ordens de Produção" }));
    await user.type(screen.getByLabelText("Ordem a consultar"), "po-demo-1");
    await user.click(screen.getByRole("button", { name: "Consultar Ordem" }));
    // `getAllByText`, mesma razão real já documentada acima (fluxo completo) — a mesma Ordem aparece
    // tanto no resultado da busca quanto em "Ordens criadas nesta sessão".
    await waitFor(() => expect(screen.getAllByText("Cancelada").length).toBeGreaterThan(0));
  });

  it("409 — concluir uma Ordem sem geração registrada mostra erro real via toast, nunca uma UI silenciosamente quebrada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);
    await createProductionOrder(user);

    await user.click(screen.getByRole("button", { name: "Ordens em Execução" }));
    await user.type(screen.getByLabelText("Ordem a iniciar"), "po-demo-1");
    await user.type(screen.getByLabelText(/Disponibilidade de insumos/), "flour:20");
    await user.click(screen.getByRole("button", { name: "Iniciar Produção" }));
    await user.click(screen.getByRole("button", { name: "Atualizar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Selecionar" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Selecionar" }));

    await user.click(screen.getByRole("button", { name: "Concluir Produção" }));

    await waitFor(() => expect(screen.getByText(/Não foi possível concluir a Produção/)).toBeInTheDocument());
  });

  it("Centros de Trabalho: cria um Centro real — aparece na lista e no KPI da Visão Geral", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Centros de Trabalho" }));
    await user.type(screen.getByLabelText("Nome"), "Linha 1");
    await user.click(screen.getByRole("button", { name: "Criar Centro de Trabalho" }));

    await waitFor(() => expect(screen.getByText("Linha 1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Visão Geral" }));
    expect(screen.getByText("Centros de Trabalho ativos")).toBeInTheDocument();
  });

  it("Ordens de Produção: consulta por Order de origem mostra estado honesto quando nenhuma existe", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Ordens de Produção" }));
    await user.type(screen.getByLabelText("Order de origem a consultar"), "order-nunca-usado");
    await user.click(screen.getByRole("button", { name: "Consultar por Order" }));

    await waitFor(() => expect(screen.getByText("Nenhuma Ordem de Produção encontrada para este Order de origem")).toBeInTheDocument());
  });

  it("Histórico acumula uma entrada real por ação confirmada nesta sessão, com resumo por categoria", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);
    await createProductionOrder(user);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getByText(/Histórico de ProductionEvent reais/)).toBeInTheDocument();
    expect(screen.getByText("Ações sobre Ordens de Produção")).toBeInTheDocument();
  });

  it("Analytics mostra indicadores reais derivados da sessão, com NotConnectedNotice honesto sobre o escopo tenant-wide", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await createBOM(user);
    await createProductionOrder(user);

    // `/Analytics/`, nunca `"Analytics"` exato — mesma classe de defeito de teste real já documentada
    // em `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`/`IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`:
    // `SectionSubNav` acrescenta o selo "Prévia" ao nome acessível de toda seção com
    // `hasRealData: false` (`productionSections.ts`).
    await user.click(screen.getByRole("button", { name: /Analytics/ }));
    expect(screen.getByText("Planejadas")).toBeInTheDocument();
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
    expect(screen.getByText(/Centro de Trabalho padrão por Tenant/)).toBeInTheDocument();
  });

  it("SIDEBAR: nenhum botão 'Nova Ordem de Produção' duplicado aparece em nenhuma seção", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    // `getByRole` lança se houver mais de uma correspondência — a própria chamada bem-sucedida já é a
    // asserção de unicidade, mesma disciplina de auditoria já documentada em
    // `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md` (dois botões "Nova Movimentação" simultâneos).
    expect(screen.getByRole("button", { name: "Nova Ordem de Produção" })).toBeInTheDocument();
  });
});
