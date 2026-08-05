import { ApiError } from "./ApiError.js";

/**
 * Trata 404 como "nenhum dado ainda", nunca como erro — o mesmo comportamento que os métodos
 * `current*` dos Managers já tinham antes desta Sprint (retornar `{result: undefined}`, nunca
 * lançar). `apps/api` (FUN-004) formaliza essa ausência como 404 HTTP; esta função reverte essa
 * tradução no lado do cliente, preservando a UX exata já validada pelo FUN-001/FUN-002. Qualquer
 * outro código de erro (400/409/422/500) continua propagando normalmente.
 */
export async function undefinedOn404<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound()) {
      return undefined;
    }
    throw error;
  }
}
