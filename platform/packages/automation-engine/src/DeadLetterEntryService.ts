import type { DeadLetterEntry } from './DeadLetterEntry';
import type { DeadLetterEntryRepository } from './DeadLetterEntryRepository';

/** DeadLetterEntryService — nenhum precedente legado equivalente foi encontrado. Toda execução falha de forma definitiva é preservada aqui, nunca descartada silenciosamente (ADR-011). Nenhuma emissão de Evento/Audit aqui. */
export class DeadLetterEntryService {
  constructor(private readonly repository: DeadLetterEntryRepository) {}

  async receive(executionStepId: string, failureDescription: string): Promise<DeadLetterEntry> {
    const entry: DeadLetterEntry = { deadLetterEntryId: crypto.randomUUID(), executionStepId, failureDescription, receivedAt: new Date() };
    return this.repository.create(entry);
  }

  async list(): Promise<readonly DeadLetterEntry[]> {
    return this.repository.list();
  }
}
