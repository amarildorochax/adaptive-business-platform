import type { AuthorizationDecision, Credential, SecurityContext, Session } from "@abp/platform-services";
import type { AuthorizeResponseDto, LoginResponseDto, MeResponseDto, RefreshResponseDto, RegisterResponseDto } from "../dtos/auth.dto.js";

export function toRegisterResponseDto(credential: Credential): RegisterResponseDto {
  return { credentialId: credential.credentialId, identity: credential.identity, createdAt: credential.createdAt.toISOString() };
}

/** `accessToken` é `session.sessionId` — ver `plugins/auth.ts` para a justificativa completa. */
export function toLoginResponseDto(session: Session): LoginResponseDto {
  return { accessToken: session.sessionId, expiresAt: session.expiresAt.toISOString(), identity: session.identity, tenantId: session.tenantId };
}

export function toRefreshResponseDto(session: Session): RefreshResponseDto {
  return { accessToken: session.sessionId, expiresAt: session.expiresAt.toISOString() };
}

export function toMeResponseDto(context: SecurityContext): MeResponseDto {
  return { identity: context.identity, tenantId: context.tenantId, sessionId: context.sessionId, roles: context.roles };
}

export function toAuthorizeResponseDto(decision: AuthorizationDecision): AuthorizeResponseDto {
  return { action: decision.action, permitted: decision.permitted };
}
