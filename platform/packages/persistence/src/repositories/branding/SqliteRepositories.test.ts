import { describe, expect, it } from "vitest";
import { createTestDatabase } from "../../testing/createTestDatabase.js";
import { SqliteBrandThemeRepository } from "./SqliteBrandThemeRepository.js";
import { SqliteDesignTokenRepository } from "./SqliteDesignTokenRepository.js";
import { SqliteLogoRepository } from "./SqliteLogoRepository.js";

describe("SqliteLogoRepository", () => {
  it("o Logo vigente é sempre o último em ordem de inserção", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteLogoRepository(handle.db);

    await repository.create({ logoId: "logo-1", tenantId: "tenant-1", assetReference: "assets/logo-v1.svg", uploadedAt: new Date() });
    await repository.create({ logoId: "logo-2", tenantId: "tenant-1", assetReference: "assets/logo-v2.svg", uploadedAt: new Date() });

    const logos = await repository.listByTenant("tenant-1");
    expect(logos.at(-1)?.assetReference).toBe("assets/logo-v2.svg");
    handle.close();
  });
});

describe("SqliteDesignTokenRepository", () => {
  it("persiste e recupera Tokens por themeId, incluindo a categoria fechada", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteDesignTokenRepository(handle.db);

    await repository.create({ tokenId: "token-1", tenantId: "tenant-1", themeId: "theme-1", category: "Cor", name: "cor-destaque-primaria", value: "#2E7D32" });
    await repository.create({ tokenId: "token-2", tenantId: "tenant-1", themeId: "theme-1", category: "Tipografia", name: "fonte-titulo", value: "Poppins" });

    const tokens = await repository.listByThemeId("theme-1");
    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.category).toBe("Cor");
    handle.close();
  });
});

describe("SqliteBrandThemeRepository", () => {
  it("cada versão de Theme é um fato imutável — regeneração nunca sobrescreve a versão anterior (ADR-012)", async () => {
    const handle = createTestDatabase();
    const repository = new SqliteBrandThemeRepository(handle.db);

    await repository.create({ themeId: "theme-1", tenantId: "tenant-1", version: 1, generatedAt: new Date() });
    await repository.create({ themeId: "theme-2", tenantId: "tenant-1", version: 2, generatedAt: new Date() });

    const themes = await repository.listByTenant("tenant-1");
    expect(themes.map((t) => t.version)).toEqual([1, 2]);
    handle.close();
  });
});
