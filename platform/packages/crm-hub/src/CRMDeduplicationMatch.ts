/**
 * CRM Deduplication Match — o registro de correspondência provável identificada pelo Deduplication
 * Engine entre um novo Lead ou Customer e um registro já existente, sinalizado para revisão humana,
 * nunca mesclado automaticamente (Deduplication as a First-Class Concern, `CRM_HUB.md` Capítulo 5).
 * Estrutura definida em `CRM_HUB.md`, Capítulo 7; `CRM_DOMAIN_BLUEPRINT.md`, Capítulo 12 e ADR-012.
 */
export type CRMDeduplicationMatchBasis = "Email" | "Phone";

export interface CRMDeduplicationMatch {
  /** Registro candidato identificado como possível duplicata. */
  readonly candidateRelationshipId: string;

  /** Registro já existente com o qual o candidato corresponde. */
  readonly matchedRelationshipId: string;

  /** Critério de correspondência usado. */
  readonly matchedBy: CRMDeduplicationMatchBasis;

  /** Se a correspondência já foi confirmada por revisão humana. */
  readonly confirmed: boolean;

  /** Momento em que a correspondência foi identificada. */
  readonly identifiedAt: Date;
}
