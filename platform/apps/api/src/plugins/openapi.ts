import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

/**
 * Documentação OpenAPI — gerada automaticamente a partir do `schema` já declarado em cada rota
 * (`routes/*.ts`), nunca escrita manualmente em paralelo. `@fastify/swagger` monta o documento;
 * `@fastify/swagger-ui` o serve navegável em `/documentation`. O JSON bruto fica disponível em
 * `/documentation/json`.
 */
export const openapiPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Adaptive Business Platform — API HTTP",
        description: "Camada de transporte HTTP sobre os Managers já aprovados de Business Profile, Branding e CRM (FUN-004). Nenhuma regra de negócio vive aqui — apenas DTO, validação e roteamento.",
        version: "0.1.0",
      },
      tags: [
        { name: "health", description: "Liveness e readiness." },
        { name: "business-profile", description: "Business Profile Engine." },
        { name: "branding", description: "Branding Hub." },
        { name: "crm", description: "CRM Hub." },
        { name: "supplier", description: "Supplier Hub (ERP Foundation)." },
        { name: "purchase", description: "Purchase Hub (ERP Foundation)." },
        { name: "inventory-movement", description: "Inventory Movement Hub (ERP Foundation) — ledger físico imutável." },
        { name: "production", description: "Production Hub (ERP Foundation) — transformação de insumo em Produto acabado." },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: "/documentation",
  });
});
