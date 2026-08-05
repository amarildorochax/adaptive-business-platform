// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@core/auth/AuthProvider";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { LoginPage } from "./LoginPage";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function renderLoginPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("LoginPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
  });

  it("submete login com sucesso e é redirecionado para a rota raiz", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
        if (path === "/auth/login") return Promise.resolve(jsonResponse({ accessToken: "session-1", expiresAt: new Date(Date.now() + 3_600_000).toISOString(), identity: "ana@example.com", tenantId: "tenant-demo" }));
        if (path === "/auth/me") return Promise.resolve(jsonResponse({ identity: "ana@example.com", tenantId: "tenant-demo", sessionId: "session-1", roles: [] }));
        throw new Error(`rota não mockada: ${path}`);
      }),
    );

    renderLoginPage();

    await user.type(screen.getByLabelText("Identity (e-mail)"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha-123456");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
  });

  it("exibe uma mensagem de erro segura quando o login falha (401), nunca a mensagem técnica original", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "UNAUTHORIZED", message: "Identity ou Credential inválidos.", correlationId: "c1" } }, 401))));

    renderLoginPage();

    await user.type(screen.getByLabelText("Identity (e-mail)"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha-errada-123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Credenciais inválidas ou sessão expirada."));
  });

  it("alterna para o modo de registro, envia POST /auth/register e volta ao modo de login com uma mensagem de sucesso", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
      if (path === "/auth/register") return Promise.resolve(jsonResponse({ credentialId: "cred-1", identity: "nova@example.com", createdAt: new Date().toISOString() }, 201));
      throw new Error(`rota não mockada: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderLoginPage();

    await user.click(screen.getByText("Não tem conta? Criar conta"));
    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Identity (e-mail)"), "nova@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha-nova-123");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument());
    expect(screen.getByText("Conta criada — entre com sua senha.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/auth/register"), expect.objectContaining({ method: "POST" }));
  });
});
