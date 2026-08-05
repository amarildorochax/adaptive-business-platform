import type { AccessToken, AccessTokenRepository } from "@abp/platform-services";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface AccessTokenRow {
  value: string;
  session_id: string;
  expires_at: number;
}

function toAccessToken(row: AccessTokenRow): AccessToken {
  return { value: row.value, sessionId: row.session_id, expiresAt: fromMs(row.expires_at) };
}

/** Implementação real de `AccessTokenRepository` (`@abp/platform-services`) — nunca redefine o contrato, apenas o satisfaz contra SQLite. */
export class SqliteAccessTokenRepository implements AccessTokenRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(token: AccessToken): Promise<AccessToken> {
    this.db.prepare("INSERT INTO access_tokens (value, session_id, expires_at) VALUES (?, ?, ?)").run(token.value, token.sessionId, toMs(token.expiresAt));
    return token;
  }

  async findBySession(sessionId: string): Promise<AccessToken | undefined> {
    const row = this.db.prepare("SELECT value, session_id, expires_at FROM access_tokens WHERE session_id = ?").get(sessionId) as unknown as AccessTokenRow | undefined;
    return row ? toAccessToken(row) : undefined;
  }
}
