import type { CorrelationId } from "./CorrelationId.js";
import type { LogRecord } from "./LogRecord.js";

/** Log Record Repository — Log é sempre um fato imutável; nunca `update` nem `remove`. */
export interface LogRecordRepository {
  create(record: LogRecord): Promise<LogRecord>;
  listByCorrelationId(correlationId: CorrelationId): Promise<readonly LogRecord[]>;
}
