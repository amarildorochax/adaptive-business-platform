// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@core/auth/AuthProvider";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { RequireAuth } from "./RequireAuth";

function renderGuarded(initialPath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Tela de Login</div>} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <div>Conteúdo Protegido</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("RequireAuth — guarda de rota", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
  });

  it("sem sessão, redireciona para /login, nunca mostra o conteúdo protegido", async () => {
    vi.stubGlobal("fetch", vi.fn());
    renderGuarded("/");

    await waitFor(() => expect(screen.getByText("Tela de Login")).toBeInTheDocument());
    expect(screen.queryByText("Conteúdo Protegido")).not.toBeInTheDocument();
  });

  it("mostra um estado de carregamento antes de a sessão ser restaurada — nunca pisca para /login primeiro", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));

    renderGuarded("/");

    expect(screen.getByRole("status")).toHaveTextContent("Carregando sessão…");
    await waitFor(() => expect(screen.getByText("Conteúdo Protegido")).toBeInTheDocument());
  });

  it("com sessão válida, renderiza o conteúdo protegido", async () => {
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));

    renderGuarded("/");

    await waitFor(() => expect(screen.getByText("Conteúdo Protegido")).toBeInTheDocument());
    expect(screen.queryByText("Tela de Login")).not.toBeInTheDocument();
  });
});
