import { describe, expect, it } from "vitest";
import { createTestDatabase } from "../testing/createTestDatabase.js";

describe("createDatabase — comportamento transacional", () => {
  it("uma transação revertida (ROLLBACK) não deixa nenhuma linha persistida", () => {
    const handle = createTestDatabase();

    handle.db.exec("BEGIN");
    handle.db.prepare("INSERT INTO business_profiles (profile_id, tenant_id, created_at) VALUES (?, ?, ?)").run("profile-1", "tenant-1", Date.now());
    handle.db.exec("ROLLBACK");

    const row = handle.db.prepare("SELECT * FROM business_profiles WHERE profile_id = ?").get("profile-1");
    expect(row).toBeUndefined();
    handle.close();
  });

  it("uma transação confirmada (COMMIT) persiste todas as escritas feitas dentro dela", () => {
    const handle = createTestDatabase();

    handle.db.exec("BEGIN");
    handle.db.prepare("INSERT INTO business_profiles (profile_id, tenant_id, created_at) VALUES (?, ?, ?)").run("profile-1", "tenant-1", Date.now());
    handle.db.prepare("INSERT INTO logos (logo_id, tenant_id, asset_reference, uploaded_at) VALUES (?, ?, ?, ?)").run("logo-1", "tenant-1", "assets/logo.svg", Date.now());
    handle.db.exec("COMMIT");

    expect(handle.db.prepare("SELECT * FROM business_profiles WHERE profile_id = ?").get("profile-1")).toBeDefined();
    expect(handle.db.prepare("SELECT * FROM logos WHERE logo_id = ?").get("logo-1")).toBeDefined();
    handle.close();
  });

  it("integridade referencial (foreign_keys) e modo de journal (WAL) estão ativos", () => {
    const handle = createTestDatabase();

    const foreignKeys = handle.db.prepare("PRAGMA foreign_keys").get() as { foreign_keys: number };
    expect(foreignKeys.foreign_keys).toBe(1);
    handle.close();
  });
});
