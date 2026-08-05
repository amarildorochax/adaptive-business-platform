// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@core/auth/AuthProvider";
import { useAuth } from "@core/auth/useAuth";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { useProfileDraft } from "./useProfileDraft";

interface Draft extends Record<string, unknown> {
  readonly note: string;
}

function DraftForm() {
  const draft = useProfileDraft<Draft>("probe-section", { note: "" });

  // "sem alterações" / "salvo agora" — nunca uma substring uma da outra (uma asserção anterior
  // desta Sprint usava "não salvo"/"salvo", e `toHaveTextContent("salvo")` combina por substring,
  // então "não salvo" já "continha" o texto procurado e o teste passava sem nunca esperar de
  // verdade o debounce — corrigido para dois textos mutuamente exclusivos).
  return (
    <div>
      <input aria-label="nota" value={draft.value.note} onChange={(event) => draft.updateField("note", event.target.value)} />
      <span data-testid="saved">{draft.savedAt ? "salvo agora" : "sem alterações"}</span>
      <button onClick={draft.resetDraft}>limpar</button>
    </div>
  );
}

/**
 * Só monta `DraftForm` depois de `auth.status === "authenticated"` — o mesmo gate que
 * `BusinessProfilePage` já aplica na prática (uma seção só é renderizada depois que
 * `useDashboardBootstrap` resolve, o que já exige uma Session autenticada). Sem este gate, o
 * hook seria montado com `tenantId` ainda `undefined`, um cenário que a página real nunca produz.
 */
function DraftProbe() {
  const auth = useAuth();
  return auth.status === "authenticated" ? <DraftForm /> : <p>carregando…</p>;
}

function renderProbe() {
  return render(
    <AuthProvider>
      <DraftProbe />
    </AuthProvider>,
  );
}

describe("useProfileDraft — rascunho local com autosave visual (FUN-101)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
    localStorage.clear();
  });

  it("digitar atualiza o valor imediatamente e grava em localStorage após o debounce", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderProbe();

    await waitFor(() => expect(screen.getByLabelText("nota")).toBeInTheDocument());
    expect(screen.getByTestId("saved")).toHaveTextContent("sem alterações");

    await user.type(screen.getByLabelText("nota"), "olá");
    expect(screen.getByLabelText("nota")).toHaveValue("olá");

    await waitFor(() => expect(screen.getByTestId("saved")).toHaveTextContent("salvo agora"), { timeout: 2000 });
    expect(localStorage.getItem("abp.businessProfile.draft.tenant-1.probe-section")).toContain("olá");
  });

  it("uma sessão seguinte restaura o rascunho já salvo do mesmo Tenant", async () => {
    localStorage.setItem("abp.businessProfile.draft.tenant-1.probe-section", JSON.stringify({ note: "rascunho anterior" }));
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));

    renderProbe();

    await waitFor(() => expect(screen.getByLabelText("nota")).toHaveValue("rascunho anterior"));
  });

  it("limpar rascunho remove o valor de localStorage e restaura o valor inicial", async () => {
    const user = userEvent.setup();
    seedAuthenticatedSession("tenant-1");
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock("tenant-1")));
    renderProbe();

    await waitFor(() => expect(screen.getByLabelText("nota")).toBeInTheDocument());
    await user.type(screen.getByLabelText("nota"), "temporário");
    await waitFor(() => expect(screen.getByTestId("saved")).toHaveTextContent("salvo agora"), { timeout: 2000 });

    await user.click(screen.getByText("limpar"));

    expect(screen.getByLabelText("nota")).toHaveValue("");
    expect(localStorage.getItem("abp.businessProfile.draft.tenant-1.probe-section")).toBeNull();
  });
});
