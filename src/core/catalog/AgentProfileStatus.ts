/**
 * Estado de um AgentProfile dentro do catálogo — distinto de
 * `AgentStatus` (`@/core/agents/registry/AgentStatus`, inalterado), que
 * descreve o estado de trabalho em tempo real de um Agent (OFFLINE/
 * IDLE/WORKING/...). `AgentProfileStatus` descreve se o perfil está
 * habilitado a ser selecionado — um Agent pode estar `IDLE`
 * (AgentStatus) mas `INACTIVE`/`DEPRECATED` (AgentProfileStatus), e
 * portanto nunca selecionável.
 */
export enum AgentProfileStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DEPRECATED = "deprecated",
}
