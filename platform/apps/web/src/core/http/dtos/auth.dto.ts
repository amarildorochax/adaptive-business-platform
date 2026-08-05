/** DTOs do contrato HTTP de autenticação — espelham exatamente `apps/api/src/dtos/auth.dto.ts` (FUN-100). */

export interface RegisterRequestDto {
  readonly identity: string;
  readonly password: string;
}

export interface RegisterResponseDto {
  readonly credentialId: string;
  readonly identity: string;
  readonly createdAt: string;
}

export interface LoginRequestDto {
  readonly identity: string;
  readonly password: string;
  readonly tenantId: string;
}

export interface LoginResponseDto {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly identity: string;
  readonly tenantId: string;
}

export interface RefreshResponseDto {
  readonly accessToken: string;
  readonly expiresAt: string;
}

export interface MeResponseDto {
  readonly identity: string;
  readonly tenantId: string;
  readonly sessionId: string;
  readonly roles: readonly string[];
}

export interface AuthorizeRequestDto {
  readonly action: string;
}

export interface AuthorizeResponseDto {
  readonly action: string;
  readonly permitted: boolean;
}
