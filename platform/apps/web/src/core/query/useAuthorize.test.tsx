// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@core/auth/AuthProvider";
import { clearAuthSession } from "@core/auth/authSessionStorage";
import { seedAuthenticatedSession } from "@core/auth/testing/seedAuthenticatedSession.js";
import { createDemoApiFetchMock } from "@core/http/testing/demoApiFetchMock.js";
import { useAuthorize } from "./useAuthorize";

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe("useAuthorize — integração real com POST /auth/authorize", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
  });

  it("fica desabilitado (nunca chama fetch) enquanto não autenticado", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuthorize("finance:approve"), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uma vez autenticado, consulta /auth/authorize e reflete permitted: false quando nenhuma Permissão foi concedida", async () => {
    seedAuthenticatedSession("tenant-1");
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const path = input.toString().replace(/^https?:\/\/[^/]+/, "");
      if (path === "/auth/authorize") return Promise.resolve(new Response(JSON.stringify({ action: "finance:approve", permitted: false }), { status: 200, headers: { "Content-Type": "application/json" } }));
      return createDemoApiFetchMock("tenant-1")(input, init);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuthorize("finance:approve"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ action: "finance:approve", permitted: false });
  });
});
