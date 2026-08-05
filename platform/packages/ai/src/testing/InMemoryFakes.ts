import type { KnowledgeAsset } from '@abp/platform-services';
import type { KnowledgeAssetQuery } from '../KnowledgeConnectorService';
import type { MemoryEntry } from '../MemoryEntry';
import type { MemoryEntryRepository } from '../MemoryEntryRepository';
import type { MemoryOwnership } from '../MemoryOwnership';
import type { PromptExecution } from '../PromptExecution';
import type { PromptExecutionRepository } from '../PromptExecutionRepository';
import type { PromptTemplate } from '../PromptTemplate';
import type { PromptTemplateRepository } from '../PromptTemplateRepository';
import type { PromptVersion } from '../PromptVersion';
import type { PromptVersionRepository } from '../PromptVersionRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-010, Etapa de Testes). Mesmo padrão já usado
 * pelos oito domínios anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakePromptTemplateRepository implements PromptTemplateRepository {
  private readonly rows = new Map<string, PromptTemplate>();
  async create(template: PromptTemplate) {
    this.rows.set(template.promptTemplateId, template);
    return template;
  }
  async update(template: PromptTemplate) {
    this.rows.set(template.promptTemplateId, template);
    return template;
  }
  async get(promptTemplateId: string) {
    return this.rows.get(promptTemplateId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((t) => t.tenantId === tenantId);
  }
}

export class FakePromptVersionRepository implements PromptVersionRepository {
  private readonly rows: PromptVersion[] = [];
  async create(version: PromptVersion) {
    this.rows.push(version);
    return version;
  }
  async update(version: PromptVersion) {
    const index = this.rows.findIndex((v) => v.promptTemplateId === version.promptTemplateId && v.version === version.version);
    if (index >= 0) this.rows[index] = version;
    return version;
  }
  async list(promptTemplateId: string) {
    return this.rows.filter((v) => v.promptTemplateId === promptTemplateId);
  }
}

export class FakePromptExecutionRepository implements PromptExecutionRepository {
  private readonly rows: PromptExecution[] = [];
  async create(execution: PromptExecution) {
    this.rows.push(execution);
    return execution;
  }
  async list(tenantId: string) {
    return this.rows.filter((e) => e.tenantId === tenantId);
  }
}

export class FakeMemoryEntryRepository implements MemoryEntryRepository {
  private readonly rows = new Map<string, MemoryEntry>();
  async create(entry: MemoryEntry) {
    this.rows.set(entry.memoryId, entry);
    return entry;
  }
  async get(memoryId: string) {
    return this.rows.get(memoryId);
  }
  async listByOwnership(tenantId: string, ownership: MemoryOwnership) {
    return [...this.rows.values()].filter((e) => e.tenantId === tenantId && e.ownership === ownership);
  }
  async listByTags(tenantId: string, tags: readonly string[]) {
    return [...this.rows.values()].filter((e) => e.tenantId === tenantId && (e.tags ?? []).some((tag) => tags.includes(tag)));
  }
}

export class FakeKnowledgeAssetQuery implements KnowledgeAssetQuery {
  private readonly rows: KnowledgeAsset[] = [];
  seed(...assets: KnowledgeAsset[]): void {
    this.rows.push(...assets);
  }
  async listByTenant(tenantId: string) {
    return this.rows.filter((a) => a.tenantId === tenantId);
  }
}
