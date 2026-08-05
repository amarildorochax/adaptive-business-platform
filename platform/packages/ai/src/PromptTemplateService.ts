import type { PromptTemplate } from './PromptTemplate';
import type { PromptTemplateRepository } from './PromptTemplateRepository';
import type { PromptVersion } from './PromptVersion';
import type { PromptVersionRepository } from './PromptVersionRepository';

/**
 * Prompt Template Service — adaptado de `src/core/prompt/{PromptRegistry.ts, PromptManager.ts}`
 * (Prompt Manager legado, real e funcional): CRUD e versionamento de Prompt Template, com a mesma
 * disciplina de "toda mudança em um template é revisada, testada e implantada como uma mudança de
 * sistema" (`AI_HUB.md`, Capítulo 9, ADR-010) — cada `update` produz uma nova `PromptVersion`,
 * nunca sobrescreve silenciosamente o histórico.
 */
export class PromptTemplateService {
  constructor(
    private readonly templates: PromptTemplateRepository,
    private readonly versions: PromptVersionRepository,
  ) {}

  async create(tenantId: string, name: string, content: string): Promise<PromptTemplate> {
    const now = new Date();
    const template: PromptTemplate = {
      promptTemplateId: crypto.randomUUID(),
      tenantId,
      name,
      content,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    await this.templates.create(template);
    await this.versions.create({ promptTemplateId: template.promptTemplateId, version: 1, content, recordedAt: now });

    return template;
  }

  async update(promptTemplateId: string, content: string): Promise<PromptTemplate> {
    const existing = await this.templates.get(promptTemplateId);

    if (!existing) {
      throw new Error(`Prompt Template ${promptTemplateId} não encontrado.`);
    }

    const previousVersions = await this.versions.list(promptTemplateId);
    const current = previousVersions.find((v) => v.supersededAt === undefined);

    if (current) {
      await this.versions.update({ ...current, supersededAt: new Date() });
    }

    const nextVersion = existing.version + 1;
    const updated = await this.templates.update({ ...existing, content, version: nextVersion, updatedAt: new Date() });
    await this.versions.create({ promptTemplateId, version: nextVersion, content, recordedAt: new Date() });

    return updated;
  }

  async get(promptTemplateId: string): Promise<PromptTemplate | undefined> {
    return this.templates.get(promptTemplateId);
  }

  async list(tenantId: string): Promise<readonly PromptTemplate[]> {
    return this.templates.list(tenantId);
  }

  async listVersions(promptTemplateId: string): Promise<readonly PromptVersion[]> {
    return this.versions.list(promptTemplateId);
  }
}
