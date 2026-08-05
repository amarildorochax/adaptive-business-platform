import type { FastifyPluginAsync } from "fastify";
import type {
  AddPurchaseOrderItemRequestDto,
  ApprovePurchaseOrderRequestDto,
  ConvertRequisitionToPurchaseOrderRequestDto,
  CreatePurchaseOrderRequestDto,
  CreatePurchaseRequisitionRequestDto,
  CreateReorderRuleRequestDto,
  EvaluateReorderRuleRequestDto,
  RegisterReceivingRequestDto,
} from "../dtos/purchase.dto.js";
import { NotFoundError } from "../errors/HttpError.js";
import { mapPurchaseError } from "../errors/mapPurchaseError.js";
import {
  toConvertRequisitionToPurchaseOrderResponseDto,
  toEvaluateReorderRuleResponseDto,
  toPurchaseOrderResponseDto,
  toPurchaseRequisitionResponseDto,
  toReceivingResponseDto,
  toRegisterReceivingResponseDto,
  toReorderRuleResponseDto,
} from "../mappers/purchase.mapper.js";

const nonEmptyString = { type: "string", minLength: 1 } as const;
const moneySchema = {
  type: "object",
  required: ["amount", "currencyCode"],
  properties: { amount: { type: "number" }, currencyCode: nonEmptyString },
  additionalProperties: false,
} as const;

const receivingLineSchema = {
  type: "object",
  required: ["purchaseOrderItemId", "quantityReceived"],
  properties: { purchaseOrderItemId: nonEmptyString, quantityReceived: { type: "integer", minimum: 1 } },
  additionalProperties: false,
} as const;

const requisitionLineSchema = {
  type: "object",
  required: ["productId", "suggestedQuantity"],
  properties: { productId: nonEmptyString, suggestedQuantity: { type: "integer", minimum: 1 } },
  additionalProperties: false,
} as const;

const acquisitionCostEntrySchema = {
  type: "object",
  required: ["productId", "cost"],
  properties: { productId: nonEmptyString, cost: moneySchema },
  additionalProperties: false,
} as const;

const createPurchaseOrderBodySchema = {
  type: "object",
  required: ["tenantId", "supplierId"],
  properties: { tenantId: nonEmptyString, supplierId: nonEmptyString },
  additionalProperties: false,
} as const;

const addPurchaseOrderItemBodySchema = {
  type: "object",
  required: ["productId", "quantityOrdered", "acquisitionCost"],
  properties: { productId: nonEmptyString, quantityOrdered: { type: "integer", minimum: 1 }, acquisitionCost: moneySchema },
  additionalProperties: false,
} as const;

const approvePurchaseOrderBodySchema = {
  type: "object",
  required: ["threshold"],
  properties: { threshold: moneySchema, approvedByIdentityId: { type: "string", minLength: 1 } },
  additionalProperties: false,
} as const;

