import { describe, expect, it } from "vitest";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteAccessAuditRecordRepository } from "./SqliteAccessAuditRecordRepository.js";
import { SqliteAccessTokenRepository } from "./SqliteAccessTokenRepository.js";
import { SqliteCredentialRepository } from "./SqliteCredentialRepository.js";
import { SqliteProfileRepository } from "./SqliteProfileRepository.js";
import { SqliteRolePermissionRepository } from "./SqliteRolePermissionRepository.js";
import { SqliteSessionRepository } from "./SqliteSessionRepository.js";

describe("SqliteCredentialRepository", () => {
  it("listByIdentity preserva a ordem de inserção — CredentialService.matches depende do último inserido, nunca do mais recente por createdAt", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteCredentialRepository(handle.db);

    await repository.create({ credentialId: "cred-1", identity: "identity-1", kind: "Password", secretReference: "hash-antigo", createdAt: new Date("2026-07-01") });
    await repository.create({ credentialId: "cred-2", identity: "identity-1", kind: "Password", secretReference: "hash-novo", createdAt: new Date("2026-07-01") });

    const credentials = await repository.listByIdentity("identity-1");
    expect(credentials.at(-1)?.secretReference).toBe("hash-novo");
    handle.close();
  });

  it("listByIdentity nunca mistura Credentials de outra Identity", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteCredentialRepository(handle.db);

    await repository.create({ credentialId: "cred-1", identity: "identity-1", kind: "Password", secretReference: "hash-1", createdAt: new Date() });
    await repository.create({ credentialId: "cred-2", identity: "identity-2", kind: "Password", secretReference: "hash-2", createdAt: new Date() });

    expect(await repository.listByIdentity("identity-1")).toHaveLength(1);
    handle.close();
  });
});

describe("SqliteProfileRepository", () => {
  it("find localiza um Profile pelo par (identity, tenantId), nunca cruza Tenants", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteProfileRepository(handle.db);

    await repository.create({ profileId: "profile-1", identity: "identity-1", tenantId: "tenant-1", role: "Administrador", createdAt: new Date() });

    expect((await repository.find("identity-1", "tenant-1"))?.role).toBe("Administrador");
    expect(await repository.find("identity-1", "tenant-2")).toBeUndefined();
    handle.close();
  });

  it("update altera o Papel de um Profile já existente, sem criar um segundo registro (Troca de função)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteProfileRepository(handle.db);

    const created = await repository.create({ profileId: "profile-1", identity: "identity-1", tenantId: "tenant-1", role: "Convidado", createdAt: new Date() });
    await repository.update({ ...created, role: "Owner" });

    const found = await repository.find("identity-1", "tenant-1");
    expect(found?.role).toBe("Owner");
    expect(await repository.listByIdentity("identity-1")).toHaveLength(1);
    handle.close();
  });
});

describe("SqliteRolePermissionRepository", () => {
  it("grant nunca deduplica — listByRole devolve toda concessão já registrada, mesma tolerância do Fake", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteRolePermissionRepository(handle.db);

    await repository.grant({ role: "Financeiro", permission: "finance:approve" });
    await repository.grant({ role: "Financeiro", permission: "finance:approve" });

    expect(await repository.listByRole("Financeiro")).toHaveLength(2);
    handle.close();
  });

  it("listByRole nunca cruza Papéis diferentes", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteRolePermissionRepository(handle.db);

    await repository.grant({ role: "Owner", permission: "platform:manage" });
    await repository.grant({ role: "Convidado", permission: "read:only" });

    expect(await repository.listByRole("Owner")).toEqual([{ role: "Owner", permission: "platform:manage" }]);
    handle.close();
  });
});

describe("SqliteSessionRepository", () => {
  it("persiste e recupera uma Session por sessionId, incluindo expiresAt/revokedAt como Date", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSessionRepository(handle.db);

    const created = await repository.create({ sessionId: "session-1", identity: "identity-1", tenantId: "tenant-1", createdAt: new Date(), expiresAt: new Date(Date.now() + 3_600_000) });
    const found = await repository.get("session-1");

    expect(found).toEqual(created);
    expect(found?.revokedAt).toBeUndefined();
    handle.close();
  });

  it("update grava revokedAt — get subsequente reflete a revogação (ADR-010)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSessionRepository(handle.db);

    const created = await repository.create({ sessionId: "session-1", identity: "identity-1", tenantId: "tenant-1", createdAt: new Date(), expiresAt: new Date(Date.now() + 3_600_000) });
    await repository.update({ ...created, revokedAt: new Date() });

    expect((await repository.get("session-1"))?.revokedAt).toBeInstanceOf(Date);
    handle.close();
  });

  it("get retorna undefined para uma Session nunca criada", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteSessionRepository(handle.db);

    expect(await repository.get("session-inexistente")).toBeUndefined();
    handle.close();
  });
});

describe("SqliteAccessTokenRepository", () => {
  it("findBySession localiza o Access Token vinculado a uma Session", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteAccessTokenRepository(handle.db);

    await repository.create({ value: "token-1", sessionId: "session-1", expiresAt: new Date(Date.now() + 3_600_000) });

    expect((await repository.findBySession("session-1"))?.value).toBe("token-1");
    expect(await repository.findBySession("session-inexistente")).toBeUndefined();
    handle.close();
  });
});

describe("SqliteAccessAuditRecordRepository", () => {
  it("registra decisões concedidas e negadas, preservando ordem de inserção (ADR-007)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteAccessAuditRecordRepository(handle.db);

    await repository.create({ identity: "identity-1", tenantId: "tenant-1", action: "finance:approve", granted: false, recordedAt: new Date() });
    await repository.create({ identity: "identity-1", tenantId: "tenant-1", action: "finance:approve", granted: true, recordedAt: new Date() });

    const records = await repository.listByIdentity("identity-1");
    expect(records.map((r) => r.granted)).toEqual([false, true]);
    handle.close();
  });
});
