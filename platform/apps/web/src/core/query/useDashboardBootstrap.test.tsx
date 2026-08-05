// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDemoApiFetchMock } from "../http/testing/demoApiFetchMock.js";
import { DEMO_TENANT_ID } from "../managers/seedDemoData";
import { ManagerProvider } from "../managers/ManagerContext";
import { useDashboardBootstrap } from "./useDashboardBootstrap";

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <ManagerProvider>{children}</ManagerProvider>
    </QueryClientProvider>
  );
}

describe("useDashboardBootstrap", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(createDemoApiFetchMock(DEMO_TENANT_ID)));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("popula os sete domínios e expõe a fotografia resultante através do TanStack Query", async () => {
    const { result } = renderHook(() => useDashboardBootstrap(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.organization.name).toBe("Floricultura Bela Vista");
    expect(result.current.data?.knowledgeAssets).toHaveLength(2);
  });
});
