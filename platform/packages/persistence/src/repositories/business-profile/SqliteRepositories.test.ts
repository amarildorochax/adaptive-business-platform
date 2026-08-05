import { describe, expect, it } from "vitest";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteBusinessClassificationRecordRepository } from "./SqliteBusinessClassificationRecordRepository.js";
import { SqliteBusinessProfileLifecycleStateRepository } from "./SqliteBusinessProfileLifecycleStateRepository.js";
import { SqliteBusinessProfileRepository } from "./SqliteBusinessProfileRepository.js";
import { SqliteMaturityRecordRepository } from "./SqliteMaturityRecordRepository.js";

describe("SqliteBusinessProfileRepository", () => {
  it("persiste e recupera um Business Profile por tenantId, sobrevivendo a uma nova consulta", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteBusinessProfileRepository(handle.db);

    const created = await repository.create({ profileId: "profile-1", tenantId: "tenant-1", createdAt: new Date("2026-07-01T10:00:00Z") });
    const found = await repository.findByTenantId("tenant-1");

    expect(found).toEqual(created);
    expect(found?.createdAt).toBeInstanceOf(Date);
    handle.close();
  });

  it("findByTenantId retorna undefined para um Tenant nunca cadastrado", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteBusinessProfileRepository(handle.db);

    expect(await repository.findByTenantId("tenant-inexistente")).toBeUndefined();
    handle.close();
  });
});

describe("SqliteBusinessClassificationRecordRepository", () => {
  it("preserva subsegment ausente como undefined, nunca como string vazia ou null visível à Entity", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteBusinessClassificationRecordRepository(handle.db);

    await repository.create({ profileId: "profile-1", classification: { segment: "Floricultura" }, version: 1, recordedAt: new Date() });
    const [record] = await repository.listByProfileId("profile-1");

    expect(record?.classification.subsegment).toBeUndefined();
    handle.close();
  });

  it("listByProfileId preserva a ordem de inserção — o mais recente é sempre o último (ADR-009)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteBusinessClassificationRecordRepository(handle.db);

    await repository.create({ profileId: "profile-1", classification: { segment: "Floricultura" }, version: 1, recordedAt: new Date() });
    await repository.create({ profileId: "profile-1", classification: { segment: "Pet Shop", subsegment: "Banho e tosa" }, version: 2, recordedAt: new Date() });

    const records = await repository.listByProfileId("profile-1");
    expect(records.map((r) => r.version)).toEqual([1, 2]);
    expect(records.at(-1)?.classification.segment).toBe("Pet Shop");
    handle.close();
  });
});

describe("SqliteMaturityRecordRepository", () => {
  it("versiona a maturidade de forma independente da classificação (ADR-006, Composable Profile)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteMaturityRecordRepository(handle.db);

    await repository.create({ profileId: "profile-1", maturity: "baixa", version: 1, recordedAt: new Date() });
    await repository.create({ profileId: "profile-1", maturity: "elevada", version: 2, recordedAt: new Date() });

    const records = await repository.listByProfileId("profile-1");
    expect(records.at(-1)?.maturity).toBe("elevada");
    handle.close();
  });
});

describe("SqliteBusinessProfileLifecycleStateRepository", () => {
  it("registra cada transição de estágio como um fato imutável, em ordem de inserção", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteBusinessProfileLifecycleStateRepository(handle.db);

    await repository.create({ profileId: "profile-1", stage: "Cadastro", enteredAt: new Date() });
    await repository.create({ profileId: "profile-1", stage: "Perguntas Iniciais", enteredAt: new Date() });
    await repository.create({ profileId: "profile-1", stage: "Classificação", enteredAt: new Date() });

    const states = await repository.listByProfileId("profile-1");
    expect(states.map((s) => s.stage)).toEqual(["Cadastro", "Perguntas Iniciais", "Classificação"]);
    handle.close();
  });
});
