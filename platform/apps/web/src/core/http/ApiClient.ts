import { ApiError, ApiNetworkError } from "./ApiError.js";
import type { ApiClientConfig } from "./config.js";

interface ApiErrorBody {
  readonly error: { readonly code: string; readonly message: string; readonly correlationId: string };
}

/**
 * Camada única de comunicação HTTP de `apps/web` — o único arquivo de toda a aplicação que chama
 * `fetch`. Toda base URL, cabeçalho, timeout, serialização, tratamento de erro e, desde a FUN-100,
 * anexação de credencial de sessão e renovação em resposta a 401, estão centralizados aqui; nenhum
 * hook, nenhum componente, chama `fetch` diretamente nem lê/anexa o Access Token por conta própria.
 */
export class ApiClient {
  private baseUrl: string;
  private accessToken: string | undefined;
  private unauthorizedHandler: (() => Promise<string | undefined>) | undefined;
  // Reentrância: `unauthorizedHandler` (AuthProvider.runRefresh) chama `authClient.refresh()`, que
  // passa pelo mesmo `request()` — se essa chamada de /auth/refresh também devolver 401 (o caso
  // comum para uma Session já de fato expirada, ver AuthProvider.tsx), sem esta trava o interceptor
  // chamaria a si mesmo indefinidamente (bug real, encontrado ao rodar a suíte de testes desta
  // Sprint — um worker do Vitest esgotou o heap antes de esta trava existir). Enquanto `true`,
  // qualquer 401 adicional é tratado como falha normal, nunca dispara uma nova tentativa.
  private isHandlingUnauthorized = false;

  constructor(private readonly config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
  }

  /** Único ponto que passa a anexar `Authorization: Bearer <token>` em toda requisição subsequente — chamado exclusivamente por `AuthProvider` (`core/auth/AuthProvider.tsx`). */
  setAccessToken(token: string | undefined): void {
    this.accessToken = token;
  }

  /**
   * Sobrescreve o `baseUrl` resolvido no boot (`config.ts`) — mesma disciplina de `setAccessToken`,
   * um setter mutável sobre uma configuração por padrão fixa. Adicionado pela IMP-204 exclusivamente
   * para permitir teste de integração real (sem mock de `fetch`) contra uma instância real de
   * `apps/api` escutando em porta efêmera, decidida apenas em tempo de execução do teste — nunca
   * chamado por nenhum caminho de produção (`main.tsx`/`AuthProvider` continuam usando exclusivamente
   * o `baseUrl` já resolvido de `import.meta.env`).
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Registrado por `AuthProvider` uma única vez, no boot da aplicação — nunca importado por este
   * arquivo (evitaria um ciclo `ApiClient` → `AuthProvider` → `ApiClient`). Chamado exclusivamente
   * quando uma requisição autenticada (Access Token já anexado) recebe 401 — nunca para uma
   * requisição sem token (ex.: `/auth/login` com senha errada é um 401 de credencial, não de sessão
   * expirada, e nunca deve disparar uma tentativa de renovação). Deve devolver o novo Access Token em
   * caso de sucesso (e já ter chamado `setAccessToken` como efeito colateral), ou `undefined` em
   * caso de falha — nesse caso o 401 original é propagado normalmente ao chamador.
   */
  setUnauthorizedHandler(handler: (() => Promise<string | undefined>) | undefined): void {
    this.unauthorizedHandler = handler;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PATCH", body: body === undefined ? undefined : JSON.stringify(body) });
  }

  private async request<T>(path: string, init: RequestInit, isRetry = false): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    // Content-Type só é enviado quando há corpo — do contrário o parser JSON estrito de `apps/api`
    // (Fastify) rejeita a requisição com 400 FST_ERR_CTP_EMPTY_JSON_BODY (achado real via smoke test
    // da FUN-005, nunca reproduzido pelos testes com `fetch` mockado).
    const tokenForThisRequest = this.accessToken;
    const authHeader = tokenForThisRequest ? { Authorization: `Bearer ${tokenForThisRequest}` } : undefined;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: init.body === undefined ? { ...authHeader, ...init.headers } : { "Content-Type": "application/json", ...authHeader, ...init.headers },
        signal: controller.signal,
      });
    } catch (error) {
      throw new ApiNetworkError(error instanceof Error ? `Não foi possível conectar à API: ${error.message}` : undefined);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // 401 numa requisição que já carregava uma credencial de sessão: tenta renovar exatamente uma
      // vez e repete a requisição original — nunca para uma requisição sem token (ver
      // `setUnauthorizedHandler`), nunca mais de uma vez (evita loop caso a renovação também falhe,
      // o comportamento esperado para uma Session já verdadeiramente expirada/revogada — IAM's
      // `renewSession` só funciona sobre uma Session ainda ativa, nunca resgata uma já expirada).
      if (response.status === 401 && tokenForThisRequest && !isRetry && !this.isHandlingUnauthorized && this.unauthorizedHandler) {
        this.isHandlingUnauthorized = true;
        let newToken: string | undefined;
        try {
          newToken = await this.unauthorizedHandler();
        } finally {
          this.isHandlingUnauthorized = false;
        }
        if (newToken) {
          return this.request<T>(path, init, true);
        }
      }

      const body = await safeJson<ApiErrorBody>(response);
      throw new ApiError(response.status, body?.error.code ?? "UNKNOWN", body?.error.message ?? response.statusText, body?.error.correlationId);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

async function safeJson<T>(response: Response): Promise<T | undefined> {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}
