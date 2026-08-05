import type { DatabaseHandle } from "@abp/persistence";
import Fastify, { type FastifyInstance } from "fastify";
import { corsPlugin } from "./plugins/cors.js";
import { correlationIdPlugin } from "./plugins/correlationId.js";
import { errorHandlerPlugin } from "./plugins/errorHandler.js";
import { managersPlugin } from "./plugins/managers.js";
import { openapiPlugin } from "./plugins/openapi.js";
import { authRoutes } from "./routes/auth.js";
import { businessProfileRoutes } from "./routes/businessProfile.js";
import { brandingRoutes } from "./routes/branding.js";
import { crmRoutes } from "./routes/crm.js";
import { healthRoutes } from "./routes/health.js";
import { inventoryMovementRoutes } from "./routes/inventoryMovement.js";
import { productionRoutes } from "./routes/production.js";
import { purchaseRoutes } from "./routes/purchase.js";
import { supplierRoutes } from "./routes/supplier.js";

export interface BuildServerOptions {
  /** Exclusivo de teste (`testing/buildTestServer.ts`) — nunca fornecido por `main.ts`. */
  readonly dbHandle?: DatabaseHandle;
  readonly logger?: boolean;
}

/**
 * Composição única do servidor HTTP — a única função que monta a aplicação, reutilizada tanto por
 * `main.ts` (processo real) quanto por `testing/buildTestServer.ts` (testes de integração via
 * `fastify.inject()`). Ordem de registro é deliberada: `cors` primeiro, para que cabeçalhos de CORS
 * acompanhem até respostas de erro; `correlationId` antes de `errorHandler` (o handler de erro já
 * precisa do id atribuído); `managers` antes de qualquer rota (nenhuma rota pode resolver
 * `fastify.managers` antes dele existir); `auth` antes dos demais domínios, sem significado de
 * precedência entre eles — apenas por ser o Hub mais recente (FUN-100).
 *
 * Nenhum Controller — nenhuma rota — instancia um Service ou um Repository; `managersPlugin` é o
 * único lugar que chama `createManagerRegistry` (`@abp/persistence`, FUN-003/FUN-100), exatamente
 * uma vez.
 */
export async function buildServer(options: BuildServerOptions = {}): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: options.logger ?? true });

  await fastify.register(corsPlugin);
  await fastify.register(correlationIdPlugin);
  await fastify.register(errorHandlerPlugin);
  await fastify.register(managersPlugin, { handle: options.dbHandle });
  await fastify.register(openapiPlugin);

  await fastify.register(healthRoutes);
  await fastify.register(authRoutes);
  await fastify.register(businessProfileRoutes);
  await fastify.register(brandingRoutes);
  await fastify.register(crmRoutes);
  await fastify.register(supplierRoutes);
  await fastify.register(purchaseRoutes);
  await fastify.register(inventoryMovementRoutes);
  await fastify.register(productionRoutes);

  return fastify;
}
