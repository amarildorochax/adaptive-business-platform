import type { FastifyPluginAsync } from "fastify";
import type {
  CancelProductionRequestDto,
  CreateBillOfMaterialsRequestDto,
  CreateProductionOrderRequestDto,
  CreateWorkCenterRequestDto,
  RegisterProductionConsumptionRequestDto,
  RegisterProductionOutputRequestDto,
  StartProductionRequestDto,
  SupersedeBillOfMaterialsRequestDto,
} from "../dtos/production.dto.js";
import { NotFoundError } from "../errors/HttpError.js";
import { mapProductionError } from "../errors/mapProductionError.js";
import {
  toBillOfMaterialsResponseDto,
  toProductionOrderResponseDto,
  toRegisterProductionConsumptionResponseDto,
  toRegisterProductionOutputResponseDto,
  toStartProductionResponseDto,
  toSupersedeBillOfMaterialsResponseDto,
  toWorkCenterResponseDto,
} from "../mappers/production.mapper.js";

const nonEmptyString = { type: "string", minLength: 1 } as const;
const unitOfMeasureEnum = ["Unit", "Kilogram", "Liter", "Meter"] as const;
const productionStatusEnum = ["Planned", "InProgress", "Completed", "Cancelled"] as const;

// Nunca `minimum`/`not: { const: 0 }` em `quantityPerOutputUnit`/`plannedOutputQuantity`/
// `quantityConsumed`/`quantityGenerated`/`acquisitionCost` abaixo — `InvalidBOMLineError`/
// `InvalidPlannedOutputQuantityError`/`InvalidProductionConsumptionError`/`InvalidProductionOutputError`
// (Core) já são o único ponto que decide "quantidade não positiva é inválida"; duplicar essa regra no
// schema violaria "Jamais validar regras de negócio que já pertencem ao domínio" (per instrução
// explícita desta Sprint, seguindo o mesmo critério de `registerStockMovementBodySchema.quantityDelta`
// em `routes/inventoryMovement.ts`, IMP-403).
const bomLineSchema = {
  type: "object",
  required: ["inputProductId", "quantityPerOutputUnit", "unitOfMeasure"],
  properties: {
    inputProductId: nonEmptyString,
    variantId: { type: "string", minLength: 1 },
    quantityPerOutputUnit: { type: "number" },
    unitOfMeasure: { type: "string", enum: unitOfMeasureEnum },
  },
  additionalProperties: false,
} as const;

const createBillOfMaterialsBodySchema = {
  type: "object",
  required: ["tenantId", "outputProductId", "lines"],
  properties: {
    tenantId: nonEmptyString,
    outputProductId: nonEmptyString,
    // Sem `minItems` — `BillOfMaterials.lines` não exige tamanho mínimo no Core (IMP-501, "Decisões
    // Tomadas": "nenhuma regra explícita da arquitetura exige um mínimo"); duplicar aqui uma restrição
    // que o próprio Core deliberadamente não impõe inventaria uma regra de negócio não escrita.
    lines: { type: "array", items: bomLineSchema },
  },
  additionalProperties: false,
} as const;

const supersedeBillOfMaterialsBodySchema = {
  type: "object",
  required: ["lines"],
  properties: { lines: { type: "array", items: bomLineSchema } },
  additionalProperties: false,
} as const;

