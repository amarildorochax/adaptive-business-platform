/**
 * Contrato de listagem de marketplace de prompts futuro (Tarefa 11 —
 * não implementado nesta Sprint; nenhuma integração externa criada).
 *
 * Responsabilidade reservada: representar um PromptTemplate oferecido
 * para descoberta/reuso por terceiros. Nenhum componente desta Sprint
 * publica, lista, ou consome uma PromptMarketplaceListing.
 */
export interface PromptMarketplaceListing {
  id: string;
  templateId: string;
  author: string;
  price?: number;
  publishedAt: Date;
}
