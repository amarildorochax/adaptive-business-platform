import type { FastifyPluginAsync } from "fastify";
import type {
  CalculateTaxRequestDto,
  CancelFiscalDocumentRequestDto,
  CreateTaxRuleRequestDto,
  EvaluateFiscalObligationsRequestDto,
  IssueFiscalDocumentRequestDto,
  RegisterFiscalObligationRequestDto,
  RegisterTaxRegimeRequestDto,
} from "../dtos/fiscal.dto.js";
import { NotFoundError } from "../errors/HttpError.js";
import { mapFiscalError } from "../errors/mapFiscalError.js";
import {
  toEvaluateFiscalObligationsResponseDto,
  toFiscalDocumentResponseDto,
  toFiscalObligationResponseDto,
  toTaxCalculationDto,
  toTaxRegimeResponseDto,
  toTaxRuleResponseDto,
} from "../mappers/fiscal.mapper.js";

const nonEmptyString = { type: "string", minLength: 1 } as const;
const fiscalDocumentTypeEnum = ["Sale", "Return", "Transfer"] as const;

// Nunca `minimum`/`not: { const: 0 }` em `rate.value`/`baseAmount.amount`/`quantity`/`unitValue.amount`
// abaixo — `InvalidTaxRateError`/`InvalidMoneyError`/`InvalidFiscalDocumentLineError` (Core) já são o
// único ponto que decide "valor negativo/quantidade não positiva é inválido"; duplicar essa regra no
// schema violaria "Jamais validar regras de negócio que já pertencem ao domínio" (mesmo critério de
// `registerStockMovementBodySchema.quantityDelta`, IMP-403, e `bomLineSchema`, IMP-503).
const moneySchema = {
  type: "object",
  required: ["amount", "currencyCode"],
  properties: { amount: { type: "number" }, currencyCode: nonEmptyString },
  additionalProperties: false,
} as const;

const taxClassificationSchema = {
  type: "object",
  required: ["code"],
  properties: { code: nonEmptyString },
  additionalProperties: false,
} as const;

const taxRateSchema = {
  type: "object",
  required: ["type", "value"],
  properties: { type: { type: "string", enum: ["Percentage", "Fixed"] }, value: { type: "number" } },
  additionalProperties: false,
} as const;

