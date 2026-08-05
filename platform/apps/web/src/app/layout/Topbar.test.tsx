// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@app/providers/AppProviders";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock, DEMO_IDENTITY } from "@core/http/testing/demoApiFetchMock.js";
import { Topbar } from "./Topbar";

function renderTopbar() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={["/"]}>
        <Topbar />
        <Routes>
          <Route path="/" element={<div>Rota raiz</div>} />
          <Route path="/crm" element={<div>Rota CRM</div>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("Topbar — pesquisa global, notificações e perfil (UX-001)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
  });

  it("Pesquisa Global filtra NAV_ENTRIES e navega ao selecionar um resultado", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderTopbar();

    await waitFor(() => expect(screen.getByText(DEMO_IDENTITY)).toBeInTheDocument());

    await user.type(screen.getByLabelText("Pesquisa global"), "CRM");
    await user.click(screen.getByRole("option", { name: /CRM/ }));

    await waitFor(() => expect(screen.getByText("Rota CRM")).toBeInTheDocument());
  });

  it("o painel de Notificações mostra atividade recente real (mensagem/execução/lead já carregados), nunca uma Entidade inventada", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderTopbar();

    await waitFor(() => expect(screen.getByText(DEMO_IDENTITY)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Notificações" }));

    await waitFor(() => expect(screen.getByText(/Novo Lead: Ana Ferreira/)).toBeInTheDocument());
  });

  it("o menu de Perfil exibe a Identity autenticada e um botão de logout real", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderTopbar();

    await waitFor(() => expect(screen.getByText(DEMO_IDENTITY)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Menu de perfil" }));

    expect(screen.getByRole("button", { name: /Sair/ })).toBeInTheDocument();
  });
});
