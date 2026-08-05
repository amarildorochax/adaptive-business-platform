import type { ContentTag } from './ContentTag';
import type { ContentTagRepository } from './ContentTagRepository';

/** Campos aceitos por `ContentTagService.create()`. */
export type CreateContentTagInput = Pick<ContentTag, 'tenantId' | 'label'>;

/**
 * ContentTagService — administra a marcação granular de conteúdo (ContentTag), deliberadamente
 * distinta de `Tag` do CRM Hub (ADR-CH-005). Inexistente em `src/core` ou `src/app` (IMP-004,
 * Etapa 1); construído diretamente sobre o contrato já descrito.
 */
export class ContentTagService {
  constructor(private readonly repository: ContentTagRepository) {}

  async create(input: CreateContentTagInput): Promise<ContentTag> {
    const tag: ContentTag = {
      contentTagId: crypto.randomUUID(),
      status: 'Active',
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(tag);
  }

  async get(contentTagId: string): Promise<ContentTag | undefined> {
    return this.repository.get(contentTagId);
  }

  async list(tenantId: string): Promise<readonly ContentTag[]> {
    return this.repository.list(tenantId);
  }
}
