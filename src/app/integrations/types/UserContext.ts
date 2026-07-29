// UserContext.ts
//
// Responsabilidade:
// Contrato de contexto de usuário consumido por `PermissionPolicy`
// (Sprint 29A) e pelos Adapters — combina a `Session` (se houver) com
// os papéis do usuário. `session: null` representa "não autenticado";
// nenhuma Sprint atual popula este contrato com dado real.

import type { Session } from './Session';

export interface UserContext {
  session: Session | null;
  roles: string[];
}

/** Contexto padrão — não autenticado, sem papéis. Usado até uma Sprint futura de Auth prover um real. */
export const anonymousUserContext: UserContext = {
  session: null,
  roles: [],
};
