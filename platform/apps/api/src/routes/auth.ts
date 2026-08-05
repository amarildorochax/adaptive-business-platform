import type { FastifyPluginAsync } from "fastify";
import type { AuthorizeRequestDto, LoginRequestDto, RegisterRequestDto } from "../dtos/auth.dto.js";
import { mapIamError } from "../errors/mapIamError.js";
import { toAuthorizeResponseDto, toLoginResponseDto, toMeResponseDto, toRefreshResponseDto, toRegisterResponseDto } from "../mappers/auth.mapper.js";
import { requireAuth } from "../plugins/auth.js";
import { hashPassword } from "../security/passwordHashing.js";

const nonEmptyString = { type: "string", minLength: 1 } as const;

const registerBodySchema = {
  type: "object",
  required: ["identity", "password"],
  properties: { identity: nonEmptyString, password: { type: "string", minLength: 8 } },
  additionalProperties: false,
} as const;

const loginBodySchema = {
  type: "object",
  required: ["identity", "password", "tenantId"],
  properties: { identity: nonEmptyString, password: { type: "string", minLength: 1 }, tenantId: nonEmptyString },
  additionalProperties: false,
} as const;

const authorizeBodySchema = {
  type: "object",
  required: ["action"],
  properties: { action: nonEmptyString },
  additionalProperties: false,
} as const;

/**
 * Rotas HTTP de autenticação — HTTP → DTO → `IAMManager` → DTO → HTTP, sem regra de negócio própria,
 * exatamente como toda rota já aprovada nesta API. Único hashing de senha real de toda a plataforma
 * vive aqui (`security/passwordHashing.ts`) — `IAMManager` nunca sabe que uma "senha" existe, apenas
 * recebe o `secretReference` já opaco, exatamente como seu contrato já documentado exige.
 *
 * `/auth/register` e `/auth/login` nunca exigem sessão prévia. `/auth/logout`, `/auth/refresh`,
 * `/auth/me` e `/auth/authorize` exigem `requireAuth` (`plugins/auth.ts`) — a única credencial válida
 * é o `sessionId` devolvido por `/auth/login` como `accessToken`.
 */
export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: RegisterRequestDto }>(
    "/auth/register",
    { schema: { tags: ["auth"], summary: "Registra uma nova Credential de senha para uma Identity.", body: registerBodySchema } },
    async (request, reply) => {
      const { identity, password } = request.body;
      const secretReference = hashPassword(identity, password);

      try {
        const { result } = await fastify.managers.iam.registerCredential(identity, "Password", secretReference);
        return await reply.status(201).send(toRegisterResponseDto(result));
      } catch (error) {
        throw mapIamError(error);
      }
    },
  );

  fastify.post<{ Body: LoginRequestDto }>(
    "/auth/login",
    { schema: { tags: ["auth"], summary: "Autentica por senha e cria uma Session (login).", body: loginBodySchema } },
    async (request) => {
      const { identity, password, tenantId } = request.body;
      const secretReference = hashPassword(identity, password);

      try {
        const { result } = await fastify.managers.iam.login(identity, tenantId, "Password", secretReference);
        return toLoginResponseDto(result.session);
      } catch (error) {
        throw mapIamError(error);
      }
    },
  );

  fastify.post(
    "/auth/logout",
    { schema: { tags: ["auth"], summary: "Revoga a Session ativa (logout)." }, preHandler: requireAuth },
    async (request, reply) => {
      try {
        await fastify.managers.iam.revokeSession(request.securityContext!.sessionId);
        return await reply.status(204).send();
      } catch (error) {
        throw mapIamError(error);
      }
    },
  );

  fastify.post(
    "/auth/refresh",
    { schema: { tags: ["auth"], summary: "Renova a Session ativa, estendendo sua expiração." }, preHandler: requireAuth },
    async (request) => {
      try {
        const { result } = await fastify.managers.iam.renewSession(request.securityContext!.sessionId);
        return toRefreshResponseDto(result);
      } catch (error) {
        throw mapIamError(error);
      }
    },
  );

  fastify.get(
    "/auth/me",
    { schema: { tags: ["auth"], summary: "Identidade, Tenant e Papéis da Session ativa." }, preHandler: requireAuth },
    async (request) => {
      return toMeResponseDto(request.securityContext!);
    },
  );

  fastify.post<{ Body: AuthorizeRequestDto }>(
    "/auth/authorize",
    { schema: { tags: ["auth"], summary: "Verifica se a Session ativa tem permissão para uma ação.", body: authorizeBodySchema }, preHandler: requireAuth },
    async (request) => {
      const context = request.securityContext!;
      const { result } = await fastify.managers.iam.authorize(context.identity, context.tenantId, request.body.action);
      return toAuthorizeResponseDto(result);
    },
  );
};
