import type { FastifyPluginAsync } from "fastify";
import type { CreateBusinessProfileRequestDto } from "../dtos/businessProfile.dto.js";
import { NotFoundError } from "../errors/HttpError.js";
import { mapDomainError } from "../errors/mapDomainError.js";
import { toBusinessProfileResponseDto, toClassificationResponseDto, toLifecycleStateResponseDto, toMaturityResponseDto, toStageResponseDto } from "../mappers/businessProfile.mapper.js";

const createBusinessProfileBodySchema = {
  type: "object",
  required: ["tenantId", "segment", "maturity"],
  properties: {
    tenantId: { type: "string", minLength: 1 },
    segment: { type: "string", minLength: 1 },
    subsegment: { type: "string" },
    maturity: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
} as const;

/**
 * Rotas HTTP de Business Profile — cada handler segue exatamente HTTP → DTO → Manager → DTO → HTTP,
 * nunca contém regra de negócio própria. Toda chamada ao Manager que pode lançar (precondição
 * violada, ex.: ADR-001 "um Business Profile por Tenant") é traduzida por `mapDomainError`; toda
 * consulta que pode legitimamente retornar "nenhum dado ainda" (`undefined`) lança `NotFoundError`
 * explicitamente aqui — o Manager em si nunca lança nesse caso, apenas devolve `undefined`.
 */
export const businessProfileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: CreateBusinessProfileRequestDto }>(
    "/business-profiles",
    { schema: { tags: ["business-profile"], summary: "Cria o Business Profile de um Tenant.", body: createBusinessProfileBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.businessProfile.createBusinessProfile(request.body);
        return await reply.status(201).send(toBusinessProfileResponseDto(result));
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    "/business-profiles/by-tenant/:tenantId",
    { schema: { tags: ["business-profile"], summary: "Localiza o Business Profile de um Tenant." } },
    async (request) => {
      const { result } = await fastify.managers.businessProfile.findProfile(request.params.tenantId);
      if (!result) {
        throw new NotFoundError(`Business Profile não encontrado para o Tenant ${request.params.tenantId}.`);
      }
      return toBusinessProfileResponseDto(result);
    },
  );

  fastify.post<{ Params: { profileId: string } }>(
    "/business-profiles/:profileId/validate",
    { schema: { tags: ["business-profile"], summary: "Avança o Business Profile para o estágio Validação." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.businessProfile.validateProfile(request.params.profileId);
        return toLifecycleStateResponseDto(result);
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.post<{ Params: { profileId: string } }>(
    "/business-profiles/:profileId/finalize",
    { schema: { tags: ["business-profile"], summary: "Avança o Business Profile para o estágio Perfil Inicial." } },
    async (request) => {
      try {
        const { result } = await fastify.managers.businessProfile.finalizeInitialProfile(request.params.profileId);
        return toLifecycleStateResponseDto(result);
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.get<{ Params: { profileId: string } }>(
    "/business-profiles/:profileId/classification",
    { schema: { tags: ["business-profile"], summary: "Classificação (Segmento/Subsegmento) vigente." } },
    async (request) => {
      const { result } = await fastify.managers.businessProfile.currentClassification(request.params.profileId);
      if (!result) {
        throw new NotFoundError(`Nenhuma classificação registrada para o Business Profile ${request.params.profileId}.`);
      }
      return toClassificationResponseDto(result);
    },
  );

  fastify.get<{ Params: { profileId: string } }>(
    "/business-profiles/:profileId/maturity",
    { schema: { tags: ["business-profile"], summary: "Maturidade Digital vigente." } },
    async (request) => {
      const { result } = await fastify.managers.businessProfile.currentMaturity(request.params.profileId);
      if (!result) {
        throw new NotFoundError(`Nenhuma maturidade registrada para o Business Profile ${request.params.profileId}.`);
      }
      return toMaturityResponseDto(result);
    },
  );

  fastify.get<{ Params: { profileId: string } }>(
    "/business-profiles/:profileId/stage",
    { schema: { tags: ["business-profile"], summary: "Estágio atual da Jornada de Construção do Perfil." } },
    async (request) => {
      const { result } = await fastify.managers.businessProfile.currentStage(request.params.profileId);
      if (!result) {
        throw new NotFoundError(`Nenhum estágio registrado para o Business Profile ${request.params.profileId}.`);
      }
      return toStageResponseDto(result);
    },
  );
};
