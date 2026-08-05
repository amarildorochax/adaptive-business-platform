/**
 * Persistência da credencial de sessão no navegador — `sessionStorage`, nunca `localStorage`.
 *
 * **Decisão técnica deliberada, per a exigência desta Sprint (FUN-100) de justificar tecnicamente a
 * estratégia de armazenamento**: `apps/api` (FUN-004/FUN-005) nunca ganhou um mecanismo de cookie
 * HttpOnly nesta Sprint (adicioná-lo exigiria `@fastify/cookie` + proteção CSRF via double-submit,
 * escopo maior que "IAM Core Foundation" e em conflito com o desenho explícito desta Sprint — a
 * Seção INTERCEPTORS pede um interceptor que "anexa token", o que só faz sentido para um token lido
 * por JavaScript, nunca para um cookie que o navegador já anexa sozinho). Com o token acessível a
 * JavaScript por definição, a escolha real está apenas entre `sessionStorage` e `localStorage`:
 * `localStorage` sobrevive ao fechar o navegador (maior janela de exposição a um XSS persistente);
 * `sessionStorage` é limpo ao fechar a aba (menor janela) e ainda sobrevive a um F5/recarregamento de
 * página — a única forma de a "Carregamento inicial da sessão" (exigida na Seção UI desta Sprint) ter
 * qualquer sentido sem forçar login a cada navegação. Armazenamento em memória pura (sem persistência
 * nenhuma) foi descartado por eliminar completamente essa exigência. Risco residual de XSS lendo o
 * token permanece — mesmo risco de qualquer armazenamento acessível a JavaScript — documentado como
 * limitação explícita no relatório desta Sprint, com HttpOnly cookie nomeado como evolução futura.
 */
const STORAGE_KEY = "abp.auth.session";

export interface StoredAuthSession {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly identity: string;
  readonly tenantId: string;
}

function storageAvailable(): boolean {
  return typeof sessionStorage !== "undefined";
}

export function saveAuthSession(session: StoredAuthSession): void {
  if (!storageAvailable()) {
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadAuthSession(): StoredAuthSession | undefined {
  if (!storageAvailable()) {
    return undefined;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return undefined;
  }
}

export function clearAuthSession(): void {
  if (!storageAvailable()) {
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
}
