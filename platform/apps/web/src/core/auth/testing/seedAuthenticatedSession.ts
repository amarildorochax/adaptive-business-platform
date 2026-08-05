import { DEMO_IDENTITY, DEMO_SESSION_ID } from "@core/http/testing/demoApiFetchMock.js";
import { saveAuthSession } from "../authSessionStorage.js";

/**
 * Helper exclusivo de teste — popula `sessionStorage` com uma sessão já "autenticada" antes de
 * renderizar qualquer árvore que passe por `RequireAuth` (`app/router/RequireAuth.tsx`), evitando o
 * redirecionamento para `/login`. `sessionId`/`identity` combinam com o que `createDemoApiFetchMock`
 * devolve em `GET /auth/me` — sem essa combinação, `AuthProvider` restaura a sessão do
 * `sessionStorage` mas a validação contra `/auth/me` (mockado) devolveria um corpo inconsistente.
 */
export function seedAuthenticatedSession(tenantId: string): void {
  saveAuthSession({
    accessToken: DEMO_SESSION_ID,
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    identity: DEMO_IDENTITY,
    tenantId,
  });
}
