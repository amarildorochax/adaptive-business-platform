import type { FastifyPluginAsync } from "fastify";
import type {
  AddSupplierContactRequestDto,
  CreateSupplierContractRequestDto,
  RecordSupplierPerformanceRequestDto,
  RegisterSupplierCatalogItemRequestDto,
  RegisterSupplierRequestDto,
  UpdateSupplierCatalogItemRequestDto,
  UpdateSupplierRequestDto,
} from "../dtos/supplier.dto.js";
import { NotFoundError } from "../errors/HttpError.js";
import { mapSupplierError } from "../errors/mapSupplierError.js";
import {
  toSupplierCatalogItemResponseDto,
  toSupplierContractResponseDto,
  toSupplierPerformanceRecordResponseDto,
  toSupplierResponseDto,
} from "../mappers/supplier.mapper.js";

const nonEmptyString = { type: "string", minLength: 1 } as const;
const moneySchema = {
  type: "object",
  required: ["amount", "currencyCode"],
  properties: { amount: { type: "number" }, currencyCode: nonEmptyString },
  additionalProperties: false,
} as const;

const registerSupplierBodySchema = {
  type: "object",
  required: ["tenantId", "legalName", "taxId"],
  properties: { tenantId: nonEmptyString, legalName: nonEmptyString, taxId: nonEmptyString, supplyCategory: { type: "string" } },
  additionalProperties: false,
} as const;

const updateSupplierBodySchema = {
  type: "object",
  properties: { legalName: { type: "string" }, supplyCategory: { type: "string" }, taxId: { type: "string" } },
  additionalProperties: false,
} as const;

const addSupplierContactBodySchema = {
  type: "object",
  required: ["name", "role"],
  properties: { name: nonEmptyString, channelId: { type: "string" }, role: { type: "string", enum: ["Commercial", "Financial", "Logistics"] } },
  additionalProperties: false,
} as const;

