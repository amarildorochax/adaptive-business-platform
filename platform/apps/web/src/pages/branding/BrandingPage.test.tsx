// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@app/providers/AppProviders";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { BrandingPage } from "./BrandingPage";

function renderPage(initialEntry = "/branding") {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <BrandingPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("BrandingPage — Brand Center por seções (FUN-102)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
  });

  it("mostra a Visão Geral por padrão, com Tema/Cores/Tokens reais e o Contexto de negócio", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getByText("Versão 1")).toBeInTheDocument());
    expect(screen.getByText("Cores geradas")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("Floricultura").length).toBeGreaterThan(0));
    expect(screen.getByText(/ainda não é suportado pela API do Branding Hub/)).toBeInTheDocument();
  });

  it("a seção Tema mostra a versão vigente, permite regenerar o Tema, alterna Dark/Light e sinaliza que o modo Contraste não existe", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Versão 1").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Tema/ }));

    expect(screen.getByText("Modo de Contraste")).toBeInTheDocument();
    expect(screen.getByText("Tema atual da aplicação: Escuro")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Alternar para tema claro/ }));
    expect(document.documentElement.dataset.theme).toBe("light");

    const themeCard = screen.getByText("Tema vigente").closest("section") as HTMLElement;
    await user.click(screen.getByRole("button", { name: "Regenerar Tema" }));
    await waitFor(() => expect(within(themeCard).getByText("2")).toBeInTheDocument());
  });

  it("a seção Paleta atualiza a cor de destaque em tempo real e envia o Command real UpdatePalette", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Versão 1").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Paleta/ }));

    await waitFor(() => expect(screen.getByLabelText("Nova cor de destaque (hex)")).toHaveValue("#2E7D32"));

    const primaryField = screen.getByLabelText("Nova cor de destaque (hex)");
    await user.clear(primaryField);
    await user.type(primaryField, "#123456");

    await user.click(screen.getByRole("button", { name: "Atualizar paleta" }));
    await waitFor(() => expect(screen.getByText("#123456")).toBeInTheDocument());

    expect(screen.getByText(/Cor terciária/)).toBeInTheDocument();
  });

  it("a seção Tokens organiza por categoria real, mostrando Cor/Tipografia populadas e categorias sem Service como vazias", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Versão 1").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Tokens/ }));

    expect(screen.getByText("cor-destaque-primaria")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Borda" }));
    expect(screen.getByText('Nenhum Token de "Borda"')).toBeInTheDocument();
    expect(screen.getByText(/nunca foi populada/)).toBeInTheDocument();
  });

  it("a seção Logo mostra o placeholder de upload indisponível e envia uma referência real via submitLogo", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Versão 1").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /^Logo/ }));

    expect(screen.getByText("Upload de arquivo ainda não disponível.")).toBeInTheDocument();
    expect(screen.getByText(/Versão clara, Versão escura, Ícone, FavIcon/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Referência do ativo (URL ou identificador)"), "https://cdn.example.com/logo.svg");
    await user.click(screen.getByRole("button", { name: "Enviar logo" }));

    await waitFor(() => expect(screen.getByText("https://cdn.example.com/logo.svg")).toBeInTheDocument());
  });

  it("a seção Componentes reutiliza a galeria de componentes compartilhados do Design System", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Versão 1").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Componentes/ }));

    expect(screen.getByRole("button", { name: "Primário" })).toBeInTheDocument();
    expect(screen.getByText("Sucesso")).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Exemplo de abas" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Disparar Toast" }));
    expect(screen.getByText("Notificação de exemplo.")).toBeInTheDocument();
  });

  it("a seção Exportação baixa os Tokens já carregados e sinaliza que a exportação oficial é futura", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderPage();

    await waitFor(() => expect(screen.getAllByText("Versão 1").length).toBeGreaterThan(0));
    await user.click(screen.getByRole("button", { name: /Exportação/ }));

    expect(screen.getByText("Exportação oficial disponível em versão futura.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Baixar design-tokens.json/ })).not.toBeDisabled();
  });
});
