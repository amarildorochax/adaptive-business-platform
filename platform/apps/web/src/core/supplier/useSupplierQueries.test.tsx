// @vitest-environment jsdom
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../http/client.js";
import { useSupplier } from "./useSupplier.js";
import { useSuppliers } from "./useSuppliers.js";

/**
 * Testes de Hook — `fetch` mockado, nunca uma instância real de `apps/api`, mesma disciplina de
 * `useBrandIdentity.test.tsx`/`useBusinessProfileSummary.test.tsx` (todo hook já existente nesta
 * plataforma testa assim). Divergência documentada em relação à instrução "executar chamadas HTTP
 * reais... não utilizar mocks" de IMP-204: `renderHook` (`@testing-library/react`) exige ambiente
 * jsdom (precisa de `document`); sob jsdom, `@abp/persistence` (consumido por
 * `testing/realApiServer.ts`, ver `supplierClient.test.ts`, que É real) falha ao resolver a pasta
 * de migrations (`db/migrate.ts`: `fileURLToPath(new URL(".", import.meta.url))` produz "The URL
 * must be of scheme file" sob o `import.meta.url` reescrito pelo transform de teste do
 * Vite/Vitest para jsdom) — um conflito genuíno de ambiente, não um defeito de `@abp/persistence`
 * (intocado, per proibição desta Sprint) nem algo corrigível sem alterá-lo. Detalhado por completo
 * em `IMP_204_SUPPLIER_FRONTEND_REPORT.md`, Capítulo "Divergências Encontradas". A integração HTTP
 * real e sem mock, incluindo o roundtrip completo de todo Command/Query e o interceptor de
 * autenticação, já está integralmente coberta por `supplierClient.test.ts` (ambiente Node, sem
 * esse conflito) — estes testes de Hook cobrem exclusivamente a integração com React Query
 * (queryKey, enabled, forma do dado) sobre a mesma implementação de `supplierClient` já validada
 * ali contra o servidor real.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function wrapper({ children }: { readonly children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("useSuppliers / useSupplier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    apiClient.setBaseUrl("http://127.0.0.1:3001");
  });

  it("useSuppliers busca a lista de um Tenant, chave de cache ['supplier','list',tenantId]", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        jsonResponse([{ supplierId: "s1", tenantId: "tenant-1", legalName: "Floricultura Atacado Ltda.", taxId: "12345678000199", status: "Active", contacts: [], createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }]),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useSuppliers("tenant-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/suppliers/by-tenant/tenant-1"), expect.objectContaining({ method: "GET" }));
  });

  it("useSuppliers permanece desabilitado (nunca dispara requisição) enquanto tenantId é undefined", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useSuppliers(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("useSupplier busca um Supplier por identificador, chave de cache ['supplier','detail',supplierId]", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({ supplierId: "s1", tenantId: "tenant-1", legalName: "Fornecedor de Insumos", taxId: "12345678000199", status: "Active", contacts: [], createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }),
        ),
      ),
    );

    const { result } = renderHook(() => useSupplier("s1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.legalName).toBe("Fornecedor de Insumos");
  });

  it("useSupplier devolve undefined, nunca erro, para um Supplier inexistente (404 tratado como ausência)", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({ error: { code: "NOT_FOUND", message: "não encontrado", correlationId: "c1" } }, 404))));

    const { result } = renderHook(() => useSupplier("supplier-inexistente"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