const createProductionOrderBodySchema = {
  type: "object",
  required: ["tenantId", "billOfMaterialsId", "plannedOutputQuantity"],
  properties: {
    tenantId: nonEmptyString,
    billOfMaterialsId: nonEmptyString,
    plannedOutputQuantity: { type: "number" },
    workCenterId: { type: "string", minLength: 1 },
    orderId: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
} as const;

const startProductionBodySchema = {
  type: "object",
  required: ["availableQuantities"],
  properties: {
    // `Record<string, number>` — tradução HTTP de `ReadonlyMap<string, number>` (Core); ver nota em
    // `dtos/production.dto.ts`.
    availableQuantities: { type: "object", additionalProperties: { type: "number" } },
  },
  additionalProperties: false,
} as const;

const registerProductionConsumptionBodySchema = {
  type: "object",
  required: ["inputProductId", "quantityConsumed", "acquisitionCost"],
  properties: {
    inputProductId: nonEmptyString,
    quantityConsumed: { type: "number" },
    acquisitionCost: { type: "number" },
    consumedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const registerProductionOutputBodySchema = {
  type: "object",
  required: ["outputProductId", "quantityGenerated"],
  properties: {
    outputProductId: nonEmptyString,
    quantityGenerated: { type: "number" },
    generatedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const cancelProductionBodySchema = {
  type: "object",
  required: ["reason"],
  properties: { reason: nonEmptyString },
  additionalProperties: false,
} as const;

const createWorkCenterBodySchema = {
  type: "object",
  required: ["tenantId", "name"],
  properties: {
    tenantId: nonEmptyString,
    name: nonEmptyString,
    // Diferente dos campos acima: o Core (`ProductionFactory.createWorkCenter`) não valida
    // `nominalCapacity` em nenhum ponto (nenhum Validator a consulta) — sem este `minimum`, uma
    // capacidade negativa seria aceita sem nenhuma rejeição em nenhuma camada. Mesmo critério já usado
    // por `createStockReservationBodySchema.quantity` (Inventory Movement Hub, IMP-403): um guard de
    // "óbvio input malformado" no schema, aplicado apenas quando nenhuma camada do domínio já cobre o
    // caso.
    nominalCapacity: { type: "number", minimum: 0 },
  },
  additionalProperties: false,
} as const;

const productionStatusParamsSchema = {
  type: "object",
  required: ["status"],
  properties: { status: { type: "string", enum: productionStatusEnum } },
} as const;

/**
 * Rotas HTTP do Production Hub — HTTP → DTO → `ProductionManager` → DTO → HTTP, sem regra de negócio
 * própria, mesma disciplina de `routes/inventoryMovement.ts`/`routes/purchase.ts`/`routes/supplier.ts`.
 * Dezessete endpoints — um por método público de `ProductionManager` (nove Commands, oito Query) —
 * mesma disciplina "um endpoint por método público do Manager" já aplicada por IMP-203/303/403. Nenhum
 * inventado, nenhum omitido.
 *
 * `getTotalConsumedCost`/`getTotalGeneratedQuantity` não são Commands (`ProductionManager`, Core) —
 * são consultas auxiliares que expõem a única consolidação de custo/quantidade permitida a este Hub
 * (`PRODUCTION_HUB.md`, Capítulo 3: "soma do acquisitionCost dos insumos consumidos"); ambas lançam
 * `ProductionOrderNotFoundError` internamente (Core), por isso — diferente das demais Query deste
 * arquivo, que checam `!result` manualmente — seus handlers usam `try/catch` +
 * `mapProductionError`, mesma disciplina de `evaluateReorderRule`/`listOpenPurchaseOrders`
 * documentada em `IMP_303_PURCHASE_HTTP_API_REPORT.md`.
 *
 * AUDITORIA — TRÊS CLASSES DE BUG JÁ CONHECIDAS (per instrução explícita desta Sprint — "Verificar
 * explicitamente ... mesmo quando inexistentes"):
 *
 * 1. **PATCH-clobber (IMP-203)** — o bug original exigia um endpoint `PATCH` cujo corpo é mesclado via
 *    `{ ...existing, ...input }` (Core), reconstruindo todas as chaves do DTO mesmo quando ausentes do
 *    JSON recebido, sobrescrevendo campo existente com `undefined`. **Nenhuma superfície aqui**: este
 *    arquivo não define nenhum endpoint `PATCH` — os nove Commands do Production Hub são ou criações
 *    completas via Factory com input totalmente tipado (`createBillOfMaterials`/`createProductionOrder`/
 *    `createWorkCenter`), ou transições de propósito específico com corpo mínimo e sempre obrigatório
 *    quando existente (`registerProductionConsumption`/`registerProductionOutput`/`cancelProduction` —
 *    nunca um corpo `Partial<...>` opcional por campo), ou sem corpo algum
 *    (`startProduction`/`completeProduction`). Nenhum deles reconstrói um objeto existente por merge
 *    parcial — mesma conclusão já documentada por IMP-303/IMP-403 para seus respectivos Hubs.
 *
 * 2. **FK second-write (IMP-303)** — o bug original exige duas condições estruturais simultâneas: (a)
 *    um Aggregate cuja coleção filha é regravada por completo (`DELETE` + `INSERT`) a cada escrita, e
 *    (b) uma tabela de um Aggregate *diferente*, um nível abaixo, com FOREIGN KEY real apontando para
 *    aquela coleção filha (`receiving_lines` → `purchase_order_items`). `SqliteProductionOrderRepository`
 *    (Persistência, IMP-502) regrava `production_consumptions`/`production_outputs` por completo a
 *    cada `save()` — condição (a) está presente — mas **nenhuma tabela deste schema referencia**
 *    `production_consumptions.consumption_id`/`production_outputs.output_id`/`bom_lines.line_id` por
 *    FOREIGN KEY (confirmado em `0005_production_hub.sql`, IMP-502: ambas são tabelas-folha) —
 *    condição (b) está ausente. Chamar `registerProductionConsumption`/`registerProductionOutput`
 *    repetidamente contra a mesma `ProductionOrder` é redundante (regrava toda a coleção acumulada a
 *    cada vez) mas nunca viola FOREIGN KEY. Confirmado empiricamente por
 *    `routes/production.test.ts` ("segundo registerProductionConsumption... nunca falha por FOREIGN
 *    KEY"), não apenas por leitura de código — mesma disciplina exigida pelos três relatórios
 *    anteriores.
 *
 * 3. **Ledger immutability (IMP-403)** — não se aplica: `ProductionOrder` é uma máquina de estados
 *    (`Planned`/`InProgress`/`Completed`/`Cancelled`), não um ledger append-only —
 *    `ProductionOrderRepository`/`BillOfMaterialsRepository`/`WorkCenterRepository` (Core, congelados)
 *    expõem `save`, nunca apenas `append`, e nenhuma TRIGGER de imutabilidade existe na Persistência
 *    (IMP-502, "SEM TRIGGER"). A propriedade de segurança análoga e correta para um Aggregate de
 *    máquina de estados — nunca ausência de escrita, mas ausência de escrita *arbitrária* — já é
 *    garantida pela ausência total de `PUT`/`PATCH` neste arquivo: nenhuma rota permite a um cliente
 *    definir `status`/`consumptions`/`outputs` diretamente; toda transição passa por um Command
 *    `POST .../start`/`.../complete`/`.../cancel` de propósito específico. Verificado tanto por
 *    tentativa HTTP direta quanto pelo próprio documento OpenAPI (`routes/production.test.ts`), mesma
 *    disciplina de `routes/inventoryMovement.test.ts`.
 */
export const productionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: CreateBillOfMaterialsRequestDto }>(
    "/bills-of-materials",
    {
      schema: {
        tags: ["production"],
        summary: "Cria a primeira versão (Active) de uma BillOfMaterials para um Produto final.",
        body: createBillOfMaterialsBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.production.createBillOfMaterials(request.body);
        return await reply.status(201).send(toBillOfMaterialsResponseDto(result));
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.post<{ Params: { billOfMaterialsId: string }; Body: SupersedeBillOfMaterialsRequestDto }>(
    "/bills-of-materials/:billOfMaterialsId/supersede",
    {
      schema: {
        tags: ["production"],
        summary: "Marca a BillOfMaterials corrente como Superseded e cria a próxima versão já Active.",
        body: supersedeBillOfMaterialsBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.production.supersedeBillOfMaterials(request.params.billOfMaterialsId, request.body);
        return await reply.status(201).send(toSupersedeBillOfMaterialsResponseDto(result));
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.get<{ Params: { billOfMaterialsId: string } }>(
    "/bills-of-materials/:billOfMaterialsId",
    { schema: { tags: ["production"], summary: "Localiza uma BillOfMaterials por identificador." } },
    async (request) => {
      const result = await fastify.managers.production.getBillOfMaterials(request.params.billOfMaterialsId);
      if (!result) {
        throw new NotFoundError(`BillOfMaterials ${request.params.billOfMaterialsId} não encontrada.`);
      }
      return toBillOfMaterialsResponseDto(result);
    },
  );

  fastify.get<{ Params: { outputProductId: string } }>(
    "/bills-of-materials/by-product/:outputProductId/active",
    { schema: { tags: ["production"], summary: "Localiza a BillOfMaterials Active corrente de um Produto final." } },
    async (request) => {
      const result = await fastify.managers.production.getActiveBillOfMaterialsForProduct(request.params.outputProductId);
      if (!result) {
        throw new NotFoundError(`Nenhuma BillOfMaterials ativa encontrada para o produto ${request.params.outputProductId}.`);
      }
      return toBillOfMaterialsResponseDto(result);
    },
  );

  fastify.post<{ Body: CreateProductionOrderRequestDto }>(
    "/production-orders",
    {
      schema: {
        tags: ["production"],
        summary: "Cria uma nova ProductionOrder (Planned), referenciando uma BillOfMaterials já ativa.",
        body: createProductionOrderBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.production.createProductionOrder(request.body);
        return await reply.status(201).send(toProductionOrderResponseDto(result));
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.get<{ Params: { productionOrderId: string } }>(
    "/production-orders/:productionOrderId",
    { schema: { tags: ["production"], summary: "Localiza uma ProductionOrder por identificador." } },
    async (request) => {
      const result = await fastify.managers.production.getProductionOrder(request.params.productionOrderId);
      if (!result) {
        throw new NotFoundError(`ProductionOrder ${request.params.productionOrderId} não encontrada.`);
      }
      return toProductionOrderResponseDto(result);
    },
  );

  fastify.get<{ Params: { status: (typeof productionStatusEnum)[number] } }>(
    "/production-orders/by-status/:status",
    { schema: { tags: ["production"], summary: "Lista as ProductionOrder em um dado status.", params: productionStatusParamsSchema } },
    async (request) => {
      const results = await fastify.managers.production.listProductionOrdersByStatus(request.params.status);
      return results.map(toProductionOrderResponseDto);
    },
  );

  fastify.get<{ Params: { orderId: string } }>(
    "/production-orders/by-origin/:orderId",
    { schema: { tags: ["production"], summary: "Lista as ProductionOrder originadas de um Order (Commerce Hub) específico." } },
    async (request) => {
      const results = await fastify.managers.production.listProductionOrdersByOrigin(request.params.orderId);
      return results.map(toProductionOrderResponseDto);
    },
  );

  fastify.get<{ Params: { productionOrderId: string } }>(
    "/production-orders/:productionOrderId/total-consumed-cost",
    {
      schema: {
        tags: ["production"],
        summary: "Soma do acquisitionCost de todo insumo já consumido nesta ProductionOrder — única consolidação de custo permitida a este Hub.",
      },
    },
    async (request) => {
      try {
        const totalConsumedCost = await fastify.managers.production.getTotalConsumedCost(request.params.productionOrderId);
        return { totalConsumedCost };
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.get<{ Params: { productionOrderId: string } }>(
    "/production-orders/:productionOrderId/total-generated-quantity",
    { schema: { tags: ["production"], summary: "Soma da quantidade efetivamente gerada nesta ProductionOrder." } },
    async (request) => {
      try {
        const totalGeneratedQuantity = await fastify.managers.production.getTotalGeneratedQuantity(request.params.productionOrderId);
        return { totalGeneratedQuantity };
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.post<{ Params: { productionOrderId: string }; Body: StartProductionRequestDto }>(
    "/production-orders/:productionOrderId/start",
    {
      schema: {
        tags: ["production"],
        summary: "Verifica disponibilidade de insumo e transiciona a ProductionOrder para InProgress quando suficiente.",
        body: startProductionBodySchema,
      },
    },
    async (request) => {
      try {
        const availableQuantities = new Map(Object.entries(request.body.availableQuantities));
        const { result } = await fastify.managers.production.startProduction(request.params.productionOrderId, availableQuantities);
        return toStartProductionResponseDto(result);
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.post<{ Params: { productionOrderId: string }; Body: RegisterProductionConsumptionRequestDto }>(
    "/production-orders/:productionOrderId/consumptions",
    {
      schema: {
        tags: ["production"],
        summary: "Registra insumo efetivamente consumido nesta ProductionOrder.",
        body: registerProductionConsumptionBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { consumedAt, ...rest } = request.body;
        const { result } = await fastify.managers.production.registerProductionConsumption(request.params.productionOrderId, {
          ...rest,
          consumedAt: consumedAt ? new Date(consumedAt) : undefined,
        });
        return await reply.status(201).send(toRegisterProductionConsumptionResponseDto(result));
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.post<{ Params: { productionOrderId: string }; Body: RegisterProductionOutputRequestDto }>(
    "/production-orders/:productionOrderId/outputs",
    {
      schema: {
        tags: ["production"],
        summary: "Registra Produto acabado efetivamente gerado nesta ProductionOrder.",
        body: registerProductionOutputBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { generatedAt, ...rest } = request.body;
        const { result } = await fastify.managers.production.registerProductionOutput(request.params.productionOrderId, {
          ...rest,
          generatedAt: generatedAt ? new Date(generatedAt) : undefined,
        });
        return await reply.status(201).send(toRegisterProductionOutputResponseDto(result));
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.post<{ Params: { productionOrderId: string } }>(
    "/production-orders/:productionOrderId/complete",
    {
      schema: {
        tags: ["production"],
        summary: "Conclui a ProductionOrder — exige ao menos um ProductionOutput já registrado.",
      },
    },
    async (request) => {
      try {
        const { result } = await fastify.managers.production.completeProduction(request.params.productionOrderId);
        return toProductionOrderResponseDto(result);
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.post<{ Params: { productionOrderId: string }; Body: CancelProductionRequestDto }>(
    "/production-orders/:productionOrderId/cancel",
    {
      schema: {
        tags: ["production"],
        summary: "Cancela a ProductionOrder — apenas antes de qualquer ProductionConsumption já registrado.",
        body: cancelProductionBodySchema,
      },
    },
    async (request) => {
      try {
        const { result } = await fastify.managers.production.cancelProduction(request.params.productionOrderId, request.body.reason);
        return toProductionOrderResponseDto(result);
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.post<{ Body: CreateWorkCenterRequestDto }>(
    "/work-centers",
    { schema: { tags: ["production"], summary: "Cria um novo Work Center (Capability opcional).", body: createWorkCenterBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.production.createWorkCenter(request.body);
        return await reply.status(201).send(toWorkCenterResponseDto(result));
      } catch (error) {
        throw mapProductionError(error);
      }
    },
  );

  fastify.get(
    "/work-centers/active",
    { schema: { tags: ["production"], summary: "Lista os Work Center ativos." } },
    async () => {
      const results = await fastify.managers.production.listActiveWorkCenters();
      return results.map(toWorkCenterResponseDto);
    },
  );
};
