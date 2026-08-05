/**
 * DTOs da camada HTTP para Business Profile — nunca a Entity `BusinessProfile`/`BusinessClassification`/
 * `MaturityRecord`/`BusinessProfileLifecycleState` de `@abp/business-profile` usada diretamente como
 * payload. `Date` vira `string` (ISO 8601) em toda saída — JSON não tem tipo Date nativo.
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
