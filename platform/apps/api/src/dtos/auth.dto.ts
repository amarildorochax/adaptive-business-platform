/**
 * DTOs da camada HTTP de autenticação — nunca `Credential`/`Session`/`AccessToken`/`SecurityContext`/
 * `AuthorizationDecision` de `@abp/platform-services` usados diretamente.
 *
 * Escopo desta Sprint (FUN-100): apenas `CredentialKind: 'Password'` exposto via HTTP — `'Passkey'`
 * continua modelado no IAM (`@abp/platform-services`), mas nenhum protocolo real de verificação de
 * Passkey (WebAuthn) existe em lugar nenhum da plataforma para justificar expor um endpoint sem
 * verificação real por trás — mesma disciplina de "nunca simular funcionalidade que não existe" já
 * aplicada em toda Sprint anterior desta série.
 */

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

/** `accessToken` é o `Session.sessionId` — ver `plugins/auth.ts` para a justificativa completa desta substituição deliberada. */
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