const taxCalculationSchema = {
  type: "object",
  required: ["taxCalculationId", "fiscalDocumentLineId", "taxRuleId", "amount", "calculatedAt"],
  properties: {
    taxCalculationId: nonEmptyString,
    fiscalDocumentLineId: nonEmptyString,
    taxRuleId: nonEmptyString,
    amount: moneySchema,
    calculatedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const registerTaxRegimeBodySchema = {
  type: "object",
  required: ["tenantId", "name"],
  properties: { tenantId: nonEmptyString, name: nonEmptyString },
  additionalProperties: false,
} as const;

const createTaxRuleBodySchema = {
  type: "object",
  required: ["tenantId", "taxRegimeId", "classification", "rate", "validFrom"],
  properties: {
    tenantId: nonEmptyString,
    taxRegimeId: nonEmptyString,
    classification: taxClassificationSchema,
    rate: taxRateSchema,
    exemptionCondition: { type: "string", minLength: 1 },
    validFrom: { type: "string", format: "date-time" },
    validUntil: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const calculateTaxBodySchema = {
  type: "object",
  required: ["fiscalDocumentLineId", "taxRegimeId", "classification", "baseAmount"],
  properties: {
    fiscalDocumentLineId: nonEmptyString,
    taxRegimeId: nonEmptyString,
    classification: taxClassificationSchema,
    baseAmount: moneySchema,
    calculationDate: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const issueFiscalDocumentLineSchema = {
  type: "object",
  required: ["fiscalDocumentLineId", "productId", "quantity", "unitValue", "classification", "taxCalculation"],
  properties: {
    fiscalDocumentLineId: nonEmptyString,
    productId: nonEmptyString,
    quantity: { type: "number" },
    unitValue: moneySchema,
    classification: taxClassificationSchema,
    taxCalculation: taxCalculationSchema,
  },
  additionalProperties: false,
} as const;

const issueFiscalDocumentBodySchema = {
  type: "object",
  required: ["tenantId", "type", "lines"],
  properties: {
    tenantId: nonEmptyString,
    type: { type: "string", enum: fiscalDocumentTypeEnum },
    // Sem `minItems` e sem exigir `orderId`/`invoiceId` aqui — `FiscalDocumentMissingOriginError`
    // (Core) já é o único ponto que decide a exigência de origem, mesmo critério de
    // `createBillOfMaterialsBodySchema.lines` (IMP-503).
    orderId: { type: "string", minLength: 1 },
    invoiceId: { type: "string", minLength: 1 },
    lines: { type: "array", items: issueFiscalDocumentLineSchema },
    number: { type: "string", minLength: 1 },
    series: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
} as const;

const cancelFiscalDocumentBodySchema = {
  type: "object",
  required: ["reason"],
  properties: { reason: nonEmptyString },
  additionalProperties: false,
} as const;

const registerFiscalObligationBodySchema = {
  type: "object",
  required: ["tenantId", "type", "periodicity", "dueDate"],
  properties: {
    tenantId: nonEmptyString,
    type: nonEmptyString,
    periodicity: nonEmptyString,
    dueDate: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

const evaluateFiscalObligationsBodySchema = {
  type: "object",
  properties: { asOfDate: { type: "string", format: "date-time" } },
  additionalProperties: false,
} as const;

/**
 * Rotas HTTP do Fiscal Hub — HTTP → DTO → `FiscalManager` → DTO → HTTP, sem regra de negócio própria,
 * mesma disciplina de `routes/production.ts`/`routes/purchase.ts`/`routes/inventoryMovement.ts`/
 * `routes/supplier.ts`. Quinze endpoints — um por método público de `FiscalManager` (oito Commands,
 * seis Query, mais `evaluateFiscalObligations`, que não é um dos oito Commands aprovados — ver
 * `FiscalEvaluationResult` em `@abp/fiscal-hub` — mas é público no Core e por isso exposto, per
 * instrução explícita "criar somente endpoints correspondentes aos métodos públicos do Manager", mesma
 * disciplina já aplicada a `evaluateReorderRule` em `routes/purchase.ts`, IMP-303). Nenhum inventado,
 * nenhum omitido.
 *
 * AUDITORIA — TRÊS CLASSES DE BUG JÁ CONHECIDAS (per instrução explícita desta Sprint — "Verificar
 * explicitamente ... mesmo quando inexistentes"):
 *
 * 1. **PATCH-clobber (IMP-203)** — o bug original exigia um endpoint `PATCH` cujo corpo é mesclado via
 *    `{ ...existing, ...input }` (Core), reconstruindo todas as chaves do DTO mesmo quando ausentes do
 *    JSON recebido, sobrescrevendo campo existente com `undefined`. **Nenhuma superfície aqui**: este
 *    arquivo não define nenhum endpoint `PATCH` — os oito Commands do Fiscal Hub são ou criações
 *    completas via Factory com input totalmente tipado (`registerTaxRegime`/`createTaxRule`/
 *    `calculateTax`/`issueFiscalDocument`/`registerFiscalObligation`), ou transições de propósito
 *    específico que reconstroem a Entidade inteira internamente no Service, nunca por merge parcial
 *    vindo do cliente (`deactivateTaxRule`/`cancelFiscalDocument`/`markFiscalObligationFulfilled` —
 *    corpo mínimo, sempre obrigatório quando existente, nunca um `Partial<...>` opcional por campo).
 *    Mesma conclusão já documentada por IMP-303/IMP-403/IMP-503 para seus respectivos Hubs.
 *
 * 2. **FK second-write (IMP-303)** — o bug original exige duas condições estruturais simultâneas: (a)
 *    um Aggregate cuja coleção filha é regravada por completo (`DELETE` + `INSERT`) a cada escrita, e
 *    (b) uma tabela de um Aggregate *diferente*, um nível abaixo, com FOREIGN KEY real apontando para
 *    aquela coleção filha (`receiving_lines` → `purchase_order_items`). `SqliteFiscalDocumentRepository`
 *    (Persistência, IMP-602) regrava `fiscal_document_lines` por completo a cada `save()` — inclusive
 *    quando `cancelFiscalDocument` reescreve o `FiscalDocument` já emitido (as `lines` permanecem
 *    idênticas, mas passam pelo mesmo `DELETE` + `INSERT`) — condição (a) está presente. Mas **nenhuma
 *    tabela deste schema referencia** `fiscal_document_lines.fiscal_document_line_id` por FOREIGN KEY
 *    (confirmado em `0006_fiscal_hub.sql`, IMP-602: `fiscal_document_lines` é tabela-folha, apenas
 *    referenciada nunca referenciadora) — condição (b) está ausente. Emitir e em seguida cancelar o
 *    mesmo `FiscalDocument` é redundante para as linhas (regrava a coleção idêntica) mas nunca viola
 *    FOREIGN KEY. Confirmado empiricamente por `routes/fiscal.test.ts` ("issue seguido de cancel...
 *    nunca falha por FOREIGN KEY"), não apenas por leitura de código — mesma disciplina exigida pelos
 *    relatórios anteriores.
 *
 * 3. **Ledger immutability (IMP-403)** — não se aplica: nenhum Aggregate do Fiscal Hub é um ledger
 *    append-only — `FiscalDocumentRepository`/`FiscalObligationRepository`/`TaxRuleRepository`/
 *    `TaxRegimeRepository` (Core, congelados) expõem `save`, nunca apenas `append`, e nenhuma TRIGGER de
 *    imutabilidade existe na Persistência (IMP-602, migration sem TRIGGER). `FiscalDocument` e
 *    `FiscalObligation` são, cada um, uma pequena máquina de estados (`Issued`/`Cancelled` e
 *    `Pending`/`Fulfilled`/`Overdue`, respectivamente) — mesma categoria de `ProductionOrder`
 *    (IMP-503). A propriedade de segurança análoga e correta para um Aggregate de máquina de estados —
 *    nunca ausência de escrita, mas ausência de escrita *arbitrária* — já é garantida pela ausência
 *    total de `PUT`/`PATCH` neste arquivo: nenhuma rota permite a um cliente definir `status`
 *    diretamente; toda transição passa por um Command `POST .../deactivate`/`.../cancel`/`.../fulfill`
 *    de propósito específico. Verificado tanto por tentativa HTTP direta quanto pelo próprio documento
 *    OpenAPI (`routes/fiscal.test.ts`), mesma disciplina de `routes/inventoryMovement.test.ts`/
 *    `routes/production.test.ts`.
 *
 * 4. **HTTP Status** — `201` reservado exclusivamente às cinco criações (`registerTaxRegime`/
 *    `createTaxRule`/`calculateTax`/`issueFiscalDocument`/`registerFiscalObligation`); `200` (padrão,
 *    sem `.status()` explícito) para as três transições (`deactivateTaxRule`/`cancelFiscalDocument`/
 *    `markFiscalObligationFulfilled`) e para `evaluateFiscalObligations` — mesma regra adotada por
 *    IMP-503 ("201 é reservado a toda criação de registro novo; toda transição de um registro já
 *    existente responde 200"). `400` (schema Fastify) para corpo malformado; `404` para identificador
 *    inexistente; `409` para conflito de estado (`TaxRegime` duplicado, transição de status inválida);
 *    `422` para dado de entrada inválido aceito pelo schema mas rejeitado pelo Core. Nenhuma divergência
 *    encontrada nesta auditoria.
 */
export const fiscalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RegisterTaxRegimeRequestDto }>(
    "/tax-regimes",
    { schema: { tags: ["fiscal"], summary: "Registra o Tax Regime de um Tenant — no máximo um por Tenant.", body: registerTaxRegimeBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.fiscal.registerTaxRegime(request.body);
        return await reply.status(201).send(toTaxRegimeResponseDto(result));
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    "/tax-regimes/:tenantId",
    { schema: { tags: ["fiscal"], summary: "Localiza o Tax Regime de um Tenant." } },
    async (request) => {
      const result = await fastify.managers.fiscal.getTaxRegime(request.params.tenantId);
      if (!result) {
        throw new NotFoundError(`Nenhum Tax Regime encontrado para o Tenant ${request.params.tenantId}.`);
      }
      return toTaxRegimeResponseDto(result);
    },
  );

  fastify.post<{ Body: CreateTaxRuleRequestDto }>(
    "/tax-rules",
    { schema: { tags: ["fiscal"], summary: "Cria uma nova Tax Rule vigente para um Tax Regime.", body: createTaxRuleBodySchema } },
    async (request, reply) => {
      try {
        const { validFrom, validUntil, ...rest } = request.body;
        const { result } = await fastify.managers.fiscal.createTaxRule({
          ...rest,
          validFrom: new Date(validFrom),
          validUntil: validUntil ? new Date(validUntil) : undefined,
        });
        return await reply.status(201).send(toTaxRuleResponseDto(result));
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.get<{ Params: { taxRuleId: string } }>(
    "/tax-rules/:taxRuleId",
    { schema: { tags: ["fiscal"], summary: "Localiza uma Tax Rule por identificador." } },
    async (request) => {
      const result = await fastify.managers.fiscal.getTaxRule(request.params.taxRuleId);
      if (!result) {
        throw new NotFoundError(`Tax Rule ${request.params.taxRuleId} não encontrada.`);
      }
      return toTaxRuleResponseDto(result);
    },
  );

  fastify.post<{ Params: { taxRuleId: string } }>(
    "/tax-rules/:taxRuleId/deactivate",
    { schema: { tags: ["fiscal"], summary: "Desativa uma Tax Rule — nunca excluída, preserva rastreabilidade histórica." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.fiscal.deactivateTaxRule(request.params.taxRuleId);
        return toTaxRuleResponseDto(result);
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.post<{ Body: CalculateTaxRequestDto }>(
    "/tax-calculations",
    {
      schema: {
        tags: ["fiscal"],
        summary: "Aplica a Tax Rule vigente a um valor base, produzindo um Tax Calculation determinístico.",
        body: calculateTaxBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const { calculationDate, ...rest } = request.body;
        const { result } = await fastify.managers.fiscal.calculateTax({
          ...rest,
          calculationDate: calculationDate ? new Date(calculationDate) : undefined,
        });
        return await reply.status(201).send(toTaxCalculationDto(result));
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.post<{ Body: IssueFiscalDocumentRequestDto }>(
    "/fiscal-documents",
    {
      schema: {
        tags: ["fiscal"],
        summary: "Emite um novo Fiscal Document — exige ao menos uma origem (orderId ou invoiceId) e Tax Calculation já aplicado a cada linha.",
        body: issueFiscalDocumentBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const lines = request.body.lines.map((line) => ({
          ...line,
          taxCalculation: { ...line.taxCalculation, calculatedAt: new Date(line.taxCalculation.calculatedAt) },
        }));
        const { result } = await fastify.managers.fiscal.issueFiscalDocument({ ...request.body, lines });
        return await reply.status(201).send(toFiscalDocumentResponseDto(result));
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.get<{ Params: { fiscalDocumentId: string } }>(
    "/fiscal-documents/:fiscalDocumentId",
    { schema: { tags: ["fiscal"], summary: "Localiza um Fiscal Document por identificador." } },
    async (request) => {
      const result = await fastify.managers.fiscal.getFiscalDocument(request.params.fiscalDocumentId);
      if (!result) {
        throw new NotFoundError(`Fiscal Document ${request.params.fiscalDocumentId} não encontrado.`);
      }
      return toFiscalDocumentResponseDto(result);
    },
  );

  fastify.get<{ Params: { orderId: string } }>(
    "/fiscal-documents/by-origin/:orderId",
    { schema: { tags: ["fiscal"], summary: "Lista os Fiscal Document originados de um Order (Commerce Hub) específico." } },
    async (request) => {
      const results = await fastify.managers.fiscal.listFiscalDocumentsByOrigin(request.params.orderId);
      return results.map(toFiscalDocumentResponseDto);
    },
  );

  fastify.post<{ Params: { fiscalDocumentId: string }; Body: CancelFiscalDocumentRequestDto }>(
    "/fiscal-documents/:fiscalDocumentId/cancel",
    {
      schema: {
        tags: ["fiscal"],
        summary: "Cancela um Fiscal Document já emitido — única transição posterior permitida, nunca edição de conteúdo.",
        body: cancelFiscalDocumentBodySchema,
      },
    },
    async (request) => {
      try {
        const { result } = await fastify.managers.fiscal.cancelFiscalDocument(request.params.fiscalDocumentId, request.body.reason);
        return toFiscalDocumentResponseDto(result);
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.post<{ Body: RegisterFiscalObligationRequestDto }>(
    "/fiscal-obligations",
    { schema: { tags: ["fiscal"], summary: "Registra uma nova Fiscal Obligation (Pending).", body: registerFiscalObligationBodySchema } },
    async (request, reply) => {
      try {
        const { dueDate, ...rest } = request.body;
        const { result } = await fastify.managers.fiscal.registerFiscalObligation({ ...rest, dueDate: new Date(dueDate) });
        return await reply.status(201).send(toFiscalObligationResponseDto(result));
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.get(
    "/fiscal-obligations/pending",
    { schema: { tags: ["fiscal"], summary: "Lista as Fiscal Obligation em Pending." } },
    async () => {
      const results = await fastify.managers.fiscal.listPendingFiscalObligations();
      return results.map(toFiscalObligationResponseDto);
    },
  );

  fastify.get(
    "/fiscal-obligations/overdue",
    { schema: { tags: ["fiscal"], summary: "Lista as Fiscal Obligation em Overdue." } },
    async () => {
      const results = await fastify.managers.fiscal.listOverdueFiscalObligations();
      return results.map(toFiscalObligationResponseDto);
    },
  );

  fastify.post<{ Params: { fiscalObligationId: string } }>(
    "/fiscal-obligations/:fiscalObligationId/fulfill",
    { schema: { tags: ["fiscal"], summary: "Marca uma Fiscal Obligation como cumprida (Fulfilled)." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.fiscal.markFiscalObligationFulfilled(request.params.fiscalObligationId);
        return toFiscalObligationResponseDto(result);
      } catch (error) {
        throw mapFiscalError(error);
      }
    },
  );

  fastify.post<{ Body: EvaluateFiscalObligationsRequestDto }>(
    "/fiscal-obligations/evaluate-overdue",
    {
      schema: {
        tags: ["fiscal"],
        summary:
          "Avalia toda Fiscal Obligation pendente contra a data informada, transicionando para Overdue quando vencida (não é um Command aprovado — ver limite de domínio em @abp/fiscal-hub).",
        body: evaluateFiscalObligationsBodySchema,
      },
    },
    async (request) => {
      const { asOfDate } = request.body;
      const { result } = await fastify.managers.fiscal.evaluateFiscalObligations(asOfDate ? new Date(asOfDate) : undefined);
      return toEvaluateFiscalObligationsResponseDto(result);
    },
  );
};
