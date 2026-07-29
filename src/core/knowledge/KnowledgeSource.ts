/**
 * Contrato de fonte externa de conhecimento futura (não implementado
 * nesta Sprint; nenhuma integração externa criada). Mesmo papel que
 * `AgentDiscoverySource` (`@/core/catalog`) cumpre para descoberta de
 * Agent.
 *
 * Responsabilidade reservada: representar um sistema externo (CMS,
 * planilha, documentação de terceiros) do qual KnowledgeDocument
 * poderiam ser sincronizados automaticamente. Nenhum componente desta
 * Sprint consulta, sincroniza, ou depende de uma KnowledgeSource.
 */
export interface KnowledgeSource {
  id: string;
  description: string;
}
