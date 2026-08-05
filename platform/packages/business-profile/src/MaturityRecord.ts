/**
 * Maturity Record — versão preservável da Maturidade Digital de um Business Profile, produzida pelo
 * Business Maturity Engine. ADR-006 (Composable Profile): "Uma mudança em Objetivos não exige
 * recalcular Segmento, Maturidade ou Capacidades do zero" — a Maturidade é, simetricamente, versionada
 * de forma independente da Classificação, nunca no mesmo registro.
 * Estrutura definida em `BUSINESS_PROFILE_ENGINE.md`, Capítulos 7 (Business Maturity Engine, Profile
 * Versioning) e 8.
 */
import type { Maturity } from "./Maturity.js";

export interface MaturityRecord {
  /** Business Profile ao qual esta versão de maturidade pertence. */
  readonly profileId: string;

  /** Maturidade Digital vigente nesta versão. */
  readonly maturity: Maturity;

  /** Número da versão. */
  readonly version: number;

  /** Momento em que esta versão foi registrada. */
  readonly recordedAt: Date;
}
