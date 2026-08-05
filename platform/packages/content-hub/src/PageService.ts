import type { Page, PageStatus } from './Page';
import type { PageRepository } from './PageRepository';

/** Campos aceitos por `PageService.create()`. */
export type CreatePageInput = Pick<Page, 'tenantId' | 'title' | 'body'>;

/**
 * PageService — administra a Page institucional genérica, proprietária do CMS Engine. Nenhum
 * Evento de domínio próprio existe para Page no catálogo já aprovado (`ContentEvent.ts`) — ver
 * CONTENT_CORE_MIGRATION_REPORT.md. Inexistente em `src/core` ou `src/app` (IMP-004, Etapa 1);
 * construído diretamente sobre o contrato já descrito.
 */
export class PageService {
  constructor(private readonly repository: PageRepository) {}

  async create(input: CreatePageInput): Promise<Page> {
    const page: Page = {
      pageId: crypto.randomUUID(),
      status: 'Draft',
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(page);
  }

  async transitionTo(pageId: string, status: PageStatus): Promise<Page> {
    const existing = await this.repository.get(pageId);

    if (!existing) {
      throw new Error(`Page ${pageId} não encontrada.`);
    }

    return this.repository.update({ ...existing, status });
  }

  async get(pageId: string): Promise<Page | undefined> {
    return this.repository.get(pageId);
  }

  async list(tenantId: string): Promise<readonly Page[]> {
    return this.repository.list(tenantId);
  }
}
