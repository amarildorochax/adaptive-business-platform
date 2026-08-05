/**
 * Business Classification Record — versão preservável da `BusinessClassification` de um Business
 * Profile, produzida pelo Business Classifier a partir do Segment Engine. ADR-009 (Profile
 * Versioning): "Nenhuma atualização de perfil sobrescreve o estado anterior sem preservar a versão
 * prévia." ADR-006 (Composable Profile): Classificação evolui de forma independente da Maturidade —
 * nunca a mesma versão, nunca o mesmo registro.
 * Estrutura definida em `BUSINESS_PROFILE_ENGINE.md`, Capítulos 7 (Business Classifier, Segment
 * Engine, Profile Versioning) e 8.
 */
import type { BusinessClassification } from "./BusinessClassification.js";

export interface BusinessClassificationRecord {
  /** Business Profile ao qual esta versão de classificação pertence. */
  readonly profileId: string;

  /** Classificação (Segmento/Subsegmento) vigente nesta versão. */
  readonly classification: BusinessClassification;

  /** Número da versão. */
  readonly version: number;

  /** Momento em que esta versão foi registrada. */
  readonly recordedAt: Date;
}
