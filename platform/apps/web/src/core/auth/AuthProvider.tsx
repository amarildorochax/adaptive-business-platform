import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { apiClient } from "../http/client.js";
import { authClient } from "../http/clients/authClient.js";
import { AuthContext, type AuthState } from "./authContextInstance";
import { clearAuthSession, loadAuthSession, saveAuthSession, type StoredAuthSession } from "./authSessionStorage";

/**
 * Margem de renovação proativa — a Session (`@abp/platform-services`, `SessionService`) tem 1 hora de
 * TTL por padrão, e `renewSession` só funciona sobre uma Session **ainda ativa**
 * (`SessionService.requireActive` lança tanto para expirada quanto para revogada) — nunca resgata uma
 * Session já expirada. Por isso a renovação **precisa ser proativa**, nunca puramente reativa a um
 * 401: um 401 disparado por uma Session já de fato expirada não pode mais ser corrigido por
 * `/auth/refresh` (o interceptor de `ApiClient` ainda tenta, uma vez, como rede de segurança contra
 * relógio dessincronizado ou timer de aba em segundo plano suspenso pelo navegador — mas o caminho
 * primário de defesa é este agendamento antecipado).
 */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

function computeRefreshDelayMs(expiresAt: string): number {
  return Math.max(new Date(expiresAt).getTime() - Date.now() - REFRESH_MARGIN_MS, 0);
}

const UNAUTHENTICATED_STATE: AuthState = { status: "unauthenticated", identity: undefined, tenantId: undefined, roles: [] };
const LOADING_STATE: AuthState = { status: "loading", identity: undefined, tenantId: undefined, roles: [] };

/**
 * Único Provider de autenticação de toda a aplicação — gerencia sessão (armazenamento, restauração
 * ao carregar a página, renovação proativa, logout), nunca um Manager importado diretamente (toda
 * comunicação passa por `authClient`, que passa por `apiClient` — HTTP → DTO → API, nunca IAM
 * conhecido pelo Frontend).
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<AuthState>(LOADING_STATE);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Ref, não uma referência direta à função — quebra o ciclo scheduleRefresh -> runRefresh -> scheduleRefresh sem violar a ordem de declaração nem a regra exhaustive-deps.
  const runRefreshRef = useRef<(() => Promise<string | undefined>) | undefined>(undefined);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = undefined;
    }
  }, []);

  const forceSignOut = useCallback(() => {
    clearRefreshTimer();
    clearAuthSession();
    apiClient.setAccessToken(undefined);
    setState(UNAUTHENTICATED_STATE);
  }, [clearRefreshTimer]);

  const scheduleRefresh = useCallback(
    (expiresAt: string) => {
      clearRefreshTimer();
      refreshTimerRef.current = setTimeout(() => {
        void runRefreshRef.current?.();
      }, computeRefreshDelayMs(expiresAt));
    },
    [clearRefreshTimer],
  );

  const runRefresh = useCallback(async (): Promise<string | undefined> => {
    const stored = loadAuthSession();
    if (!stored) {
      forceSignOut();
      return undefined;
    }

    try {
      const refreshed = await authClient.refresh();
      const updated: StoredAuthSession = { ...stored, accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt };
      saveAuthSession(updated);
      apiClient.setAccessToken(updated.accessToken);
      scheduleRefresh(updated.expiresAt);
      return updated.accessToken;
    } catch {
      forceSignOut();
      return undefined;
    }
  }, [forceSignOut, scheduleRefresh]);

  useEffect(() => {
    runRefreshRef.current = runRefresh;
  }, [runRefresh]);

  useEffect(() => {
    apiClient.setUnauthorizedHandler(runRefresh);
    return () => apiClient.setUnauthorizedHandler(undefined);
  }, [runRefresh]);

  // Desmontagem (real: nunca acontece enquanto a aba estiver aberta, já que `AuthProvider` é o
  // Provider mais externo de `AppProviders`; em teste, todo `render()` desmonta ao final) — sem
  // isto, o `setTimeout` de renovação proativa (até ~55 min de atraso) prende viva toda a árvore de
  // fibra do componente através do closure em `refreshTimerRef`, nunca coletada pelo GC entre
  // testes — um vazamento real encontrado ao rodar a suíte completa desta Sprint (múltiplos
  // `AuthProvider` autenticados, cada um com um timer nunca limpo, esgotaram o heap do worker).
  useEffect(() => clearRefreshTimer, [clearRefreshTimer]);

  useEffect(() => {
    const stored = loadAuthSession();
    if (!stored) {
      setState(UNAUTHENTICATED_STATE);
      return;
    }

    apiClient.setAccessToken(stored.accessToken);

    authClient
      .me()
      .then((me) => {
        setState({ status: "authenticated", identity: me.identity, tenantId: me.tenantId, roles: me.roles });
        scheduleRefresh(stored.expiresAt);
      })
      .catch(() => forceSignOut());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (identity: string, password: string, tenantId: string): Promise<void> => {
      const loginResult = await authClient.login({ identity, password, tenantId });
      const session: StoredAuthSession = { accessToken: loginResult.accessToken, expiresAt: loginResult.expiresAt, identity: loginResult.identity, tenantId: loginResult.tenantId };

      saveAuthSession(session);
      apiClient.setAccessToken(session.accessToken);

      const me = await authClient.me();
      setState({ status: "authenticated", identity: me.identity, tenantId: me.tenantId, roles: me.roles });
      scheduleRefresh(session.expiresAt);
    },
    [scheduleRefresh],
  );

  const register = useCallback(async (identity: string, password: string): Promise<void> => {
    await authClient.register({ identity, password });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authClient.logout();
    } finally {
      forceSignOut();
    }
  }, [forceSignOut]);

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>;
}
