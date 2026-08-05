import fp from "fastify-plugin";
import type { FastifyError, FastifyPluginAsync } from "fastify";
import { HttpError } from "../errors/HttpError.js";
import { mapDomainError } from "../errors/mapDomainError.js";

export interface ErrorResponseBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly correlationId: string;
  };
}

/**
 * Tratamento global de erro — o único `setErrorHandler` de toda a aplicação. Quatro origens
 * possíveis de erro, cada uma tratada explicitamente, nunca por um catch-all silencioso:
 *
 * 1. Falha de validação de schema do próprio Fastify (`error.validation` presente) — sempre 400,
 *    nunca outro código, porque schema inválido é sempre culpa da requisição, nunca do domínio.
 * 2. Erro do próprio Fastify anterior à validação de schema — ex.: `FST_ERR_CTP_INVALID_CONTENT_LENGTH`,
 *    corpo malformado, JSON inválido. Fastify já anexa o `statusCode` correto (sempre 4xx) a esses
 *    erros antes mesmo de chegar aqui — encontrado em teste manual desta própria Sprint (Seção
 *    "Validação"), onde um erro assim estava sendo mal classificado como 500 por cair direto em
 *    `mapDomainError`, que não tem como saber que já existia um `statusCode` correto. Corrigido:
 *    todo erro com `code` iniciado por `FST_` e `statusCode` numérico já definido pelo próprio
 *    Fastify é respeitado diretamente, nunca reclassificado.
 * 3. `HttpError` já lançado por um controller (via `mapDomainError`, Seção "Erros" do relatório) —
 *    devolve exatamente o `statusCode`/`code`/`message` já decidido.
 * 4. Qualquer outro erro (verdadeiramente inesperado) — sempre 500, com uma mensagem genérica; o
 *    erro real é registrado apenas no log do servidor (`request.log.error`), nunca devolvido ao
 *    cliente — "nunca retornar stack trace" aplicado estruturalmente aqui, não apenas por convenção.
 *
 * Corpo de resposta padronizado (`ErrorResponseBody`) em todo caso, sempre incluindo o
 * `correlationId` já atribuído pelo plugin de mesmo nome — a mesma correlação que aparece no log do
 * servidor, permitindo cruzar um erro relatado por um cliente com a linha de log exata que o
 * originou.
 */
export const errorHandlerPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    const correlationId = request.correlationId ?? "unknown";

    if (error.validation) {
      request.log.warn({ err: error }, "Falha de validação de schema.");
      const body: ErrorResponseBody = { error: { code: "BAD_REQUEST", message: error.message, correlationId } };
      reply.status(400).send(body);
      return;
    }

    if (typeof error.code === "string" && error.code.startsWith("FST_") && typeof error.statusCode === "number" && error.statusCode < 500) {
      request.log.warn({ err: error }, "Erro de transporte do próprio Fastify (corpo malformado, Content-Length, etc.).");
      const body: ErrorResponseBody = { error: { code: error.code, message: error.message, correlationId } };
      reply.status(error.statusCode).send(body);
      return;
    }

    const httpError = error instanceof HttpError ? error : mapDomainError(error);

    if (httpError.statusCode >= 500) {
      request.log.error({ err: error }, "Erro interno não mapeado.");
    } else {
      request.log.info({ err: error }, "Erro de domínio traduzido para resposta HTTP.");
    }

    const body: ErrorResponseBody = { error: { code: httpError.code, message: httpError.message, correlationId } };
    reply.status(httpError.statusCode).send(body);
  });

  fastify.setNotFoundHandler((request, reply) => {
    const correlationId = request.correlationId ?? "unknown";
    const body: ErrorResponseBody = { error: { code: "NOT_FOUND", message: `Rota não encontrada: ${request.method} ${request.url}.`, correlationId } };
    reply.status(404).send(body);
  });
});
