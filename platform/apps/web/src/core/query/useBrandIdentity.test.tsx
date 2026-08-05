// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBrandIdentity } from "./useBrandIdentity";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useBrandIdentity — currentTheme + currentLogo em paralelo, 404 tratado como ausência de dado", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("devolve theme e logo quando ambos existem", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
        if (path.startsWith("/branding/theme/")) return Promise.resolve(jsonResponse({ themeId: "theme-1", tenantId: "t1", version: 1, generatedAt: new Date().toISOString() }));
        if (path.startsWith("/branding/logos/")) return Promise.resolve(jsonResponse({ logoId: "logo-1", tenantId: "t1", assetReference: "ref-1", uploadedAt: new Date().toISOString() }));
        throw new Error(`rota não mockada: ${path}`);
      }),
    );

    const { result } = renderHook(() => useBrandIdentity("t1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.theme?.version).toBe(1);
    expect(result.current.data?.logo?.assetReference).toBe("ref-1");
  });

  it("404 em ambas as rotas devolve theme/logo undefined, nunca um erro", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrado", correlationId: "c1" } }, 404))),
    );

    const { result } = renderHook(() => useBrandIdentity("tenant-sem-marca"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ theme: undefined, logo: undefined });
  });
});
