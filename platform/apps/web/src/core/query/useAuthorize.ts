import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@core/auth/useAuth";
import { authClient } from "../http/clients/authClient.js";

/**
 * Integração real de Autorização com a API (FUN-100, Seção "AUTORIZAÇÃO") — `POST /auth/authorize`,
 * que por sua vez chama `IAMManager.authorize(identity, tenantId, action)` exatamente como o
 * `IAMManager.test.ts` já testa. Nunca inventa uma Permissão: o resultado reflete exatamente o que
 * já foi concedido via `assignRole`/`grantPermission` (nenhum dos dois exposto por HTTP nesta
 * Sprint — decisão de escopo documentada no relatório) — por padrão, `permitted: false` até que uma
 * concessão real exista (Least Privilege, já garantido pelo próprio IAM).
 *
 * Habilitado apenas quando a Session já está autenticada — nunca chama `/auth/authorize` sem uma
 * credencial válida (a chamada falharia com 401 de qualquer forma, via `requireAuth` no Backend).
 */
export function useAuthorize(action: string) {
  const auth = useAuth();

  return useQuery({
    queryKey: ["auth", "authorize", auth.identity, auth.tenantId, action],
    queryFn: () => authClient.authorize({ action }),
    enabled: auth.status === "authenticated",
  });
}
