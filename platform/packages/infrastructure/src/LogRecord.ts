/**
 * Log Record — registro estruturado da execução de um Command, de uma Query ou do consumo de um
 * Evento, "com formato estruturado e consistente entre todos os módulos da plataforma"
 * (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9; NFR-033). Sempre correlacionável (NFR-034) — nunca
 * criado sem um Correlation ID, mesma regra já aplicada a `Metric`.
 * Estrutura ausente de `OBSERVABILITY_CONCRETE_STRUCTURE.md` — gap coberto nesta Sprint (IMP-012),
 * ver "Lacunas Arquiteturais" em `OBSERVABILITY_PLATFORM_CORE_MIGRATION_REPORT.md`.
 */
import type { CorrelationId } from "./CorrelationId.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogRecord {
  readonly correlationId: CorrelationId;
  readonly module: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly recordedAt: Date;
}
