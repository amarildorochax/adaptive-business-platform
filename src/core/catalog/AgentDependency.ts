/**
 * Contrato de dependência entre Agents futuro (Tarefa 10 — não
 * implementado nesta Sprint). Nenhum componente desta Sprint impede,
 * ou sequer verifica, que um Agent seja selecionado independentemente
 * de outro.
 *
 * Responsabilidade reservada: declarar que um Agent só deve ser
 * selecionável quando outro(s) já estiverem disponíveis/operacionais.
 * Nenhum componente desta Sprint cria, lê, ou aplica um
 * AgentDependency.
 */
export interface AgentDependency {
  agentId: string;
  dependsOnAgentIds: string[];
}
