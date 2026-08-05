// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBusinessProfileSummary } from "./useBusinessProfileSummary";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useBusinessProfileSummary — três GETs paralelos, 404 tratado como ausência de dado", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("combina classification/maturity/stage em um único objeto, desembrulhando os campos escalares", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
        if (path.endsWith("/classification")) return Promise.resolve(jsonResponse({ segment: "Floricultura", subsegment: "Varejo" }));
        if (path.endsWith("/maturity")) return Promise.resolve(jsonResponse({ maturity: "elevada" }));
        if (path.endsWith("/stage")) return Promise.resolve(jsonResponse({ stage: "Perfil Inicial" }));
        throw new Error(`rota não mockada: ${path}`);
      }),
    );

    const { result } = renderHook(() => useBusinessProfileSummary("profile-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      classification: { segment: "Floricultura", subsegment: "Varejo" },
      maturity: "elevada",
      stage: "Perfil Inicial",
    });
  });

  it("404 em qualquer uma das três rotas vira undefined no campo correspondente, não um erro", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
        if (path.endsWith("/classification")) return Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrado", correlationId: "c1" } }, 404));
        if (path.endsWith("/maturity")) return Promise.resolve(jsonResponse({ maturity: "elevada" }));
        if (path.endsWith("/stage")) return Promise.resolve(jsonResponse({ stage: "Perfil Inicial" }));
        throw new Error(`rota não mockada: ${path}`);
      }),
    );

    const { result } = renderHook(() => useBusinessProfileSummary("profile-sem-classificacao"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.classification).toBeUndefined();
    expect(result.current.data?.maturity).toBe("elevada");
  });

  it("fica desabilitado (nunca chama fetch) quando profileId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useBusinessProfileSummary(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
