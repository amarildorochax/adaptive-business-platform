// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthProvider";
import { clearAuthSession, saveAuthSession } from "./authSessionStorage";
import { useAuth } from "./useAuth";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Componente de sonda — expõe todo o estado/ações de `useAuth()` como texto/botões testáveis. */
function AuthProbe() {
  const auth = useAuth();

  return (
    <div>
      <p data-testid="status">{auth.status}</p>
      <p data-testid="identity">{auth.identity ?? ""}</p>
      <p data-testid="roles">{auth.roles.join(",")}</p>
      <button onClick={() => void auth.login("ana@example.com", "senha-123456", "tenant-1")}>login</button>
      <button onClick={() => void auth.logout()}>logout</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
}

describe("AuthProvider — sessão, login, logout, restauração inicial e renovação", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
  });

  it("sem sessão em sessionStorage, resolve diretamente para 'unauthenticated' (nunca fica em 'loading')", async () => {
    vi.stubGlobal("fetch", vi.fn());
    renderProbe();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
  });

  it("com uma sessão válida em sessionStorage, restaura para 'authenticated' via GET /auth/me (Carregamento inicial da sessão)", async () => {
    saveAuthSession({ accessToken: "session-1", expiresAt: new Date(Date.now() + 3_600_000).toISOString(), identity: "ana@example.com", tenantId: "tenant-1" });
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ identity: "ana@example.com", tenantId: "tenant-1", sessionId: "session-1", roles: ["Administrador"] }))),
    );

    renderProbe();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("identity")).toHaveTextContent("ana@example.com");
    expect(screen.getByTestId("roles")).toHaveTextContent("Administrador");
  });

  it("sessão em sessionStorage inválida no servidor (401 em /auth/me) — limpa o armazenamento e resolve 'unauthenticated'", async () => {
    saveAuthSession({ accessToken: "session-morta", expiresAt: new Date(Date.now() + 3_600_000).toISOString(), identity: "ana@example.com", tenantId: "tenant-1" });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "UNAUTHORIZED", message: "Sessão inválida.", correlationId: "c1" } }, 401))));

    renderProbe();

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
  });

  it("login bem-sucedido: persiste a sessão, anexa o Access Token e resolve 'authenticated' com identity/roles reais", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
        if (path === "/auth/login") return Promise.resolve(jsonResponse({ accessToken: "session-novo", expiresAt: new Date(Date.now() + 3_600_000).toISOString(), identity: "ana@example.com", tenantId: "tenant-1" }));
        if (path === "/auth/me") return Promise.resolve(jsonResponse({ identity: "ana@example.com", tenantId: "tenant-1", sessionId: "session-novo", roles: [] }));
        throw new Error(`rota não mockada: ${path}`);
      }),
    );

    renderProbe();
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));

    await user.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("identity")).toHaveTextContent("ana@example.com");
  });

  it("logout: revoga a Session via API e sempre limpa o estado local, mesmo se a chamada de logout falhar", async () => {
    const user = userEvent.setup();
    saveAuthSession({ accessToken: "session-1", expiresAt: new Date(Date.now() + 3_600_000).toISOString(), identity: "ana@example.com", tenantId: "tenant-1" });

    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
        if (path === "/auth/me") return Promise.resolve(jsonResponse({ identity: "ana@example.com", tenantId: "tenant-1", sessionId: "session-1", roles: [] }));
        if (path === "/auth/logout") return Promise.resolve(new Response(null, { status: 204 }));
        throw new Error(`rota não mockada: ${path}`);
      }),
    );

    renderProbe();
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));

    await user.click(screen.getByText("logout"));

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    expect(screen.getByTestId("identity")).toHaveTextContent("");
  });
});
