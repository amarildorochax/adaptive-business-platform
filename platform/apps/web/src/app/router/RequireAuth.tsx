import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@core/auth/useAuth";

/**
 * Guarda de rota (FUN-100) — envolve toda a árvore de `AppLayout`. `/login` nunca passa por aqui
 * (rota irmã, fora deste elemento). Três estados possíveis de `useAuth()`:
 *
 * - `"loading"` — sessão ainda sendo restaurada de `sessionStorage` (`AuthProvider`, chamada a
 *   `/auth/me` em andamento) — nunca mostra o Dashboard nem redireciona prematuramente para
 *   `/login`, o que expulsaria um usuário já autenticado a cada F5 (a exigência "Carregamento
 *   inicial da sessão" da Sprint existe exatamente para este caso).
 * - `"unauthenticated"` — redireciona para `/login`, preservando a rota original via `state` para
 *   um eventual retorno pós-login (não implementado nesta Sprint — não exigido pelos Critérios de
 *   Aceite; a rota raiz `/` é o destino padrão após login).
 * - `"authenticated"` — renderiza `children` normalmente.
 */
export function RequireAuth({ children }: { readonly children: ReactNode }) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="app-loading" role="status">
        Carregando sessão…
      </div>
    );
  }

  if (auth.status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
