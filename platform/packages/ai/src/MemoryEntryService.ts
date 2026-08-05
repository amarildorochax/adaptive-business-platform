import type { MemoryEntry } from './MemoryEntry';
import type { MemoryEntryRepository } from './MemoryEntryRepository';
import type { MemoryOwnership } from './MemoryOwnership';
import type { MemoryType } from './MemoryType';

/** Campos aceitos por `MemoryEntryService.remember()`. */
export type RememberInput = Pick<MemoryEntry, 'tenantId' | 'type' | 'scope' | 'ownership' | 'title' | 'content' | 'tags'>;

/**
 * Memory Entry Service — adaptado de `src/core/memory/MemoryManager.ts` (Business Memory legado,
 * real e funcional): CRUD e busca por titularidade/tags de `MemoryEntry`, sempre segregado por
 * `tenantId` (isolamento absoluto entre Empresas, `AI_HUB.md`, ADR-008). Nenhum módulo de negócio
 * acessa este compartimento diretamente — toda consulta e toda escrita passam por este Service (mesmo
 * princípio já descrito para o Memory Manager, `AI_HUB.md`, Capítulo 11).
 *
 * As "seis combinações" completas de titularidade × duração, com política própria de retenção e
 * expiração por compartimento, são "médio prazo" per o Roadmap do próprio Blueprint (Capítulo 25) —
 * este Service cobre a leitura/escrita básica; `MemoryRetention`/`MemoryPolicy` (já contratados desde
 * a IMP-001) permanecem não aplicados nesta Sprint.
 */
export class MemoryEntryService {
  constructor(private readonly repository: MemoryEntryRepository) {}

  async remember(input: RememberInput): Promise<MemoryEntry> {
    const entry: MemoryEntry = { memoryId: crypto.randomUUID(), createdAt: new Date(), ...input };
    return this.repository.create(entry);
  }

  async get(memoryId: string): Promise<MemoryEntry | undefined> {
    return this.repository.get(memoryId);
  }

  async recallByOwnership(tenantId: string, ownership: MemoryOwnership): Promise<readonly MemoryEntry[]> {
    return this.repository.listByOwnership(tenantId, ownership);
  }

  async recallByTags(tenantId: string, tags: readonly string[]): Promise<readonly MemoryEntry[]> {
    return this.repository.listByTags(tenantId, tags);
  }

  /** Filtra, dentre um conjunto já recuperado, apenas as entradas de um Tipo específico — nunca uma nova consulta ao Repository. */
  filterByType(entries: readonly MemoryEntry[], type: MemoryType): readonly MemoryEntry[] {
    return entries.filter((entry) => entry.type === type);
  }
}
