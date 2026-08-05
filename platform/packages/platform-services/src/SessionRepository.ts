import type { Session } from './Session';

/** Contrato de persistência de Session — apenas o contrato. `update` existe para renovação (`expiresAt`) e revogação (`revokedAt`) — nunca para alterar `identity`/`tenantId` de uma Session já criada. */
export interface SessionRepository {
  create(session: Session): Promise<Session>;
  update(session: Session): Promise<Session>;
  get(sessionId: string): Promise<Session | undefined>;
}
