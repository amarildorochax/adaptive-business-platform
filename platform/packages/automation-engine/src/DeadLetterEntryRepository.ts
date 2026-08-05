import type { DeadLetterEntry } from './DeadLetterEntry';

/** Contrato de persistência de Dead Letter Entry — apenas o contrato. Sem `update`/`remove` — preservado para investigação manual, nunca descartado silenciosamente (ADR-011). */
export interface DeadLetterEntryRepository {
  create(entry: DeadLetterEntry): Promise<DeadLetterEntry>;
  list(): Promise<DeadLetterEntry[]>;
}
