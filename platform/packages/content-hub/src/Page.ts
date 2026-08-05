/**
 * Page — página institucional genérica, não focada em conversão, proprietária do CMS Engine.
 * Distinta de `LandingPage` (Landing Page Builder), fora do escopo desta Sprint (IMP-004, Content
 * Core) — ver CONTENT_CORE_MIGRATION_REPORT.md.
 * Estrutura definida em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22.
 */
export type PageStatus = 'Draft' | 'Published' | 'Archived';

export interface Page {
  /** Identificador da Page. */
  readonly pageId: string;

  /** Tenant ao qual a Page pertence. */
  readonly tenantId: string;

  /** Título da Page. */
  readonly title: string;

  /** Conteúdo textual da Page. */
  readonly body: string;

  /** Estado atual. */
  readonly status: PageStatus;

  /** Momento de criação. */
  readonly createdAt: Date;
}
