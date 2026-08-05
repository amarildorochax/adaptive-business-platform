import type { KnowledgeAsset } from '@abp/platform-services';

/**
 * Contrato mínimo de consulta a Knowledge Asset — deliberadamente não um Repository completo: o
 * Knowledge Connector nunca escreve, nunca é dono do armazenamento (`AI_HUB.md`, Capítulo 12, "O AI
 * Hub não duplica essa responsabilidade... ele não armazena conhecimento"). Implementado por quem
 * de fato possui `KnowledgeAsset` — nunca por este pacote.
 */
export interface KnowledgeAssetQuery {
  listByTenant(tenantId: string): Promise<readonly KnowledgeAsset[]>;
}

/**
 * Knowledge Connector Service — a ponte entre o AI Hub e o Knowledge Hub (`AI_HUB.md`, Capítulo 7,
 * "Knowledge Connector... não armazena conhecimento — armazenamento e organização de conhecimento
 * pertencem ao Knowledge Hub"). Adaptado, na intenção — nunca no armazenamento — de
 * `src/core/knowledge/KnowledgeProvider.ts` (legado, real e funcional): aquele consultava seu
 * próprio `KnowledgeBase` interno (violação da fronteira já aprovada); este Service consulta
 * exclusivamente `KnowledgeAsset`, já contratado e possuído por `@abp/platform-services`, nunca uma
 * cópia própria.
 *
 * Consumido antes da composição do prompt, nunca depois da resposta (Capítulo 12) — o resultado é
 * entregue como mais uma camada de contexto disponível ao Prompt Composer, nunca interpretado por
 * este Service.
 */
export class KnowledgeConnectorService {
  constructor(private readonly assets: KnowledgeAssetQuery) {}

  async consult(tenantId: string, tags?: readonly string[]): Promise<readonly KnowledgeAsset[]> {
    const assets = await this.assets.listByTenant(tenantId);

    if (!tags || tags.length === 0) {
      return assets;
    }

    return assets.filter((asset) => asset.tags.some((tag) => tags.includes(tag)));
  }
}
