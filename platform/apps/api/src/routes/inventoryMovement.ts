import type { FastifyPluginAsync } from "fastify";
import type {
  CreateStockAlertRuleRequestDto,
  CreateStockLocationRequestDto,
  CreateStockReservationRequestDto,
  RegisterStockMovementRequestDto,
} from "../dtos/inventoryMovement.dto.js";
import { NotFoundError } from "../errors/HttpError.js";
import { mapInventoryMovementError } from "../errors/mapInventoryMovementError.js";
import {
  toConvertReservationToMovementResponseDto,
  toRegisterStockMovementResponseDto,
  toStockAlertRuleResponseDto,
  toStockLocationResponseDto,
  toStockMovementResponseDto,
  toStockPositionResponseDto,
  toStockReservationResponseDto,
} from "../mappers/inventoryMovement.mapper.js";

const nonEmptyString = { type: "string", minLength: 1 } as const;
const movementOriginEnum = ["Purchase", "ProductionConsumption", "ProductionOutput", "SaleFulfillment", "SaleReturn", "ManualAdjustment"] as const;

const stockLocationAddressSchema = {
  type: "object",
  required: ["line"],
  properties: { line: nonEmptyString },
  additionalProperties: false,
} as const;

const registerStockMovementBodySchema = {
  type: "object",
  required: ["tenantId", "productId", "quantityDelta", "origin"],
  properties: {
    tenantId: nonEmptyString,
    productId: nonEmptyString,
    variantId: { type: "string", minLength: 1 },
    locationId: { type: "string", minLength: 1 },
    // Nunca `minimum`/`not: { const: 0 }` aqui — `InvalidQuantityDeltaError` (Core) já é o único
    // ponto que decide "quantidade zero é inválida"; duplicar essa regra no schema violaria "Jamais
    // validar regras de negócio" (per instrução explícita desta Sprint). O schema aceita qualquer
    // inteiro; um `quantityDelta: 0` chega ao Manager e volta como 422 via `mapInventoryMovementError`
    // — testado explicitamente em `routes/inventoryMovement.test.ts`.
    quantityDelta: { type: "integer" },
    origin: { type: "string", enum: movementOriginEnum },
    originReferenceId: { type: "string", minLength: 1 },
    occurredAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const locationQuerystringSchema = {
  type: "object",
  properties: { locationId: { type: "string", minLength: 1 } },
  additionalProperties: false,
} as const;

const createStockReservationBodySchema = {
  type: "object",
  required: ["tenantId", "productId", "quantity", "orderId"],
  properties: {
    tenantId: nonEmptyString,
    productId: nonEmptyString,
    variantId: { type: "string", minLength: 1 },
    locationId: { type: "string", minLength: 1 },
    // Diferente de `quantityDelta` acima: o Core (`InventoryFactory.createStockReservation`) não
    // valida `quantity > 0` em nenhum ponto (limitação já documentada em
    // `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`) — sem este `minimum`, uma Reservation de
    // quantidade zero ou negativa seria aceita sem nenhuma rejeição em nenhuma camada. Mesmo critério
    // já usado por `addPurchaseOrderItemBodySchema.quantityOrdered` (Purchase Hub): um guard de "óbvio
    // input malformado" no schema, aplicado apenas quando nenhuma camada do domínio já cobre o caso.
    quantity: { type: "integer", minimum: 1 },
    orderId: nonEmptyString,
    expiresAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const createStockLocationBodySchema = {
  type: "object",
  required: ["tenantId", "name"],
  properties: {
    tenantId: nonEmptyString,
    name: nonEmptyString,
    address: stockLocationAddressSchema,
  },
  additionalProperties: false,
} as const;

const createStockAlertRuleBodySchema = {
  type: "object",
  required: ["tenantId", "productId", "thresholdQuantity"],
  properties: {
    tenantId: nonEmptyString,
    productId: nonEmptyString,
    variantId: { type: "string", minLength: 1 },
    locationId: { type: "string", minLength: 1 },
    thresholdQuantity: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
} as const;

/**
 * Rotas HTTP do Inventory Movement Hub — HTTP → DTO → `InventoryMovementManager` → DTO → HTTP, sem
 * regra de negócio própria, mesma disciplina de `routes/purchase.ts`/`routes/supplier.ts`. Treze
 * endpoints — um por método público de `InventoryMovementManager` (sete Commands, seis Query) — mesma
 * disciplina "um endpoint por método público do Manager" já aplicada por IMP-303. Nenhum inventado,
 * nenhum omitido.
 *
 * PRINCÍPIO DO LEDGER (per instrução explícita desta Sprint — "Movimentos são fatos. Fatos não são
 * editados"): não existe `PUT`/`PATCH`/`DELETE` em `/stock-movements/:movementId`, nem em nenhuma
 * rota deste arquivo — `StockMovementRepository` (Core/Persistência, congelados) já expõe apenas
 * `append`, nunca `update`/`delete`, e `InventoryMovementManager` não tem nenhum método público que
 * altere ou remova um `StockMovement` já registrado. A API reflete exatamente essa ausência: nenhuma
 * rota é sequer registrada para esses verbos contra `/stock-movements/:movementId` — uma tentativa
 * retorna 404 (rota inexistente), nunca 405 (Fastify, por padrão, não distingue "rota existe mas
 * método não" de "rota não existe" quando nenhum outro verbo está registrado no mesmo path) — testado
 * explicitamente em `routes/inventoryMovement.test.ts`.
 *
 * Nenhum endpoint PATCH em lugar nenhum deste arquivo — auditoria desta Sprint (Passo 1) confirmou
 * que nenhum dos sete Commands do Inventory Movement Hub corresponde a uma atualização parcial por
 * merge (`{ ...existing, ...input }`), o padrão que causou o bug de IMP-203 (`PATCH /suppliers/:supplierId`
 * sobrescrevendo campo com `undefined`). `releaseStockReservation`/`convertReservationToMovement`/
 * `deactivateStockAlertRule` são transições de propósito específico sem nenhum corpo de requisição
 * (nada para o cliente sobrescrever); `registerStockMovement`/`createStockReservation`/
 * `createStockLocation`/`createStockAlertRule` são criações completas via Factory com input totalmente
 * tipado. O bug daquela classe não tem superfície de ataque neste domínio, mesma conclusão já
 * documentada em `IMP_303_PURCHASE_HTTP_API_REPORT.md` para o Purchase Hub.
 *
 * `?locationId=` como querystring opcional (`GET /stock-movements/by-product/:productId`,
 * `GET /stock-positions/:productId`) é o primeiro uso de `Querystring` tipado nesta API — nenhum Hub
 * anterior (Supplier, Purchase) precisou de um filtro opcional sem Entidade própria; documentado como
 * abstração candidata em `IMP_403_INVENTORY_MOVEMENT_HTTP_API_REPORT.md`.
 */
export const inventoryMovementRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RegisterStockMovementRequestDto }>(
    "/stock-movements",
    {
      schema: {
        tags: ["inventory-movement"],
        summary: "Registra um novo Stock Movement (fato físico imutável) e recalcula a Stock Position correspondente.",
        body: registerStockMovementBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { occurredAt, ...rest } = request.body;
        const { result } = await fastify.managers.inventoryMovement.registerStockMovement({
          ...rest,
          occurredAt: occurredAt ? new Date(occurredAt) : undefined,
        });
        return await reply.status(201).send(toRegisterStockMovementResponseDto(result));
      } catch (error) {
        throw mapInventoryMovementError(error);
      }
    },
  );

  fastify.get<{ Params: { productId: string }; Querystring: { locationId?: string } }>(
    "/stock-movements/by-product/:productId",
    {
      schema: {
        tags: ["inventory-movement"],
        summary: "Lista os Stock Movement de um Produto, em ordem cronológica — o ledger completo.",
        querystring: locationQuerystringSchema,
      },
    },
    async (request) => {
      const results = await fastify.managers.inventoryMovement.listStockMovementsByProduct(request.params.productId, request.query.locationId);
      return results.map(toStockMovementResponseDto);
    },
  );

  fastify.get<{ Params: { originReferenceId: string } }>(
    "/stock-movements/by-origin-reference/:originReferenceId",
    { schema: { tags: ["inventory-movement"], summary: "Lista os Stock Movement originados de um Purchase Order/Production Order/Order específico." } },
    async (request) => {
      const results = await fastify.managers.inventoryMovement.listStockMovementsByOriginReference(request.params.originReferenceId);
      return results.map(toStockMovementResponseDto);
    },
  );

  fastify.get<{ Params: { productId: string }; Querystring: { locationId?: string } }>(
    "/stock-positions/:productId",
    {
      schema: {
        tags: ["inventory-movement"],
        summary: "Consulta a Stock Position (projeção derivada) já recalculada de um Produto.",
        querystring: locationQuerystringSchema,
      },
    },
    async (request) => {
      const result = await fastify.managers.inventoryMovement.getStockPosition(request.params.productId, request.query.locationId);
      if (!result) {
        throw new NotFoundError(`Stock Position para o produto ${request.params.productId} ainda não foi recalculada.`);
      }
      return toStockPositionResponseDto(result);
    },
  );

  fastify.post<{ Body: CreateStockReservationRequestDto }>(
    "/stock-reservations",
    {
      schema: {
        tags: ["inventory-movement"],
        summary: "Cria uma nova Stock Reservation (comprometimento temporário, ainda sem decremento definitivo).",
        body: createStockReservationBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { expiresAt, ...rest } = request.body;
        const { result } = await fastify.managers.inventoryMovement.createStockReservation({
          ...rest,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });
        return await reply.status(201).send(toStockReservationResponseDto(result));
      } catch (error) {
        throw mapInventoryMovementError(error);
      }
    },
  );

  fastify.get<{ Params: { reservationId: string } }>(
    "/stock-reservations/:reservationId",
    { schema: { tags: ["inventory-movement"], summary: "Localiza uma Stock Reservation por identificador." } },
    async (request) => {
      const result = await fastify.managers.inventoryMovement.getStockReservation(request.params.reservationId);
      if (!result) {
        throw new NotFoundError(`Stock Reservation ${request.params.reservationId} não encontrada.`);
      }
      return toStockReservationResponseDto(result);
    },
  );

  fastify.get<{ Params: { orderId: string } }>(
    "/stock-reservations/by-order/:orderId",
    { schema: { tags: ["inventory-movement"], summary: "Lista as Stock Reservation associadas a um Order (Commerce Hub), independente do status." } },
    async (request) => {
      const results = await fastify.managers.inventoryMovement.listStockReservationsByOrder(request.params.orderId);
      return results.map(toStockReservationResponseDto);
    },
  );

  fastify.post<{ Params: { reservationId: string } }>(
    "/stock-reservations/:reservationId/release",
    { schema: { tags: ["inventory-movement"], summary: "Libera uma Stock Reservation ativa, sem conversão em saída definitiva." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.inventoryMovement.releaseStockReservation(request.params.reservationId);
        return toStockReservationResponseDto(result);
      } catch (error) {
        throw mapInventoryMovementError(error);
      }
    },
  );

  fastify.post<{ Params: { reservationId: string } }>(
    "/stock-reservations/:reservationId/convert",
    {
      schema: {
        tags: ["inventory-movement"],
        summary: "Converte uma Stock Reservation ativa em um Stock Movement de saída definitiva (origin: SaleFulfillment).",
      },
    },
    async (request) => {
      try {
        const { result } = await fastify.managers.inventoryMovement.convertReservationToMovement(request.params.reservationId);
        return toConvertReservationToMovementResponseDto(result);
      } catch (error) {
        throw mapInventoryMovementError(error);
      }
    },
  );

  fastify.post<{ Body: CreateStockLocationRequestDto }>(
    "/stock-locations",
    { schema: { tags: ["inventory-movement"], summary: "Cria uma nova Stock Location (Capability opcional).", body: createStockLocationBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.inventoryMovement.createStockLocation(request.body);
        return await reply.status(201).send(toStockLocationResponseDto(result));
      } catch (error) {
        throw mapInventoryMovementError(error);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    "/stock-locations/by-tenant/:tenantId/active",
    { schema: { tags: ["inventory-movement"], summary: "Lista as Stock Location ativas de um Tenant." } },
    async (request) => {
      const results = await fastify.managers.inventoryMovement.listActiveStockLocations(request.params.tenantId);
      return results.map(toStockLocationResponseDto);
    },
  );

  fastify.post<{ Body: CreateStockAlertRuleRequestDto }>(
    "/stock-alert-rules",
    { schema: { tags: ["inventory-movement"], summary: "Cria uma nova Stock Alert Rule.", body: createStockAlertRuleBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.inventoryMovement.createStockAlertRule(request.body);
        return await reply.status(201).send(toStockAlertRuleResponseDto(result));
      } catch (error) {
        throw mapInventoryMovementError(error);
      }
    },
  );

  fastify.post<{ Params: { ruleId: string } }>(
    "/stock-alert-rules/:ruleId/deactivate",
    { schema: { tags: ["inventory-movement"], summary: "Desativa uma Stock Alert Rule." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.inventoryMovement.deactivateStockAlertRule(request.params.ruleId);
        return toStockAlertRuleResponseDto(result);
      } catch (error) {
        throw mapInventoryMovementError(error);
      }
    },
  );
};
