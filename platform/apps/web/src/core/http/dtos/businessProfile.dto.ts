/**
 * DTOs do contrato HTTP de Business Profile — espelham exatamente `apps/api/src/dtos/businessProfile.dto.ts`
 * (FUN-004). Cópia deliberada, não um import cruzado entre apps (nenhum precedente disso existe no
 * monorepo) nem uma dependência de `@abp/business-profile` (o Frontend não conhece mais Entities de
 * domínio, apenas o contrato HTTP — ver relatório desta Sprint, Seção "DTOs").
 */

export interface CreateBusinessProfileRequestDto {
  readonly tenantId: string;
  readonly segment: string;
  readonly subsegment?: string;
  readonly maturity: string;
}

export interface BusinessProfileResponseDto {
  readonly profileId: string;
  readonly tenantId: string;
  readonly createdAt: string;
}

export interface LifecycleStateResponseDto {
  readonly profileId: string;
  readonly stage: string;
  readonly enteredAt: string;
}

export interface ClassificationResponseDto {
  readonly segment: string;
  readonly subsegment?: string;
}

export interface MaturityResponseDto {
  readonly maturity: string;
}

export interface StageResponseDto {
  readonly stage: string;
}
