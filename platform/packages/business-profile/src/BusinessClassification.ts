/**
 * Business Classification — "Categorização geral de perfil de negócio" (`DOMAIN_OWNERSHIP_MATRIX.md`,
 * quarto conceito de propriedade do Business Profile Engine, ao lado de Business Profile, Segment e
 * Maturity). Modelada como o par Segmento + Subsegmento já descrito em `BUSINESS_PROFILE_ENGINE.md`,
 * Capítulo 8: "Subsegmento refina essa categoria com uma especialização mais precisa" — nenhum campo
 * além destes dois é atribuído a este conceito pelo Blueprint.
 */
import type { Segment } from "./Segment.js";

export interface BusinessClassification {
  readonly segment: Segment;

  /** Especialização mais precisa dentro do Segmento, quando já conhecida. */
  readonly subsegment?: string;
}
