/**
 * ContentTag — marcação granular de conteúdo, proprietária do CMS Engine. Nome deliberadamente
 * distinto de `Tag` (já proprietário do CRM Hub, per `DOMAIN_OWNERSHIP_MATRIX.md`) — nunca
 * renomear para `Tag` dentro deste pacote, per `CONTENT_HUB_ARCHITECTURE.md`, ADR-CH-005.
 * Estrutura definida em `CONTENT_HUB_ARCHITECTURE.md`, Capítulo 22.
 */
export type ContentTagStatus = 'Active' | 'Archived';

export interface ContentTag {
  /** Identificador da ContentTag. */
  readonly contentTagId: string;

  /** Tenant ao qual a ContentTag pertence. */
  readonly tenantId: string;

  /** Rótulo da ContentTag. */
  readonly label: string;

  /** Estado atual. */
  readonly status: ContentTagStatus;

  /** Momento de criação. */
  readonly createdAt: Date;
}
