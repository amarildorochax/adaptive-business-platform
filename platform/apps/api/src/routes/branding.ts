import type { FastifyPluginAsync } from "fastify";
import type { GenerateBrandThemeRequestDto, SubmitLogoRequestDto, UpdatePaletteRequestDto } from "../dtos/branding.dto.js";
import { NotFoundError } from "../errors/HttpError.js";
import { mapDomainError } from "../errors/mapDomainError.js";
import { toBrandThemeResponseDto, toBusinessContextResponseDto, toDesignTokenResponseDto, toLogoResponseDto } from "../mappers/branding.mapper.js";

const submitLogoBodySchema = {
  type: "object",
  required: ["tenantId", "assetReference"],
  properties: { tenantId: { type: "string", minLength: 1 }, assetReference: { type: "string", minLength: 1 } },
  additionalProperties: false,
} as const;

const generateBrandThemeBodySchema = {
  type: "object",
  required: ["tenantId", "primaryColorHex", "backgroundHex", "titleFont", "bodyFont"],
  properties: {
    tenantId: { type: "string", minLength: 1 },
    primaryColorHex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
    backgroundHex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
    titleFont: { type: "string", minLength: 1 },
    bodyFont: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
} as const;

const updatePaletteBodySchema = {
  type: "object",
  required: ["tenantId", "themeId", "primaryColorHex", "backgroundHex"],
  properties: {
    tenantId: { type: "string", minLength: 1 },
    themeId: { type: "string", minLength: 1 },
    primaryColorHex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
    backgroundHex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
  },
  additionalProperties: false,
} as const;

/** Rotas HTTP de Branding — HTTP → DTO → Manager → DTO → HTTP, sem regra de negócio própria. */
export const brandingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: SubmitLogoRequestDto }>(
    "/branding/logos",
    { schema: { tags: ["branding"], summary: "Envia um novo Logo.", body: submitLogoBodySchema } },
    async (request, reply) => {
      const { result } = await fastify.managers.branding.submitLogo(request.body.tenantId, request.body.assetReference);
      return reply.status(201).send(toLogoResponseDto(result));
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    "/branding/logos/:tenantId",
    { schema: { tags: ["branding"], summary: "Logo vigente de um Tenant." } },
    async (request) => {
      const { result } = await fastify.managers.branding.currentLogo(request.params.tenantId);
      if (!result) {
        throw new NotFoundError(`Nenhum Logo enviado para o Tenant ${request.params.tenantId}.`);
      }
      return toLogoResponseDto(result);
    },
  );

  fastify.post<{ Body: GenerateBrandThemeRequestDto }>(
    "/branding/identity",
    { schema: { tags: ["branding"], summary: "Primeira geração de identidade de marca de um Tenant.", body: generateBrandThemeBodySchema } },
    async (request, reply) => {
      try {
        const { result } = await fastify.managers.branding.generateInitialBrandIdentity(request.body);
        return await reply.status(201).send({ theme: toBrandThemeResponseDto(result.theme), tokens: result.tokens.map(toDesignTokenResponseDto) });
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.post<{ Body: GenerateBrandThemeRequestDto }>(
    "/branding/theme",
    { schema: { tags: ["branding"], summary: "Regenera o Theme de um Tenant que já possui identidade.", body: generateBrandThemeBodySchema } },
    async (request) => {
      try {
        const { result } = await fastify.managers.branding.regenerateTheme(request.body);
        return { theme: toBrandThemeResponseDto(result.theme), tokens: result.tokens.map(toDesignTokenResponseDto) };
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.post<{ Body: UpdatePaletteRequestDto }>(
    "/branding/palette",
    { schema: { tags: ["branding"], summary: "Atualiza a paleta de cor de um Theme já existente.", body: updatePaletteBodySchema } },
    async (request) => {
      try {
        const { result } = await fastify.managers.branding.updatePalette(request.body);
        return result.map(toDesignTokenResponseDto);
      } catch (error) {
        throw mapDomainError(error);
      }
    },
  );

  fastify.get<{ Params: { tenantId: string } }>(
    "/branding/theme/:tenantId",
    { schema: { tags: ["branding"], summary: "Theme vigente de um Tenant." } },
    async (request) => {
      const { result } = await fastify.managers.branding.currentTheme(request.params.tenantId);
      if (!result) {
        throw new NotFoundError(`Nenhum Theme gerado para o Tenant ${request.params.tenantId}.`);
      }
      return toBrandThemeResponseDto(result);
    },
  );

  fastify.get<{ Params: { profileId: string } }>(
    "/branding/context/:profileId",
    { schema: { tags: ["branding"], summary: "Segmento/Maturidade do Business Profile, consumidos como dado (integração unidirecional, Capítulo 12)." } },
    async (request) => {
      const context = await fastify.managers.branding.businessContext(request.params.profileId);
      return toBusinessContextResponseDto(context);
    },
  );
};
