/**
 * Contrato de política de execução de Agent futuro (Tarefa 10 — não
 * implementado nesta Sprint). `AgentSelector` hoje seleciona
 * exclusivamente por `taskType` + disponibilidade + prioridade — nenhum
 * limite de uso, custo, ou horário é considerado.
 *
 * Responsabilidade reservada: restringir quando/quanto um Agent pode
 * ser selecionado (ex.: limite de execuções por hora, orçamento
 * máximo). Nenhum componente desta Sprint cria, lê, ou aplica uma
 * AgentExecutionPolicy.
 */
export interface AgentExecutionPolicy {
  agentId: string;
  maxExecutionsPerHour?: number;
  maxCostPerExecution?: number;
}
