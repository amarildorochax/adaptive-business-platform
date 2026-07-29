/** Estados possíveis de um Agent, gerenciados por AgentStatusManager/AgentStore. */
export enum AgentStatus {
  OFFLINE = "offline",
  IDLE = "idle",
  WORKING = "working",
  WAITING = "waiting",
  PAUSED = "paused",
  ERROR = "error",
}
