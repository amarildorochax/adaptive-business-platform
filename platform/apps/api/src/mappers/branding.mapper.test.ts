import { describe, expect, it } from "vitest";
import { toBrandThemeResponseDto, toBusinessContextResponseDto, toDesignTokenResponseDto, toLogoResponseDto } from "./branding.mapper.js";

describe("mapeamentos de Branding — Entity → DTO", () => {
  it("toLogoResponseDto e toBrandThemeResponseDto serializam Date como ISO 8601", () => {
    expect(toLogoResponseDto({ logoId: "logo-1", tenantId: "tenant-1", assetReference: "assets/logo.svg", uploadedAt: new Date("2026-07-01T00:00:00.000Z") }).uploadedAt).toBe(
      "2026-07-01T00:00:00.000Z",
    );
    expect(toBrandThemeResponseDto({ themeId: "theme-1", tenantId: "tenant-1", version: 1, generatedAt: new Date("2026-07-01T00:00:00.000Z") }).generatedAt).toBe("2026-07-01T00:00:00.000Z");
  });

  it("toDesignTokenResponseDto mapeia campo a campo", () => {
    expect(toDesignTokenResponseDto({ tokenId: "token-1", tenantId: "tenant-1", themeId: "theme-1", category: "Cor", name: "cor-destaque-primaria", value: "#2E7D32" })).toEqual({
      tokenId: "token-1",
      tenantId: "tenant-1",
      themeId: "theme-1",
      category: "Cor",
      name: "cor-destaque-primaria",
      value: "#2E7D32",
    });
  });

  it("toBusinessContextResponseDto propaga undefined quando classification/maturity ainda não existem", () => {
    expect(toBusinessContextResponseDto({ classification: undefined, maturity: undefined })).toEqual({ segment: undefined, subsegment: undefined, maturity: undefined });
    expect(toBusinessContextResponseDto({ classification: { segment: "Floricultura" }, maturity: "elevada" })).toEqual({ segment: "Floricultura", subsegment: undefined, maturity: "elevada" });
  });
});
