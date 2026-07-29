/**
 * Security Context — conjunto de afirmações já verificadas sobre uma identidade, resolvido uma única vez e
 * consumido por qualquer Hub sem nova consulta ao Identity Hub.
 * Estrutura, regras e invariantes definidas em IDENTITY_CONCRETE_STRUCTURE.md.
 */
import type { Identity } from "./Identity.js";
import type { Role } from "./Role.js";

export interface SecurityContext {
  /** Identidade já resolvida. */
  readonly identity: Identity;

  /** Tenant já resolvido. */
  readonly tenantId: string;

  /** Sessão à qual este contexto se refere. */
  readonly sessionId: string;

  /** Papéis já resolvidos, consumíveis sem nova consulta ao Identity Hub. */
  readonly roles: readonly Role[];
}
