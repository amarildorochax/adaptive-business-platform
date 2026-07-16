// Artifact produced by a squad run
export interface Artifact {
  name: string;
  path: string;   // relative to squad output run folder
  type: "video" | "image" | "markdown" | "data" | "pdf" | "text" | "file";
  size: number;   // bytes
}

// state.json structure — matches Pipeline Runner output
export interface AgentDesk {
  col: number;
  row: number;
}

export type AgentStatus =
  | "idle"
  | "working"
  | "delivering"
  | "done"
  | "checkpoint";

export interface Agent {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  deliverTo: string | null;
  desk: AgentDesk;
}

export interface Handoff {
  from: string;
  to: string;
  message: string;
  completedAt: string;
}

export type SquadStatus =
  | "idle"
  | "running"
  | "completed"
  | "checkpoint";

export interface LogEntry {
  ts: string;      // ISO timestamp
  agent: string;   // agent id or "system"
  msg: string;     // message text
}

export interface SquadState {
  squad: string;
  status: SquadStatus;
  step: {
    current: number;
    total: number;
    label: string;
  };
  agents: Agent[];
  handoff: Handoff | null;
  startedAt: string | null;
  updatedAt: string;
  log?: LogEntry[];          // activity feed — appended by runner each update
  artifacts?: Artifact[];   // injected by watcher from output/ folder
}

// Squad metadata from squad.yaml
export interface SquadInfo {
  code: string;
  name: string;
  description: string;
  icon: string;
  agents: string[]; // agent file paths
}

// WebSocket messages
export type WsMessage =
  | { type: "SNAPSHOT"; squads: SquadInfo[]; activeStates: Record<string, SquadState> }
  | { type: "SQUAD_ACTIVE"; squad: string; state: SquadState }
  | { type: "SQUAD_UPDATE"; squad: string; state: SquadState }
  | { type: "SQUAD_INACTIVE"; squad: string };
