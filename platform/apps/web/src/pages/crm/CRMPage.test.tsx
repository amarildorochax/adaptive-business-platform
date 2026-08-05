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
import { CRMPage } from "./CRMPage";

function renderPage(initialEntry = "/crm") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <CRMPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

/**
 * Aguarda o CRM Workspace inteiro estar pronto — incluindo as duas consultas extras da Visão Geral
 * (`useBusinessProfileSummary`/`useBrandIdentity`, seção "Integração"), montada por padrão em todo
 * teste antes de qualquer clique de navegação. Sem isso, essas duas consultas continuariam pendentes
 * em segundo plano ao trocar de seção, terminando de resolver só depois que o teste seguinte já
 * reatribuiu `globalThis.fetch` ao seu próprio mock — contaminando-o com chamadas tardias deste
 * (achado real ao investigar flakiness nesta Sprint).
 */
async function waitForWorkspaceReady() {
  await waitFor(() => expect(screen.getAllByText("Oportunidades").length).toBeGreaterThan(0));
  await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
}

describe("CRMPage — Workspace Comercial por seções (FUN-103)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
    // `queryClient` (`core/query/queryClient.ts`) é um singleton de módulo, compartilhado por toda a
    // aplicação — nunca recriado por teste. Nunca causou problema visível em nenhuma Sprint anterior
    // porque toda Query já existente (bootstrap/perfil/identidade de marca) devolve exatamente o
    // mesmo dado de demonstração em qualquer teste. O CRM Workspace (FUN-103) é o primeiro caso onde
    // isso importa de verdade: `["crm","workspace"]` é MUTADO de forma diferente por cada teste
    // (mover Oportunidade, criar nova Oportunidade) — sem limpar o cache entre testes, um teste
    // reaproveitaria silenciosamente o Workspace já modificado pelo teste anterior. Achado real ao
    // investigar falhas intermitentes nesta Sprint, não uma suposição.
    queryClient.clear();
  });

  it("mostra o estado de carregamento antes do CRM Workspace resolver", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Carregando…")).toBeInTheDocument();

    await waitForWorkspaceReady();
  });

  it("mostra a Visão Geral por padrão, com KPIs (Cards) reais derivados do CRM Workspace", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    expect(screen.getByText("Negócios ganhos")).toBeInTheDocument();
    expect(screen.getByText("Negócios perdidos")).toBeInTheDocument();
    expect(screen.getByText("Valor em negociação")).toBeInTheDocument();
    expect(screen.getByText("Conversão")).toBeInTheDocument();
  });

  it("o Pipeline mostra o Kanban com as três colunas reais (outcome) e permite mover a Oportunidade para Ganha", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Pipeline/ }));

    expect(screen.getByText("Em Aberto")).toBeInTheDocument();
    expect(screen.getByText("Ganhas")).toBeInTheDocument();
    expect(screen.getByText("Perdidas")).toBeInTheDocument();
    expect(screen.getByText("Contrato anual de fornecimento")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Marcar como Ganha" })[0]);

    await waitFor(() => expect(screen.getAllByRole("button", { name: "Reabrir" }).length).toBeGreaterThan(0));
  });

  it("Oportunidades mostra o NotConnectedNotice para campos inexistentes e permite criar uma nova Oportunidade real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /^Oportunidades/ }));

    expect(screen.getByText(/Produtos, Origem, Probabilidade/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Título"), "Nova parceria comercial");
    await user.type(screen.getByLabelText("Valor (R$)"), "5000");
    await user.click(screen.getByRole("button", { name: "Criar Oportunidade" }));

    await waitFor(() => expect(screen.getByText("Nova parceria comercial")).toBeInTheDocument());
  });

  it("Clientes lista Organizações/Customers reais e mostra o NotConnectedNotice de Segmentação", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    const user = userEvent.setup();
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Clientes/ }));

    expect(screen.getAllByText("Floricultura Bela Vista").length).toBeGreaterThan(0);
    expect(screen.getByText(/Segmentação, Última interação/)).toBeInTheDocument();
  });

  it("Atividades é inteiramente placeholder — NotConnectedNotice e estado vazio, nenhuma persistência inventada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Atividades/ }));

    expect(screen.getByText(/Tarefas, Follow-ups, Ligações, Emails, Reuniões, Pendências/)).toBeInTheDocument();
    expect(screen.getByText("Nenhuma Atividade disponível")).toBeInTheDocument();
  });

  it("a Timeline Comercial reutiliza o componente Timeline do Design System, reconstruído a partir do log local da sessão", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitForWorkspaceReady();
    await user.click(screen.getByRole("button", { name: /Timeline/ }));

    expect(screen.getByRole("list", { name: "Timeline Comercial" })).toBeInTheDocument();
    expect(screen.getAllByText(/Oportunidade "Contrato anual de fornecimento" criada\./).length).toBeGreaterThan(0);
  });
});
