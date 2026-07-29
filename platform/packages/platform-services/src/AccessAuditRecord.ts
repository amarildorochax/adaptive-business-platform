/**
 * Access Audit Record — registro imutável de uma decisão de acesso relevante: concessão, negação, ou
 * mudança de Permissão.
 * Estrutura, regras e invariantes definidas em IDENTITY_CONCRETE_STRUCTURE.md.
 */
import type { Identity } from "./Identity.js";

export interface AccessAuditRecord {
  /** Identidade cuja decisão de acesso foi registrada. */
  readonly identity: Identity;

  /** Tenant no qual a decisão ocorreu. */
  readonly tenantId: string;

  /** Ação avaliada. */
  readonly action: string;

  /** Se o acesso foi concedido. */
  readonly granted: boolean;

  /** Momento do registro. */
  readonly recordedAt: Date;
}
