import type { BusinessClassification, BusinessProfile, BusinessProfileLifecycleStage, BusinessProfileLifecycleState, Maturity } from "@abp/business-profile";
import type { BusinessProfileResponseDto, ClassificationResponseDto, LifecycleStateResponseDto, MaturityResponseDto, StageResponseDto } from "../dtos/businessProfile.dto.js";

export function toBusinessProfileResponseDto(profile: BusinessProfile): BusinessProfileResponseDto {
  return { profileId: profile.profileId, tenantId: profile.tenantId, createdAt: profile.createdAt.toISOString() };
}

export function toLifecycleStateResponseDto(state: BusinessProfileLifecycleState): LifecycleStateResponseDto {
  return { profileId: state.profileId, stage: state.stage, enteredAt: state.enteredAt.toISOString() };
}

export function toClassificationResponseDto(classification: BusinessClassification): ClassificationResponseDto {
  return { segment: classification.segment, subsegment: classification.subsegment };
}

export function toMaturityResponseDto(maturity: Maturity): MaturityResponseDto {
  return { maturity };
}

export function toStageResponseDto(stage: BusinessProfileLifecycleStage): StageResponseDto {
  return { stage };
}
