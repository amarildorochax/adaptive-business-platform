/**
 * Logo — "o insumo de origem de toda a identidade, mantido pelo Logo Manager"
 * (`BRANDING_HUB.md`, Capítulo 8). Restrito à referência opaca do ativo enviado — nenhuma geração,
 * edição, ou processamento de imagem acontece nesta Sprint ("geração automática de logos... edição
 * gráfica" explicitamente fora de escopo); variações (clara, escura, ícone isolado, horizontal,
 * vertical, Capítulo 7) permanecem tecnologia de processamento de imagem não decidida por este Core.
 */
export interface Logo {
  /** Identificador do Logo. */
  readonly logoId: string;

  /** Tenant ao qual este Logo pertence. */
  readonly tenantId: string;

  /** Referência opaca ao ativo enviado — nunca o binário da imagem em si. */
  readonly assetReference: string;

  /** Momento do envio. */
  readonly uploadedAt: Date;
}