const registerSupplierCatalogItemBodySchema = {
  type: "object",
  required: ["supplierId", "tenantId", "productId", "listPrice", "leadTimeInDays", "minimumOrderQuantity"],
  properties: {
    supplierId: nonEmptyString,
    tenantId: nonEmptyString,
    productId: nonEmptyString,
    listPrice: moneySchema,
    leadTimeInDays: { type: "integer", minimum: 0 },
    minimumOrderQuantity: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
} as const;

const updateSupplierCatalogItemBodySchema = {
  type: "object",
  properties: {
    listPrice: moneySchema,
    leadTimeInDays: { type: "integer", minimum: 0 },
    minimumOrderQuantity: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
} as const;

const createSupplierContractBodySchema = {
  type: "object",
  required: ["supplierId", "tenantId", "startsAt", "paymentTermsDueInDays"],
  properties: {
    supplierId: nonEmptyString,
    tenantId: nonEmptyString,
    startsAt: { type: "string", format: "date-time" },
    endsAt: { type: "string", format: "date-time" },
    paymentTermsDueInDays: { type: "integer", minimum: 0 },
    minimumVolume: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
} as const;

const recordSupplierPerformanceBodySchema = {
  type: "object",
  required: ["supplierId", "tenantId", "purchaseOrderId", "promisedAt", "receivedAt", "quantityOrdered", "quantityReceived"],
  properties: {
    supplierId: nonEmptyString,
    tenantId: nonEmptyString,
    purchaseOrderId: nonEmptyString,
    promisedAt: { type: "string", format: "date-time" },
    receivedAt: { type: "string", format: "date-time" },
    quantityOrdered: { type: "integer", minimum: 0 },
    quantityReceived: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
} as const;

/**
 * Rotas HTTP do Supplier Hub — HTTP → DTO → `SupplierManager` → DTO → HTTP, sem regra de negócio
 * própria, mesma disciplina de toda rota já aprovada nesta API. Onze endpoints, um por método
 * público de `SupplierManager` (nove Commands mais `getSupplier`/`listActiveSuppliers`) — nenhum
 * inventado, nenhum omitido.
 */
export const supplierRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RegisterSupplierRequestDto }>(
    "/suppliers",
    { schema: { tags: ["supplier"], summary: "Registra um novo Supplier.", body: registerSupplierBodySchema } },
    async (request, reply) => {
      try {
        const { tenantId, legalName, taxId, supplyCategory } = request.body;
        const { result } = await fastify.managers.supplier.registerSupplier({ tenantId, legalName, taxId: { value: taxId }, supplyCategory });
        return await reply.status(201).send(toSupplierResponseDto(result));
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.get<{ Params: { supplierId: string } }>(
    "/suppliers/:supplierId",
    { schema: { tags: ["supplier"], summary: "Localiza um Supplier por identificador." } },
    async (request) => {
      const result = await fastify.managers.supplier.getSupplier(request.params.supplierId);
      if (!result) {
        throw new NotFoundError(`Supplier ${request.params.supplierId} não encontrado.`);
      }
      return toSupplierResponseDto(result);
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    "/suppliers/by-tenant/:tenantId",
    { schema: { tags: ["supplier"], summary: "Lista os Supplier ativos de um Tenant." } },
    async (request) => {
      const results = await fastify.managers.supplier.listActiveSuppliers(request.params.tenantId);
      return results.map(toSupplierResponseDto);
    },
  );

  fastify.patch<{ Params: { supplierId: string }; Body: UpdateSupplierRequestDto }>(
    "/suppliers/:supplierId",
    { schema: { tags: ["supplier"], summary: "Atualiza dado cadastral de um Supplier.", body: updateSupplierBodySchema } },
    async (request) => {
      try {
        // Nunca reconstruir o corpo com chaves `undefined` explícitas — `SupplierService.update`
        // (Core, intocado) faz `{ ...existing, ...input }`; uma chave presente com valor
        // `undefined` sobrescreveria o dado já existente, em vez de preservá-lo. `taxId` (string)
        // é convertido para o Value Object apenas quando de fato enviado; as demais chaves
        // (`legalName`/`supplyCategory`) são repassadas por desestruturação de resto, que nunca
        // introduz uma chave ausente no JSON original — mesma disciplina que já protege
        // `crm.ts#updateCustomer`, que repassa `request.body` sem reconstrução.
        const { taxId, ...rest } = request.body;
        const input = taxId === undefined ? rest : { ...rest, taxId: { value: taxId } };
        const { result } = await fastify.managers.supplier.updateSupplier(request.params.supplierId, input);
        return toSupplierResponseDto(result);
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.post<{ Params: { supplierId: string } }>(
    "/suppliers/:supplierId/disable",
    { schema: { tags: ["supplier"], summary: "Desabilita um Supplier ativo." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.supplier.disableSupplier(request.params.supplierId);
        return toSupplierResponseDto(result);
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.post<{ Params: { supplierId: string } }>(
    "/suppliers/:supplierId/reactivate",
    { schema: { tags: ["supplier"], summary: "Reativa um Supplier desabilitado." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.supplier.reactivateSupplier(request.params.supplierId);
        return toSupplierResponseDto(result);
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.post<{ Params: { supplierId: string }; Body: AddSupplierContactRequestDto }>(
    "/suppliers/:supplierId/contacts",
    { schema: { tags: ["supplier"], summary: "Associa um Contact a um Supplier.", body: addSupplierContactBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.supplier.addSupplierContact(request.params.supplierId, request.body);
        return await reply.status(201).send(toSupplierResponseDto(result));
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.post<{ Body: RegisterSupplierCatalogItemRequestDto }>(
    "/supplier-catalog-items",
    { schema: { tags: ["supplier"], summary: "Associa um Supplier a um item de Catalog do Commerce Hub.", body: registerSupplierCatalogItemBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.supplier.registerSupplierCatalogItem(request.body);
        return await reply.status(201).send(toSupplierCatalogItemResponseDto(result));
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.patch<{ Params: { catalogItemId: string }; Body: UpdateSupplierCatalogItemRequestDto }>(
    "/supplier-catalog-items/:catalogItemId",
    { schema: { tags: ["supplier"], summary: "Atualiza preço/prazo/quantidade mínima de um item de catálogo.", body: updateSupplierCatalogItemBodySchema } },
    async (request) => {
      try {
        const { result } = await fastify.managers.supplier.updateSupplierCatalogItem(request.params.catalogItemId, request.body);
        return toSupplierCatalogItemResponseDto(result);
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.post<{ Body: CreateSupplierContractRequestDto }>(
    "/supplier-contracts",
    { schema: { tags: ["supplier"], summary: "Registra um acordo comercial formal com um Supplier.", body: createSupplierContractBodySchema } },
    async (request, reply) => {
      try {
        const { supplierId, tenantId, startsAt, endsAt, paymentTermsDueInDays, minimumVolume } = request.body;
        const { result } = await fastify.managers.supplier.createSupplierContract({
          supplierId,
          tenantId,
          startsAt: new Date(startsAt),
          endsAt: endsAt === undefined ? undefined : new Date(endsAt),
          paymentTerms: { dueInDays: paymentTermsDueInDays },
          minimumVolume,
        });
        return await reply.status(201).send(toSupplierContractResponseDto(result));
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );

  fastify.post<{ Body: RecordSupplierPerformanceRequestDto }>(
    "/supplier-performance-records",
    {
      schema: {
        tags: ["supplier"],
        summary: "Deriva um ou mais registros de desempenho a partir da comparação entre o prometido e o recebido.",
        body: recordSupplierPerformanceBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { supplierId, tenantId, purchaseOrderId, promisedAt, receivedAt, quantityOrdered, quantityReceived } = request.body;
        const { result } = await fastify.managers.supplier.recordSupplierPerformance({
          supplierId,
          tenantId,
          purchaseOrderId,
          promisedAt: new Date(promisedAt),
          receivedAt: new Date(receivedAt),
          quantityOrdered,
          quantityReceived,
        });
        return await reply.status(201).send(result.map(toSupplierPerformanceRecordResponseDto));
      } catch (error) {
        throw mapSupplierError(error);
      }
    },
  );
};
