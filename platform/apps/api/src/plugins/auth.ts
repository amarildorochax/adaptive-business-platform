import type { SecurityContext } from "@abp/platform-services";
import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../errors/HttpError.js";

declare module "fastify" {
  interface FastifyRequest {
    securityContext?: SecurityContext;
  }
}

/**
 * Extrai a credencial de sessão do cabeçalho `Authorization: Bearer <sessionId>`.
 *
 * **Por que o valor é o `sessionId`, não o `AccessToken.value` opaco que `IAMManager.login()`
 * também devolve**: toda operação subsequente de sessão exposta pelo `IAMManager`
 * (`renewSession`/`revokeSession`/`buildSecurityContext`) recebe exclusivamente um `sessionId` —
 * nenhum método do Manager resolve um `AccessToken.value` de volta a uma Session (o
 * `AccessTokenRepository` só expõe `findBySession`, nunca o inverso), e esta Sprint proíbe acessar
 * Repository diretamente ("nunca acessar Repository diretamente... utilizar exclusivamente
 * Managers"). Usar `sessionId` como a própria credencial Bearer é a única forma de satisfazer as
 * duas regras ao mesmo tempo — e é criptograficamente equivalente: ambos são
 * `crypto.randomUUID()` opacos e não adivinháveis, resolvidos apenas via consulta ao banco.
 * Documentado em detalhe no relatório desta Sprint, Seção "Estratégia de Tokens".
 */
function extractSessionId(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }
  const value = header.slice("Bearer ".length).trim();
  return value.length > 0 ? value : undefined;
}

/**
 * `preHandler` reutilizável por toda rota protegida (`/auth/logout`, `/auth/refresh`, `/auth/me`,
 * `/auth/authorize`) — anexado individualmente por rota (`{ preHandler: requireAuth }`), nunca um
 * hook global aplicado a toda a aplicação, porque `/auth/register`/`/auth/login`/`/health` nunca
 * exigem sessão prévia. `request.server` é a mesma instância Fastify decorada por `managersPlugin`
 * (registrado antes de qualquer rota) — nenhuma segunda fonte de Managers criada aqui.
 *
 * Resolve o `SecurityContext` exatamente uma vez por requisição via
 * `IAMManager.buildSecurityContext(sessionId)` — nunca duas consultas ao Identity Hub na mesma
 * requisição (mesma disciplina já documentada em `SecurityContext.ts`: "resolvido uma única vez...
 * consumido... sem nova consulta"). Nunca acessa `SessionRepository`/`ProfileRepository`
 * diretamente — sempre através do Manager.
 *
 * Falha sempre com 401 genérico — nunca distingue "cabeçalho ausente" de "sessão inválida" de
 * "sessão expirada" na mensagem devolvida ao cliente (nunca facilitar enumeração/diagnóstico externo
 * do motivo exato da falha de autenticação).
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const sessionId = extractSessionId(request);
  if (!sessionId) {
    throw new UnauthorizedError("Autenticação necessária.");
  }

  try {
    const { result } = await request.server.managers.iam.buildSecurityContext(sessionId);
    request.securityContext = result;
  } catch {
    throw new UnauthorizedError("Sessão inválida, expirada ou revogada.");
  }

  void reply.header("Cache-Control", "no-store");
}
