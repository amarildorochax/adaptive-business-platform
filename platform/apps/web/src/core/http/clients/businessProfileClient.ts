import { apiClient } from "../client.js";
import type { BusinessProfileResponseDto, ClassificationResponseDto, CreateBusinessProfileRequestDto, LifecycleStateResponseDto, MaturityResponseDto, StageResponseDto } from "../dtos/businessProfile.dto.js";
import { undefinedOn404 } from "../undefinedOn404.js";

/** Cliente HTTP de Business Profile — espelha `apps/api/src/routes/businessProfile.ts` (FUN-004), rota a rota. */
export const businessProfileClient = {
  create(payload: CreateBusinessProfileRequestDto): Promise<BusinessProfileResponseDto> {
    return apiClient.post("/business-profiles", payload);
  },

  findByTenant(tenantId: string): Promise<BusinessProfileResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/business-profiles/by-tenant/${encodeURIComponent(tenantId)}`));
  },

  validate(profileId: string): Promise<LifecycleStateResponseDto> {
    return apiClient.post(`/business-profiles/${encodeURIComponent(profileId)}/validate`);
  },

  finalize(profileId: string): Promise<LifecycleStateResponseDto> {
    return apiClient.post(`/business-profiles/${encodeURIComponent(profileId)}/finalize`);
  },

  currentClassification(profileId: string): Promise<ClassificationResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/business-profiles/${encodeURIComponent(profileId)}/classification`));
  },

  currentMaturity(profileId: string): Promise<MaturityResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/business-profiles/${encodeURIComponent(profileId)}/maturity`));
  },

  currentStage(profileId: string): Promise<StageResponseDto | undefined> {
    return undefinedOn404(() => apiClient.get(`/business-profiles/${encodeURIComponent(profileId)}/stage`));
  },
};
