/**
 * Contrato futuro (Tarefa 10) — apenas interface, nunca implementado
 * nesta Sprint. Reserva o formato de um provedor de publicação em redes
 * sociais — nenhuma integração externa é feita nesta Sprint.
 */
export interface SocialMediaProvider {
  publish(platform: string, content: string): Promise<void>;
}
