import type { MemoryEntry } from './MemoryEntry';
import type { MemoryOwnership } from './MemoryOwnership';

/** Contrato de persistência de Memory Entry — apenas o contrato, per Etapa "Repository Interfaces". */
export interface MemoryEntryRepository {
  create(entry: MemoryEntry): Promise<MemoryEntry>;
  get(memoryId: string): Promise<MemoryEntry | undefined>;
  listByOwnership(tenantId: string, ownership: MemoryOwnership): Promise<MemoryEntry[]>;
  listByTags(tenantId: string, tags: readonly string[]): Promise<MemoryEntry[]>;
}
