import type { Page } from './Page';

/** PageRepository — contrato de persistência de Page. Interface apenas, per IMP-004, Etapa 7. */
export interface PageRepository {
  create(page: Page): Promise<Page>;
  update(page: Page): Promise<Page>;
  get(pageId: string): Promise<Page | undefined>;
  list(tenantId: string): Promise<readonly Page[]>;
}
