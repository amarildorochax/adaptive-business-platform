import { HttpError, UnauthorizedError } from "./HttpError.js";
import { mapDomainError } from "./mapDomainError.js";

/**
 * Tradução de erro específica das rotas `/auth/*` — nunca reaproveitada por nenhuma outra rota, e
 * `mapDomainError` (Business Profile/Branding/CRM) permanece intocado, para não arriscar
 * reclassificar uma mensagem "X não encontrado" legítima de outro domínio.
 *
 * Duas razões para esta função existir separada de `mapDomainError`:
 *
 * 1. **Correção semântica**: `IAMManager` lança mensagens que o heurístico genérico já classificaria
 *    incorretamente. `AuthenticationService.authenticate` lança "...não corresponde." (nenhum padrão
 *    de `mapDomainError` reconhece "não corresponde" — cairia em 500). `SessionService` lança
 *    "Session X não encontrada." (`mapDomainError` mapearia para 404 — semanticamente errado para uma
 *    credencial de sessão inválida, que é sempre 401, nunca "recurso não encontrado") e "Session X não
 *    está ativa — expirada ou revogada." (também cairia em 500 no heurístico genérico, que não
 *    reconhece "não está"). Todos os três casos são, na realidade, falhas de autenticação — 401.
 * 2. **Nunca ecoar a mensagem original ao cliente** — "nunca retornar mensagens que facilitem
 *    enumeração de usuários" (regra explícita desta Sprint). A mensagem de `AuthenticationService`
 *    já embute a Identity literal (`Falha de autenticação para a Identity "${identity}"...`); mesmo
 *    sem revelar se a Identity existe (`matches()` devolve `false` uniformemente para Identity
 *    inexistente ou senha errada — nenhum sinal distinto entre os dois casos), o texto ainda não deve
 *    atravessar a fronteira HTTP — substituído aqui por uma mensagem genérica e fixa.
 */
export function mapIamError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (!(error instanceof Error)) {
    return mapDomainError(error);
  }

  const message = error.message;

  if (/não corresponde/i.test(message)) {
    return new UnauthorizedError("Identity ou Credential inválidos.");
  }

  if (/^Session .* não encontrada\.$/i.test(message) || /^Session .* não está ativa/i.test(message)) {
    return new UnauthorizedError("Sessão inválida, expirada ou revogada.");
  }

  return mapDomainError(error);
}
