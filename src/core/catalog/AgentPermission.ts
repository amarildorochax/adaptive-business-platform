/**
 * Contrato de permissões de Agent futuro (Tarefa 10 — não implementado
 * nesta Sprint). Nenhum componente desta Sprint restringe quem pode
 * registrar, atualizar, remover, ou selecionar um Agent — todo método
 * público de AgentCatalog/AgentCapabilityRegistry está aberto a
 * qualquer chamador.
 *
 * Responsabilidade reservada: declarar quais ações um "solicitante"
 * (identidade ainda não modelada nesta plataforma) pode realizar sobre
 * um AgentProfile específico. Nenhum componente desta Sprint cria, lê,
 * ou aplica uma AgentPermission.
 */
export interface AgentPermission {
  agentId: string;
  action: "register" | "update" | "remove" | "select";
  allowed: boolean;
}
