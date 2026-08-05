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
import { BusinessProfilePage } from "./BusinessProfilePage";

function renderPage(initialEntry = "/business-profile") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <BusinessProfilePage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("BusinessProfilePage — módulo completo por seções (FUN-101)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
  });

  it("mostra a Visão Geral por padrão, com dado real (Segmento/Maturidade/Estágio) e a Jornada de Construção do Perfil", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Perfil Inicial").length).toBeGreaterThan(0);
    expect(screen.getByRole("list", { name: "Estágios da Jornada de Construção do Perfil" })).toBeInTheDocument();
  });

  it("navega para a seção Empresa via a barra lateral contextual e mostra o aviso de campos não conectados", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Empresa/ }));

    expect(screen.getByText(/ainda não são suportados pela API/)).toBeInTheDocument();
    expect(screen.getByLabelText("Nome fantasia")).toBeInTheDocument();
  });

  it("a seção Mercado mostra Segmento/Subsegmento reais como somente leitura, e os demais campos como rascunho local", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Mercado/ }));

    await waitFor(() => expect(screen.getByLabelText("Segmento")).toHaveValue("Floricultura"));
    expect(screen.getByLabelText("Segmento")).toBeDisabled();
    expect(screen.getByLabelText("Nicho")).not.toBeDisabled();
  });

  it("digitar num campo de rascunho aciona o autosave visual, persistido em localStorage", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Empresa/ }));

    await user.type(screen.getByLabelText("Nome fantasia"), "Bela Vista Flores");

    await waitFor(() => expect(screen.getByText(/Rascunho salvo às/)).toBeInTheDocument(), { timeout: 3000 });
    expect(localStorage.getItem("abp.businessProfile.draft.tenant-1.company")).toContain("Bela Vista Flores");
  });

  it("'Limpar rascunho' reseta o formulário e remove o rascunho salvo", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Empresa/ }));
    await user.type(screen.getByLabelText("Nome fantasia"), "Rascunho temporário");
    await waitFor(() => expect(screen.getByText(/Rascunho salvo às/)).toBeInTheDocument(), { timeout: 3000 });

    await user.click(screen.getByRole("button", { name: "Limpar rascunho" }));

    expect(screen.getByLabelText("Nome fantasia")).toHaveValue("");
    expect(localStorage.getItem("abp.businessProfile.draft.tenant-1.company")).toBeNull();
  });

  it("a seção Configurações alterna o tema real da aplicação (reuso de core/theme, UX-001)", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Configurações/ }));

    expect(screen.getByText("Tema atual: Escuro")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Alternar para tema claro/ }));

    expect(screen.getByText("Tema atual: Claro")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
