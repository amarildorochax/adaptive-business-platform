import type { FastifyPluginAsync } from "fastify";

/**
 * `/health` (liveness) — o processo está no ar; nunca toca o banco. `/ready` (readiness) — o
 * processo está pronto para tráfego real, checado executando `SELECT 1` contra a conexão SQLite já
 * aberta pelo plugin `managers` — a mesma distinção liveness/readiness já padrão em toda plataforma
 * de orquestração (Kubernetes e equivalentes), nunca um conceito inventado por esta Sprint.
 */
export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/health",
    {
      schema: {
        tags: ["health"],
        summary: "Liveness — o processo está no ar.",
        response: { 200: { type: "object", properties: { status: { type: "string" } } } },
      },
    },
    async () => ({ status: "ok" }),
  );

  fastify.get(
    "/ready",
    {
      schema: {
        tags: ["health"],
        summary: "Readiness — o processo está pronto para tráfego real (banco acessível).",
        response: {
          200: { type: "object", properties: { status: { type: "string" } } },
          503: { type: "object", properties: { status: { type: "string" }, reason: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      try {
        fastify.dbHandle.db.prepare("SELECT 1").get();
        return { status: "ready" };
      } catch (error) {
        request.log.error({ err: error }, "Readiness check falhou — banco inacessível.");
        return reply.status(503).send({ status: "not-ready", reason: "banco de dados inacessível" });
      }
    },
  );
};
