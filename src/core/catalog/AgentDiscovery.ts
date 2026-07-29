/**
 * Contrato de descoberta dinâmica de Agent futuro (Tarefa 10 — não
 * implementado nesta Sprint). `AgentCatalog` hoje só conhece Agents já
 * presentes em `agentStore` no momento de sua própria construção (ver
 * `AgentCatalog.seed()`) — nenhum mecanismo observa novos Agents
 * registrados depois disso, nem descobre Agents externos.
 *
 * Responsabilidade reservada: declarar uma fonte externa (rede, plugin,
 * outro serviço) da qual novos AgentProfile poderiam ser descobertos e
 * registrados automaticamente. Nenhum componente desta Sprint cria, lê,
 * ou consulta uma AgentDiscoverySource.
 */
export interface AgentDiscoverySource {
  id: string;
  description: string;
}
