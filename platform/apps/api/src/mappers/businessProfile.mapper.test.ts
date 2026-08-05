import { describe, expect, it } from "vitest";
import { toBusinessProfileResponseDto, toClassificationResponseDto, toLifecycleStateResponseDto, toMaturityResponseDto, toStageResponseDto } from "./businessProfile.mapper.js";

describe("mapeamentos de Business Profile — Entity → DTO", () => {
  it("toBusinessProfileResponseDto serializa createdAt como ISO 8601, nunca expõe a instância Date", () => {
    const dto = toBusinessProfileResponseDto({ profileId: "profile-1", tenantId: "tenant-1", createdAt: new Date("2026-07-01T10:00:00.000Z") });
    expect(dto.createdAt).toBe("2026-07-01T10:00:00.000Z");
    expect(typeof dto.createdAt).toBe("string");
  });

  it("toClassificationResponseDto preserva subsegment ausente como undefined", () => {
    expect(toClassificationResponseDto({ segment: "Floricultura" }).subsegment).toBeUndefined();
    expect(toClassificationResponseDto({ segment: "Clínica", subsegment: "Odontológica" }).subsegment).toBe("Odontológica");
  });

  it("toLifecycleStateResponseDto e toMaturityResponseDto/toStageResponseDto mapeiam campo a campo", () => {
    expect(toLifecycleStateResponseDto({ profileId: "profile-1", stage: "Validação", enteredAt: new Date("2026-07-01T10:00:00.000Z") })).toEqual({
      profileId: "profile-1",
      stage: "Validação",
      enteredAt: "2026-07-01T10:00:00.000Z",
    });
    expect(toMaturityResponseDto("elevada")).toEqual({ maturity: "elevada" });
    expect(toStageResponseDto("Perfil Inicial")).toEqual({ stage: "Perfil Inicial" });
  });
});
