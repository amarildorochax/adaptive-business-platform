import type { Session, SessionRepository } from "@abp/platform-services";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, fromMsOrUndefined, toMs, toMsOrNull } from "../../db/sqlUtil.js";

interface SessionRow {
  session_id: string;
  identity: string;
  tenant_id: string;
  created_at: number;
  expires_at: number;
  revoked_at: number | null;
}

function toSession(row: SessionRow): Session {
  return {
    sessionId: row.session_id,
    identity: row.identity,
    tenantId: row.tenant_id,
    createdAt: fromMs(row.created_at),
    expiresAt: fromMs(row.expires_at),
    revokedAt: fromMsOrUndefined(row.revoked_at),
  };
}

/** Implementação real de `SessionRepository` (`@abp/platform-services`) — nunca redefine o contrato, apenas o satisfaz contra SQLite. */
export class SqliteSessionRepository implements SessionRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(session: Session): Promise<Session> {
    this.db
      .prepare("INSERT INTO sessions (session_id, identity, tenant_id, created_at, expires_at, revoked_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(session.sessionId, session.identity, session.tenantId, toMs(session.createdAt), toMs(session.expiresAt), toMsOrNull(session.revokedAt));
    return session;
  }

  async update(session: Session): Promise<Session> {
    this.db.prepare("UPDATE sessions SET expires_at = ?, revoked_at = ? WHERE session_id = ?").run(toMs(session.expiresAt), toMsOrNull(session.revokedAt), session.sessionId);
    return session;
  }

  async get(sessionId: string): Promise<Session | undefined> {
    const row = this.db.prepare("SELECT session_id, identity, tenant_id, created_at, expires_at, revoked_at FROM sessions WHERE session_id = ?").get(sessionId) as unknown as SessionRow | undefined;
    return row ? toSession(row) : undefined;
  }
}
