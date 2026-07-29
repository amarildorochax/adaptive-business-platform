/**
 * Authorization Decision — confirmação do que uma identidade já autenticada tem permissão de fazer.
 * Estrutura, regras e invariantes definidas em IDENTITY_CONCRETE_STRUCTURE.md.
 */
import type { Identity } from "./Identity.js";

export interface AuthorizationDecision {
  /** Identidade cuja Permissão foi avaliada. */
  readonly identity: Identity;

  /** Ação avaliada. */
  readonly action: string;

  /** Se a ação foi permitida. */
  readonly permitted: boolean;

  /** Momento da decisão. */
  readonly decidedAt: Date;
}