const registerReceivingBodySchema = {
  type: "object",
  required: ["purchaseOrderId", "tenantId", "lines", "receivedAt"],
  properties: {
    purchaseOrderId: nonEmptyString,
    tenantId: nonEmptyString,
    lines: { type: "array", items: receivingLineSchema, minItems: 1 },
    receivedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const createPurchaseRequisitionBodySchema = {
  type: "object",
  required: ["tenantId", "origin", "lines"],
  properties: {
    tenantId: nonEmptyString,
    origin: { type: "string", enum: ["Manual", "AIRecommendation", "ReorderRule"] },
    lines: { type: "array", items: requisitionLineSchema, minItems: 1 },
  },
  additionalProperties: false,
} as const;

const convertRequisitionBodySchema = {
  type: "object",
  required: ["supplierId", "acquisitionCosts"],
  properties: {
    supplierId: nonEmptyString,
    acquisitionCosts: { type: "array", items: acquisitionCostEntrySchema },
  },
  additionalProperties: false,
} as const;

const createReorderRuleBodySchema = {
  type: "object",
  required: ["tenantId", "productId", "thresholdQuantity", "reorderQuantity"],
  properties: {
    tenantId: nonEmptyString,
    productId: nonEmptyString,
    thresholdQuantity: { type: "integer", minimum: 0 },
    reorderQuantity: { type: "integer", minimum: 1 },
    preferredSupplierId: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
} as const;

const evaluateReorderRuleBodySchema = {
  type: "object",
  required: ["currentQuantity"],
  properties: { currentQuantity: { type: "integer", minimum: 0 } },
  additionalProperties: false,
} as const;

const requisitionStatusParamsSchema = {
  type: "object",
  required: ["tenantId", "status"],
  properties: {
    tenantId: nonEmptyString,
    status: { type: "string", enum: ["Open", "Approved", "Rejected", "ConvertedToPurchaseOrder"] },
  },
} as const;

/**
 * Rotas HTTP do Purchase Hub — HTTP → DTO → `PurchaseManager` → DTO → HTTP, sem regra de negócio
 * própria, mesma disciplina de toda rota já aprovada nesta API (`routes/supplier.ts`, IMP-203).
 * Dezenove endpoints — um por método público de `PurchaseManager` (doze Commands, seis Query, mais
 * `evaluateReorderRule`, que não é um Command aprovado — ver `PurchaseEvaluationResult` em
 * `@abp/purchase-hub` — mas é público no Core e por isso exposto, per instrução explícita "criar
 * somente endpoints correspondentes aos métodos públicos do PurchaseManager"). Nenhum inventado,
 * nenhum omitido.
 *
 * Nenhum endpoint PATCH — auditoria desta Sprint (Passo 1) confirmou que nenhum dos doze Commands do
 * Purchase Hub corresponde a uma atualização parcial por merge (`{ ...existing, ...input }`), padrão
 * que causou o bug de `PATCH /suppliers/:supplierId` sobrescrevendo campo com `undefined` (IMP-203,
 * corrigido naquela Sprint). Cada Command aqui é uma criação completa (Factory com input totalmente
 * tipado) ou uma transição de propósito específico (aprovar/enviar/cancelar/rejeitar/desativar) — o
 * bug daquela classe não tem superfície de ataque neste domínio, documentado em
 * `IMP_303_PURCHASE_HTTP_API_REPORT.md`, Capítulo "Auditoria".
 */
export const purchaseRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: CreatePurchaseOrderRequestDto }>(
    "/purchase-orders",
    { schema: { tags: ["purchase"], summary: "Cria um novo Purchase Order.", body: createPurchaseOrderBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.purchase.createPurchaseOrder(request.body);
        return await reply.status(201).send(toPurchaseOrderResponseDto(result));
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.get<{ Params: { purchaseOrderId: string } }>(
    "/purchase-orders/:purchaseOrderId",
    { schema: { tags: ["purchase"], summary: "Localiza um Purchase Order por identificador." } },
    async (request) => {
      const result = await fastify.managers.purchase.getPurchaseOrder(request.params.purchaseOrderId);
      if (!result) {
        throw new NotFoundError(`Purchase Order ${request.params.purchaseOrderId} não encontrado.`);
      }
      return toPurchaseOrderResponseDto(result);
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    "/purchase-orders/by-tenant/:tenantId/open",
    { schema: { tags: ["purchase"], summary: "Lista os Purchase Order ainda abertos (não Recebidos/Cancelados) de um Tenant." } },
    async (request) => {
      const results = await fastify.managers.purchase.listOpenPurchaseOrders(request.params.tenantId);
      return results.map(toPurchaseOrderResponseDto);
    },
  );

  fastify.get<{ Params: { supplierId: string } }>(
    "/purchase-orders/by-supplier/:supplierId",
    { schema: { tags: ["purchase"], summary: "Lista os Purchase Order de um Fornecedor." } },
    async (request) => {
      const results = await fastify.managers.purchase.listPurchaseOrdersBySupplier(request.params.supplierId);
      return results.map(toPurchaseOrderResponseDto);
    },
  );

  fastify.post<{ Params: { purchaseOrderId: string }; Body: AddPurchaseOrderItemRequestDto }>(
    "/purchase-orders/:purchaseOrderId/items",
    { schema: { tags: ["purchase"], summary: "Adiciona um item ao Purchase Order.", body: addPurchaseOrderItemBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.purchase.addPurchaseOrderItem(request.params.purchaseOrderId, request.body);
        return await reply.status(201).send(toPurchaseOrderResponseDto(result));
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Params: { purchaseOrderId: string }; Body: ApprovePurchaseOrderRequestDto }>(
    "/purchase-orders/:purchaseOrderId/approve",
    { schema: { tags: ["purchase"], summary: "Aprova um Purchase Order.", body: approvePurchaseOrderBodySchema } },
    async (request) => {
      try {
        const { threshold, approvedByIdentityId } = request.body;
        const { result } = await fastify.managers.purchase.approvePurchaseOrder(
          request.params.purchaseOrderId,
          { limit: threshold },
          approvedByIdentityId,
        );
        return toPurchaseOrderResponseDto(result);
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Params: { purchaseOrderId: string } }>(
    "/purchase-orders/:purchaseOrderId/send",
    { schema: { tags: ["purchase"], summary: "Envia um Purchase Order aprovado ao Fornecedor." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.purchase.sendPurchaseOrderToSupplier(request.params.purchaseOrderId);
        return toPurchaseOrderResponseDto(result);
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Params: { purchaseOrderId: string } }>(
    "/purchase-orders/:purchaseOrderId/cancel",
    { schema: { tags: ["purchase"], summary: "Cancela um Purchase Order (nunca após qualquer Receiving)." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.purchase.cancelPurchaseOrder(request.params.purchaseOrderId);
        return toPurchaseOrderResponseDto(result);
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.get<{ Params: { purchaseOrderId: string } }>(
    "/purchase-orders/:purchaseOrderId/receivings",
    { schema: { tags: ["purchase"], summary: "Lista os Receiving registrados contra um Purchase Order." } },
    async (request) => {
      const results = await fastify.managers.purchase.listReceivingsByPurchaseOrder(request.params.purchaseOrderId);
      return results.map(toReceivingResponseDto);
    },
  );

  fastify.post<{ Body: RegisterReceivingRequestDto }>(
    "/receivings",
    { schema: { tags: ["purchase"], summary: "Registra um recebimento físico contra um Purchase Order.", body: registerReceivingBodySchema } },
    async (request, reply) => {
      try {
        const { purchaseOrderId, tenantId, lines, receivedAt } = request.body;
        const { result } = await fastify.managers.purchase.registerReceiving({
          purchaseOrderId,
          tenantId,
          lines,
          receivedAt: new Date(receivedAt),
        });
        return await reply.status(201).send(toRegisterReceivingResponseDto(result));
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Body: CreatePurchaseRequisitionRequestDto }>(
    "/purchase-requisitions",
    { schema: { tags: ["purchase"], summary: "Cria uma nova Purchase Requisition.", body: createPurchaseRequisitionBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.purchase.createPurchaseRequisition(request.body);
        return await reply.status(201).send(toPurchaseRequisitionResponseDto(result));
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.get<{ Params: { requisitionId: string } }>(
    "/purchase-requisitions/:requisitionId",
    { schema: { tags: ["purchase"], summary: "Localiza uma Purchase Requisition por identificador." } },
    async (request) => {
      const result = await fastify.managers.purchase.getPurchaseRequisition(request.params.requisitionId);
      if (!result) {
        throw new NotFoundError(`Purchase Requisition ${request.params.requisitionId} não encontrada.`);
      }
      return toPurchaseRequisitionResponseDto(result);
    },
  );

  fastify.get<{ Params: { tenantId: string; status: "Open" | "Approved" | "Rejected" | "ConvertedToPurchaseOrder" } }>(
    "/purchase-requisitions/by-tenant/:tenantId/status/:status",
    {
      schema: {
        tags: ["purchase"],
        summary: "Lista as Purchase Requisition de um Tenant por status.",
        params: requisitionStatusParamsSchema,
      },
    },
    async (request) => {
      const results = await fastify.managers.purchase.listPurchaseRequisitionsByStatus(request.params.tenantId, request.params.status);
      return results.map(toPurchaseRequisitionResponseDto);
    },
  );

  fastify.post<{ Params: { requisitionId: string } }>(
    "/purchase-requisitions/:requisitionId/approve",
    { schema: { tags: ["purchase"], summary: "Aprova uma Purchase Requisition." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.purchase.approvePurchaseRequisition(request.params.requisitionId);
        return toPurchaseRequisitionResponseDto(result);
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Params: { requisitionId: string } }>(
    "/purchase-requisitions/:requisitionId/reject",
    { schema: { tags: ["purchase"], summary: "Rejeita uma Purchase Requisition." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.purchase.rejectPurchaseRequisition(request.params.requisitionId);
        return toPurchaseRequisitionResponseDto(result);
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Params: { requisitionId: string }; Body: ConvertRequisitionToPurchaseOrderRequestDto }>(
    "/purchase-requisitions/:requisitionId/convert",
    {
      schema: {
        tags: ["purchase"],
        summary: "Converte uma Purchase Requisition aprovada em um novo Purchase Order.",
        body: convertRequisitionBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { supplierId, acquisitionCosts } = request.body;
        const costsMap = new Map(acquisitionCosts.map((entry) => [entry.productId, { amount: entry.cost.amount, currencyCode: entry.cost.currencyCode }]));
        const { result } = await fastify.managers.purchase.convertRequisitionToPurchaseOrder(request.params.requisitionId, supplierId, costsMap);
        return await reply.status(201).send(toConvertRequisitionToPurchaseOrderResponseDto(result));
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Body: CreateReorderRuleRequestDto }>(
    "/reorder-rules",
    { schema: { tags: ["purchase"], summary: "Cria uma nova Reorder Rule.", body: createReorderRuleBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.purchase.createReorderRule(request.body);
        return await reply.status(201).send(toReorderRuleResponseDto(result));
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Params: { ruleId: string } }>(
    "/reorder-rules/:ruleId/deactivate",
    { schema: { tags: ["purchase"], summary: "Desativa uma Reorder Rule." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.purchase.deactivateReorderRule(request.params.ruleId);
        return toReorderRuleResponseDto(result);
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );

  fastify.post<{ Params: { ruleId: string }; Body: EvaluateReorderRuleRequestDto }>(
    "/reorder-rules/:ruleId/evaluate",
    {
      schema: {
        tags: ["purchase"],
        summary: "Avalia uma Reorder Rule contra uma quantidade em estoque informada explicitamente (não é um Command aprovado — ver limite de domínio em @abp/purchase-hub).",
        body: evaluateReorderRuleBodySchema,
      },
    },
    async (request) => {
      try {
        const { result } = await fastify.managers.purchase.evaluateReorderRule(request.params.ruleId, request.body.currentQuantity);
        return toEvaluateReorderRuleResponseDto(result);
      } catch (error) {
        throw mapPurchaseError(error);
      }
    },
  );
};
