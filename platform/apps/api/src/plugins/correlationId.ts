import type { CorrelationId } from "@abp/infrastructure";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    correlationId: CorrelationId;
  }
}

const CORRELATION_HEADER = "x-correlation-id";

/**
 * Correlation ID por requisição — reutiliza o tipo `CorrelationId` já definido em
 * `@abp/infrastructure` (IMP-012, `OBSERVABILITY_CONCRETE_STRUCTURE.md`), nunca um conceito paralelo
 * inventado por esta Sprint. Aceita o header já enviado pelo cliente (propagação entre serviços,
 * útil quando um futuro Frontend repassar o mesmo id recebido de outra chamada); gera um novo via
 * `crypto.randomUUID()` quando ausente. Sempre ecoado de volta no header de resposta, e sempre
 * incluído no contexto de log de cada requisição (`request.log`), sem exigir nenhum outro Manager de
 * Observability conectado — este plugin nunca chama `PlatformOperationsManager`, apenas reutiliza o
 * tipo.
 */
export const correlationIdPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.addHook("onRequest", async (request, reply) => {
    const incoming = request.headers[CORRELATION_HEADER];
    const correlationId: CorrelationId = typeof incoming === "string" && incoming.length > 0 ? incoming : crypto.randomUUID();

    request.correlationId = correlationId;
    request.log = request.log.child({ correlationId });
    reply.header(CORRELATION_HEADER, correlationId);
  });
});
