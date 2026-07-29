/**
 * Session — registro de uma autenticação ativa, entidade técnica distinta da Identity, com ciclo de vida
 * próprio e Claim de Tenant verificado a cada requisição.
 * Estrutura, regras e invariantes definidas em IDENTITY_CONCRETE_STRUCTURE.md.
 */
import type { Identity } from "./Identity.js";

export interface Session {
  /** Identificador da Sessão. */
  readonly sessionId: string;

  /** Identidade autenticada nesta Sessão. */
  readonly identity: Identity;

  /** Claim de Tenant — verificado a cada requisição, nunca aceito no contexto de outro Tenant. */
  readonly tenantId: string;

  /** Momento da criação da Sessão. */
  readonly createdAt: Date;

  /** Momento de expiração da Sessão. */
  readonly expiresAt: Date;

  /** Momento de revogação, quando revogada antes da expiração natural. */
  readonly revokedAt?: Date;
}
