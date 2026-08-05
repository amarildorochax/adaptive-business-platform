import type { FastifyPluginAsync } from "fastify";
import type {
  ConvertLeadRequestDto,
  CreateContactRequestDto,
  CreateCustomerRequestDto,
  CreateLeadRequestDto,
  CreateOpportunityRequestDto,
  CreateOrganizationRequestDto,
  MoveOpportunityRequestDto,
  UpdateCustomerRequestDto,
} from "../dtos/crm.dto.js";
import { mapDomainError } from "../errors/mapDomainError.js";
import { toContactResponseDto, toCustomerResponseDto, toLeadResponseDto, toOpportunityResponseDto, toOrganizationResponseDto, toRelationshipResponseDto } from "../mappers/crm.mapper.js";

const nonEmptyString = { type: "string", minLength: 1 } as const;

const createLeadBodySchema = {
  type: "object",
  required: ["tenantId", "name", "source"],
  properties: { tenantId: nonEmptyString, name: nonEmptyString, email: { type: "string" }, phone: { type: "string" }, source: nonEmptyString },
  additionalProperties: false,
} as const;

const convertLeadBodySchema = {
  type: "object",
  required: ["accountManagerId"],
  properties: { accountManagerId: nonEmptyString },
  additionalProperties: false,
} as const;

const createCustomerBodySchema = {
  type: "object",
  required: ["tenantId", "name", "accountManagerId"],
  properties: { tenantId: nonEmptyString, name: nonEmptyString, email: { type: "string" }, phone: { type: "string" }, accountManagerId: nonEmptyString },
  additionalProperties: false,
} as const;

const updateCustomerBodySchema = {
  type: "object",
  properties: { name: { type: "string" }, email: { type: "string" }, phone: { type: "string" } },
  additionalProperties: false,
} as const;

const createOrganizationBodySchema = {
  type: "object",
  required: ["tenantId", "name", "accountManagerId"],
  properties: {
    tenantId: nonEmptyString,
    name: nonEmptyString,
    tradeName: { type: "string" },
    taxId: { type: "string" },
    segment: { type: "string" },
    phone: { type: "string" },
    email: { type: "string" },
    website: { type: "string" },
    accountManagerId: nonEmptyString,
  },
  additionalProperties: false,
} as const;

const createContactBodySchema = {
  type: "object",
  required: ["tenantId", "name", "associationType", "associationId"],
  properties: {
    tenantId: nonEmptyString,
    name: nonEmptyString,
    role: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    associationType: { type: "string", enum: ["Customer", "Organization"] },
    associationId: nonEmptyString,
  },
  additionalProperties: false,
} as const;

const createOpportunityBodySchema = {
  type: "object",
  required: ["tenantId", "title", "value", "relationshipId", "pipelineId", "stageId"],
  properties: {
    tenantId: nonEmptyString,
    title: nonEmptyString,
    value: { type: "number" },
    relationshipId: nonEmptyString,
    pipelineId: nonEmptyString,
    stageId: nonEmptyString,
    partnerId: { type: "string" },
  },
  additionalProperties: false,
} as const;

const moveOpportunityBodySchema = {
  type: "object",
  required: ["stageId"],
  properties: { stageId: nonEmptyString, outcome: { type: "string", enum: ["Open", "Won", "Lost"] }, lostReason: { type: "string" } },
  additionalProperties: false,
} as const;

/** Rotas HTTP de CRM — HTTP → DTO → Manager → DTO → HTTP, sem regra de negócio própria. */
export const crmRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: CreateLeadRequestDto }>(
    "/crm/leads",
    { schema: { tags: ["crm"], summary: "Registra um novo Lead.", body: createLeadBodySchema } },
    async (request, reply) => {
      const { result } = await fastify.managers.crm.createLead(request.body);
      return reply.status(201).send(toLeadResponseDto(result));
    },
  );

  fastify.post<{ Params: { leadId: string }; Body: ConvertLeadRequestDto }>(
    "/crm/leads/:leadId/convert",
    { schema: { tags: ["crm"], summary: "Converte um Lead qualificado em Customer.", body: convertLeadBodySchema } },
    async (request) => {
      try {
        const { result } = await fastify.managers.crm.convertLead(request.params.leadId, request.body.accountManagerId);
        return { customer: toCustomerResponseDto(result.customer), relationship: toRelationshipResponseDto(result.relationship) };
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.post<{ Body: CreateCustomerRequestDto }>(
    "/crm/customers",
    { schema: { tags: ["crm"], summary: "Cadastra um Customer diretamente.", body: createCustomerBodySchema } },
    async (request, reply) => {
      const { tenantId, name, email, phone, accountManagerId } = request.body;
      const { result } = await fastify.managers.crm.createCustomer({ tenantId, name, email, phone }, accountManagerId);
      return reply.status(201).send({ customer: toCustomerResponseDto(result.customer), relationship: toRelationshipResponseDto(result.relationship) });
    },
  );

  fastify.patch<{ Params: { customerId: string }; Body: UpdateCustomerRequestDto }>(
    "/crm/customers/:customerId",
    { schema: { tags: ["crm"], summary: "Atualiza dado de contato de um Customer.", body: updateCustomerBodySchema } },
    async (request) => {
      try {
        const { result } = await fastify.managers.crm.updateCustomer(request.params.customerId, request.body);
        return toCustomerResponseDto(result);
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.post<{ Body: CreateOrganizationRequestDto }>(
    "/crm/organizations",
    { schema: { tags: ["crm"], summary: "Cadastra uma Organization.", body: createOrganizationBodySchema } },
    async (request, reply) => {
      const { accountManagerId, ...input } = request.body;
      const { result } = await fastify.managers.crm.createOrganization(input, accountManagerId);
      return reply.status(201).send({ organization: toOrganizationResponseDto(result.organization), relationship: toRelationshipResponseDto(result.relationship) });
    },
  );

  fastify.post<{ Body: CreateContactRequestDto }>(
    "/crm/contacts",
    { schema: { tags: ["crm"], summary: "Associa um Contact a um Customer ou a uma Organization.", body: createContactBodySchema } },
    async (request, reply) => {
      const { associationType, associationId, ...input } = request.body;
      const { result } = await fastify.managers.crm.createContact(input, associationType, associationId);
      return reply.status(201).send(toContactResponseDto(result));
    },
  );

  fastify.post<{ Body: CreateOpportunityRequestDto }>(
    "/crm/opportunities",
    { schema: { tags: ["crm"], summary: "Cria uma Opportunity associada a um Relationship.", body: createOpportunityBodySchema } },
    async (request, reply) => {
      try {
        const { relationshipId, ...input } = request.body;
        const { result } = await fastify.managers.crm.createOpportunity(input, relationshipId);
        return await reply.status(201).send(toOpportunityResponseDto(result));
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.post<{ Params: { opportunityId: string }; Body: MoveOpportunityRequestDto }>(
    "/crm/opportunities/:opportunityId/move",
    { schema: { tags: ["crm"], summary: "Move uma Opportunity para outro Stage, opcionalmente com outcome.", body: moveOpportunityBodySchema } },
    async (request) => {
      try {
        const { stageId, outcome, lostReason } = request.body;
        const { result } = await fastify.managers.crm.moveOpportunity(request.params.opportunityId, stageId, outcome, lostReason);
        return toOpportunityResponseDto(result);
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );
};
