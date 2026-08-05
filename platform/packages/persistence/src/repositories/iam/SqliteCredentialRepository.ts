import type { Credential, CredentialRepository, Identity } from "@abp/platform-services";
import type { DatabaseSync } from "node:sqlite";
import { fromMs, toMs } from "../../db/sqlUtil.js";

interface CredentialRow {
  credential_id: string;
  identity: string;
  kind: string;
  secret_reference: string;
  created_at: number;
}

function toCredential(row: CredentialRow): Credential {
  return { credentialId: row.credential_id, identity: row.identity, kind: row.kind as Credential["kind"], secretReference: row.secret_reference, createdAt: fromMs(row.created_at) };
}

/** Implementação real de `CredentialRepository` (`@abp/platform-services`) — nunca redefine o contrato, apenas o satisfaz contra SQLite. */
export class SqliteCredentialRepository implements CredentialRepository {
  constructor(private readonly db: DatabaseSync) {}

  async create(credential: Credential): Promise<Credential> {
    this.db
      .prepare("INSERT INTO credentials (credential_id, identity, kind, secret_reference, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(credential.credentialId, credential.identity, credential.kind, credential.secretReference, toMs(credential.createdAt));
    return credential;
  }

  async listByIdentity(identity: Identity): Promise<Credential[]> {
    const rows = this.db.prepare("SELECT credential_id, identity, kind, secret_reference, created_at FROM credentials WHERE identity = ? ORDER BY rowid ASC").all(identity) as unknown as CredentialRow[];
    return rows.map(toCredential);
  }
}
