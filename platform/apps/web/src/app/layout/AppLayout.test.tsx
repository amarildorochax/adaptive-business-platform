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
import { AppLayout } from "./AppLayout";

describe("AppLayout — menu móvel (UX-001, <1024px)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
  });

  it("abre e fecha o painel de navegação sobreposto ao clicar no botão de menu / no backdrop", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));

    const { container } = render(
      <AppProviders>
        <MemoryRouter>
          <AppLayout>
            <div>Página de Teste</div>
          </AppLayout>
        </MemoryRouter>
      </AppProviders>,
    );

    await waitFor(() => expect(screen.getByText("Página de Teste")).toBeInTheDocument());

    expect(container.querySelector(".app-layout__mobile-backdrop")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Abrir menu de navegação" }));
    expect(container.querySelector(".app-layout__mobile-backdrop")).toBeInTheDocument();
    expect(container.querySelector(".sidebar")).toHaveClass("sidebar--mobile-open");

    await user.click(container.querySelector(".app-layout__mobile-backdrop")!);
    expect(container.querySelector(".app-layout__mobile-backdrop")).not.toBeInTheDocument();
  });
});
