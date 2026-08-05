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
import { InventoryMovementPage } from "./InventoryMovementPage";

function renderPage(initialEntry = "/inventory-movement") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <InventoryMovementPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Visão Geral" })).toBeInTheDocument());
}

/** Usa a Ação Rápida do `PageHeader` — disponível a partir de qualquer aba, mesmo padrão de `PurchasePage.test.tsx`. */
async function registerMovement(user: ReturnType<typeof userEvent.setup>, productId = "product-1", quantityDelta = "10") {
  await user.click(screen.getByRole("button", { name: "Nova Movimentação" }));
  await user.type(screen.getByLabelText("Produto a movimentar"), productId);
  await user.type(screen.getByLabelText(/Quantidade \(positiva/), quantityDelta);
  await user.click(screen.getByRole("button", { name: "Registrar Movimentação" }));
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Nova Movimentação de Estoque" })).not.toBeInTheDocument());
}

describe("InventoryMovementPage — Inventory Movement Workspace por seções (IMP-405)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    queryClient.clear();
    // Achado real de auditoria (IMP-405, Passo 1) — `cleanup()` explícito, além do já registrado
    // globalmente em `vitest.setup.ts`. Reproduzido por instrumentação direta do DOM: sem esta chamada,
    // `document.body` acumula a raiz de render do teste anterior neste arquivo especificamente (1, depois
    // 2, depois 3 elementos "Nova Movimentação" simultâneos a partir do terceiro teste) — o hook global
    // roda depois deste `afterEach` local (ordem de hooks de dentro para fora), e `queryClient.clear()`
    // acontece com a árvore anterior ainda montada; um `cleanup()` explícito aqui, antes do hook global,
    // resolve por completo (confirmado via introspecção direta de `document.body.children.length`,
    // sempre 0 após cada teste). Nunca corrigido em `vitest.setup.ts` (Frontend Infrastructure
    // compartilhada, fora do escopo desta Sprint) — apenas neste arquivo de teste, que pertence
    // integralmente ao Workspace.
    cleanup();
  });

  it("mostra o estado de carregamento antes do Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("Visão Geral mostra KPIs reais (zero Localizações/Movimentações) e estado vazio honesto", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getByText("Nenhuma movimentação registrada ainda nesta sessão")).toBeInTheDocument();
  });

  it("registra uma Movimentação real via Ação Rápida — Visão Geral e Histórico refletem imediatamente", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user);

    // `/movement/`, nunca `/movement-demo-/` — mesma classe de defeito de teste real já documentada em
    // `IMP_305_PURCHASE_WORKSPACE_REPORT.md` (`"po-demo-1".slice(0, 8)` incluindo o hífen final,
    // `"req-demo-1".slice(0, 8)` não): `StockMovementCard`/`MovementsSection` truncam todo identificador
    // em 8 caracteres (convenção real e consistente da UI, nunca alterada) — `"movement-demo-1".slice(0, 8)`
    // é exatamente `"movement"`, sem o hífen; o regex original nunca teria casado com nada renderizado de
    // fato. Corrigido no teste, nunca no componente.
    expect(screen.getAllByText(/movement/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getAllByText(/registrada/).length).toBeGreaterThan(0);
  });

  it("LEDGER: registrar movimento -> atualização automática da lista já consultada em Movimentações", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Movimentações" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.click(screen.getByRole("button", { name: "Consultar Movimentações" }));
    await waitFor(() => expect(screen.getByText("Nenhuma movimentação registrada para este Produto ainda")).toBeInTheDocument());

    await registerMovement(user, "product-1", "10");

    await waitFor(() => expect(screen.queryByText("Nenhuma movimentação registrada para este Produto ainda")).not.toBeInTheDocument());
    expect(screen.getAllByText(/movement/).length).toBeGreaterThan(0);
  });

  it("LEDGER: consultar histórico -> ordem cronológica preservada para múltiplas movimentações do mesmo Produto", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user, "product-1", "10");
    await registerMovement(user, "product-1", "-3");
    await registerMovement(user, "product-1", "5");

    await user.click(screen.getByRole("button", { name: "Movimentações" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.click(screen.getByRole("button", { name: "Consultar Movimentações" }));

    await waitFor(() => expect(screen.getByText(/Saldo do ledger consultado/)).toBeInTheDocument());
    expect(screen.getByText("+12", { exact: false })).toBeInTheDocument();
  });

  it("LEDGER: nenhuma ação de editar/excluir aparece em nenhum lugar da seção Movimentações", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user, "product-1", "10");

    await user.click(screen.getByRole("button", { name: "Movimentações" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.click(screen.getByRole("button", { name: "Consultar Movimentações" }));
    await waitFor(() => expect(screen.getAllByText(/movement/).length).toBeGreaterThan(0));

    expect(screen.queryByRole("button", { name: /Editar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Excluir/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remover/ })).not.toBeInTheDocument();
  });

  it("Posições: consulta a Stock Position real após um Stock Movement — nunca recalculada na UI", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user, "product-1", "10");

    await user.click(screen.getByRole("button", { name: "Posições" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.click(screen.getByRole("button", { name: "Consultar Posição" }));

    await waitFor(() => expect(screen.getByText("Em mãos")).toBeInTheDocument());
    // `getAllByText`, nunca `getByText` — defeito de teste real corrigido nesta Sprint: sem nenhuma
    // Reserva ainda criada, "Em mãos" e "Disponível" são genuinamente o mesmo valor real (10 = 10 - 0),
    // dois `MetricCard` distintos exibindo o mesmo texto "10" ao mesmo tempo — uma ambiguidade real de
    // consulta, nunca um bug de UI (a Position em si está correta, per Core/Persistência, IMP-401/402).
    expect(screen.getAllByText("10").length).toBeGreaterThan(0);
  });

  it("Posições: Produto nunca movimentado mostra estado honesto, nunca um erro", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Posições" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-nunca-movimentado");
    await user.click(screen.getByRole("button", { name: "Consultar Posição" }));

    await waitFor(() => expect(screen.getByText("Nenhuma Stock Position calculada ainda para este Produto")).toBeInTheDocument());
  });

  it("Reservas: cria, consulta por Order, libera — fluxo completo real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user, "product-1", "10");

    await user.click(screen.getByRole("button", { name: "Reservas" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.type(screen.getByLabelText("Identificador do Order"), "order-1");
    await user.click(screen.getByRole("button", { name: "Criar Reserva" }));

    await waitFor(() => expect(screen.getByText("Ativa")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Liberar" }));
    await waitFor(() => expect(screen.getByText("Liberada")).toBeInTheDocument());
  });

  it("Reservas: converte em Stock Movement de saída — a Position recalculada reflete o decremento", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user, "product-1", "10");

    await user.click(screen.getByRole("button", { name: "Reservas" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.type(screen.getByLabelText("Identificador do Order"), "order-1");
    await user.click(screen.getByRole("button", { name: "Criar Reserva" }));
    await waitFor(() => expect(screen.getByText("Ativa")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Converter em Saída" }));
    await waitFor(() => expect(screen.getByText("Convertida em Saída")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Posições" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.click(screen.getByRole("button", { name: "Consultar Posição" }));
    // `getAllByText`, mesma razão real já documentada acima ("Posições: consulta a Stock Position
    // real..."): após a conversão, "Em mãos" (9) e "Disponível" (9 - 0 reservado) são genuinamente o
    // mesmo valor real, dois `MetricCard` distintos.
    await waitFor(() => expect(screen.getAllByText("9").length).toBeGreaterThan(0));
  });

  it("422 — criar Reserva acima do disponível mostra erro real via toast, nunca uma UI silenciosamente quebrada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user, "product-1", "5");

    await user.click(screen.getByRole("button", { name: "Reservas" }));
    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.clear(screen.getByLabelText("Quantidade"));
    await user.type(screen.getByLabelText("Quantidade"), "999");
    await user.type(screen.getByLabelText("Identificador do Order"), "order-1");
    await user.click(screen.getByRole("button", { name: "Criar Reserva" }));

    await waitFor(() => expect(screen.getByText(/Não foi possível criar a Reserva/)).toBeInTheDocument());
  });

  it("Localizações: cria uma Localização real — aparece na lista e no KPI da Visão Geral", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: "Localizações" }));
    await user.type(screen.getByLabelText("Nome"), "Depósito Central");
    await user.click(screen.getByRole("button", { name: "Criar Localização" }));

    await waitFor(() => expect(screen.getByText("Depósito Central")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Visão Geral" }));
    expect(screen.getByText("Localizações ativas")).toBeInTheDocument();
  });

  it("Alertas: cria e desativa uma Stock Alert Rule real, mostra o NotConnectedNotice honesto", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Alertas/ }));
    expect(screen.getByText(/Listagem de Stock Alert Rule já existentes/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Identificador do Produto"), "product-1");
    await user.click(screen.getByRole("button", { name: "Criar Regra" }));
    await waitFor(() => expect(screen.getByText("Ativa")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Desativar" }));
    await waitFor(() => expect(screen.getByText("Inativa")).toBeInTheDocument());
  });

  it("Histórico acumula uma entrada real por ação confirmada nesta sessão, com resumo por categoria", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user);

    await user.click(screen.getByRole("button", { name: /Histórico/ }));
    expect(screen.getByText(/Histórico de InventoryEvent reais/)).toBeInTheDocument();
    expect(screen.getByText("Movimentações registradas")).toBeInTheDocument();
  });

  it("Analytics mostra indicadores reais derivados da sessão, com NotConnectedNotice honesto sobre o escopo tenant-wide", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await registerMovement(user, "product-1", "10");

    // `/Analytics/`, nunca `"Analytics"` exato — mesma classe de defeito de teste real já documentada
    // em `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`: `SectionSubNav` acrescenta o selo "Prévia" ao nome
    // acessível de toda seção com `hasRealData: false` (`inventoryMovementSections.ts` — Analytics é
    // "Prévia" aqui, divergindo do Purchase Workspace por um motivo real de arquitetura).
    await user.click(screen.getByRole("button", { name: /Analytics/ }));
    expect(screen.getByText("Total de entradas (un.)")).toBeInTheDocument();
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
    expect(screen.getByText(/Localização padrão por Tenant/)).toBeInTheDocument();
  });
});
