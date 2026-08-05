import type { CorrelationId } from "./CorrelationId.js";
import type { LogLevel, LogRecord } from "./LogRecord.js";
import type { LogRecordRepository } from "./LogRecordRepository.js";

/**
 * Log Service — "Logs registram toda execução de Command, de Query e de consumo de Evento"
 * (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9; NFR-033).
 */
export class LogService {
  constructor(private readonly repository: LogRecordRepository) {}

  async record(module: string, level: LogLevel, message: string, correlationId: CorrelationId): Promise<LogRecord> {
    const record: LogRecord = { correlationId, module, level, message, recordedAt: new Date() };
    return this.repository.create(record);
  }

  async listByCorrelationId(correlationId: CorrelationId): Promise<readonly LogRecord[]> {
    return this.repository.listByCorrelationId(correlationId);
  }
}
