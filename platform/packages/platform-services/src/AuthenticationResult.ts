/**
 * Authentication Result — confirmação de quem está por trás de uma requisição.
 * Estrutura, regras e invariantes definidas em IDENTITY_CONCRETE_STRUCTURE.md.
 */
import type { Identity } from "./Identity.js";

export interface AuthenticationResult {
  /** Identidade confirmada. */
  readonly identity: Identity;

  /** Momento em que a confirmação ocorreu. */
  readonly authenticatedAt: Date;
}
